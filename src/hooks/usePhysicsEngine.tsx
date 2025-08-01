import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  RefObject,
} from 'react';
import * as planck from 'planck-js';
import {
  PhysicsState,
  Target,
  Dimensions,
  PhysicsConstants,
} from '../PlinkoPvP/ConstaintsTypes';
import {
  PHYSICS_CONSTANTS,
  DEFAULT_PARAMS,
  ROWS,
  COLS,
  MAGNET_BOTTOM_OFFSET,
} from '../PlinkoPvP/constants';
import { Group } from 'konva/lib/Group';
import { BoardState } from '../PlinkoPvP/PlinkoPvPAPI';
import { BASE_SCALE } from '../PlinkoPvP/constants';

const { World, Vec2 } = planck;

interface PhysicsEngineProps {
  dimensions: Dimensions;
  physicsState: PhysicsState;
  target: Target;
  running: boolean;
  resetKey?: number;
  onRunningChange?: (running: boolean) => void;
  onBallLanded?: () => void;
  ballRef: RefObject<Group | null>;
  boardState: BoardState;
  magnetTime: number;
}

export const usePhysicsEngine = ({
  dimensions,
  physicsState: physicsStateInitial,
  target,
  running,
  resetKey,
  onRunningChange,
  ballRef,
  onBallLanded,
  boardState,
  magnetTime,
}: PhysicsEngineProps) => {
  const worldRef = useRef<planck.World | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const targetRef = useRef(target);
  const pegContactsRef = useRef(new Set<number>());
  const pegBlinkTimesRef = useRef(new Map<number, number>());

  const { width: WIDTH, height: HEIGHT } = dimensions;
  const SCALE = WIDTH / (WIDTH / 50);
  const PEG_OFFSET_X = WIDTH / (COLS + 1);
  const PEG_OFFSET_Y = HEIGHT / (ROWS + 2);
  const PEG_START_Y = PEG_OFFSET_Y * 2;

  const activeBall = useRef<planck.Body | null>(null);
  const allPegs = useRef<planck.Body[]>([]);

  // Update ref when target changes
  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  // Helper functions for magnetic attraction
  const getPegId = useCallback((row: number, col: number): number => {
    return row * COLS + col;
  }, []);

  const calculateFallProgress = useCallback(
    (ballPos: planck.Vec2): number => {
      const ballHeightFromTop = ballPos.y * SCALE;
      const totalFallDistance = HEIGHT - 40;
      return Math.max(0, Math.min(1, ballHeightFromTop / totalFallDistance));
    },
    [HEIGHT, SCALE],
  );

  const applyMagneticForce = useCallback(
    (
      ball: planck.Body,
      targetWorld: planck.Vec2,
      ballPos: planck.Vec2,
      baseForce: number,
      gradualMultiplier: number,
      horizontalRatio: number,
    ): void => {
      const toTarget = Vec2.sub(targetWorld, ballPos);
      const distance = toTarget.length();

      if (distance > PHYSICS_CONSTANTS.MIN_DISTANCE) {
        const forceMagnitude = baseForce * gradualMultiplier;
        const force = toTarget
          .clone()
          .mul(forceMagnitude / (distance + PHYSICS_CONSTANTS.DISTANCE_OFFSET));

        force.x *= horizontalRatio;
        force.y *=
          (1 - horizontalRatio) *
          PHYSICS_CONSTANTS.VERTICAL_COMPONENT_MULTIPLIER;

        ball.applyForceToCenter(force, true);
      }
    },
    [SCALE],
  );

  const applyAntiStickingForces = useCallback(
    (
      ball: planck.Body,
      speed: number,
      deterministicCounter: number,
    ): number => {
      if (speed < PHYSICS_CONSTANTS.SLOW_SPEED_THRESHOLD) {
        const downwardForce = Vec2(0, PHYSICS_CONSTANTS.DOWNWARD_FORCE);
        ball.applyForceToCenter(downwardForce, true);
      }

      if (speed < PHYSICS_CONSTANTS.EMERGENCY_SPEED_THRESHOLD) {
        const emergencyForce = Vec2(0, PHYSICS_CONSTANTS.EMERGENCY_FORCE);
        ball.applyForceToCenter(emergencyForce, true);

        const deterministicX =
          Math.sin(
            deterministicCounter * PHYSICS_CONSTANTS.RANDOM_FORCE_FREQUENCY,
          ) * PHYSICS_CONSTANTS.RANDOM_FORCE_MAGNITUDE;
        const deterministicForce = Vec2(deterministicX, 0);
        ball.applyForceToCenter(deterministicForce, true);
      }

      return deterministicCounter + 1;
    },
    [],
  );

  const phs = useRef<PhysicsState>(physicsStateInitial);
  const physicsState = phs.current;

  useEffect(() => {
    if (boardState === 'single' || boardState === 'multi') {
      worldRef.current?.setGravity(Vec2(0, physicsState.gravity * 2));
    }
  }, [boardState]);

  useEffect(() => {
    if (!running) {
      ballRef.current?.to({ opacity: 0 });
      return;
    }

    // --- 1. Setup Planck.js world ---
    const world = World({ gravity: Vec2(0, physicsState.gravity) });
    worldRef.current = world;
    world.setGravity(Vec2(0, physicsState.gravity));

    const createBall = () => {
      const ball = world.createBody({
        type: 'dynamic',
        position: Vec2(WIDTH / 2 / BASE_SCALE, 40 / BASE_SCALE),
        linearDamping: DEFAULT_PARAMS.smoothness,
        bullet: true,
      });
      activeBall.current = ball;

      ball.setLinearDamping(DEFAULT_PARAMS.smoothness);

      const ballFixture = ball.getFixtureList();
      if (ballFixture) {
        ballFixture.setRestitution(physicsState.restitutionBall);
        ballFixture.setFriction(physicsState.frictionBall);
      }

      ball.createFixture(planck.Circle(physicsState.ballRadiusLive / SCALE), {
        density: DEFAULT_PARAMS.densityBall,
        restitution: physicsState.restitutionBall,
        friction: physicsState.frictionBall,
      });

      ball.setBullet(true);
      return ball;
    };
    const ball = createBall();

    const createGround = () => {
      const ground = world.createBody();
      // Floor
      ground.createFixture(
        planck.Edge(
          Vec2(0, (HEIGHT - physicsState.ballRadiusLive - 5) / SCALE),
          Vec2(
            WIDTH / SCALE,
            (HEIGHT - physicsState.ballRadiusLive - 5) / SCALE,
          ),
        ),
        { restitution: physicsState.restitutionBall },
      );
      ground.createFixture(planck.Edge(Vec2(0, 0), Vec2(0, HEIGHT / SCALE)), {
        restitution: 0.2,
      });
      ground.createFixture(
        planck.Edge(
          Vec2(WIDTH / SCALE, 0),
          Vec2(WIDTH / SCALE, HEIGHT / SCALE),
        ),
        { restitution: 0.2 },
      );
    };
    createGround();

    const createPegs = () => {
      const pegs: planck.Body[] = [];
      const pegIds: number[] = [];

      const ballSpaceX = WIDTH / 10;
      const ballSpaceY = HEIGHT / 11;

      for (let row = 0; row < ROWS; row++) {
        const countInRow = COLS - Math.abs(ROWS - 1 - row);

        if (countInRow < 3) continue;
        const offsetX = (WIDTH - countInRow * ballSpaceX) / 2 - ballSpaceX / 2;
        for (let i = 0; i < countInRow; i++) {
          const x = offsetX + i * ballSpaceX + ballSpaceX;
          const y = -70 + row * ballSpaceY;

          const pegId = getPegId(row, i);
          const peg = world.createBody({
            type: 'static',
            position: Vec2(x / SCALE, y / SCALE),
          });
          peg.createFixture(planck.Circle(physicsState.pegRadiusLive / SCALE), {
            density: 0,
            restitution: physicsState.restitutionBall,
            friction: DEFAULT_PARAMS.frictionPeg,
            userData: { pegId },
          });
          pegs.push(peg);
          pegIds.push(pegId);
        }
      }

      allPegs.current = pegs;
      return pegs;
    };
    const pegs = createPegs();

    // --- 5. Contact handling for peg blinking ---
    world.on('begin-contact', (contact) => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();

      const ballFixture = ball.getFixtureList();
      if (fixtureA === ballFixture || fixtureB === ballFixture) {
        const pegFixture = fixtureA === ballFixture ? fixtureB : fixtureA;
        const userData = pegFixture.getUserData() as { pegId?: number };

        if (userData?.pegId !== undefined) {
          const pegId = userData.pegId;
          pegContactsRef.current.add(pegId);
          pegBlinkTimesRef.current.set(pegId, performance.now());
        }
      }
    });

    world.on('end-contact', (contact) => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();

      const ballFixture = ball.getFixtureList();
      if (fixtureA === ballFixture || fixtureB === ballFixture) {
        const pegFixture = fixtureA === ballFixture ? fixtureB : fixtureA;
        const userData = pegFixture.getUserData() as { pegId?: number };

        if (userData?.pegId !== undefined) {
          const pegId = userData.pegId;
          pegContactsRef.current.delete(pegId);
        }
      }
    });

    let lastTime = 0;
    let accumulator = 0;
    const timeStepLocal = DEFAULT_PARAMS.timeStep;
    let stopped = false;

    let lastGravity = physicsState.gravity;
    let lastRestitution = physicsState.restitutionBall;
    let lastFriction = physicsState.frictionBall;
    const lastBallRadius = physicsState.ballRadiusLive;
    const lastPegRadius = physicsState.pegRadiusLive;
    let lastFieldStrength = physicsState.fieldStrength;

    let lastY = 0;
    let stuckCounter = 0;
    let deterministicCounter = 0;

    let landed = false;

    function stepPhysics(dt: number): void {
      if (world === null) return;

      if (lastGravity !== physicsState.gravity) {
        world.setGravity(Vec2(0, physicsState.gravity));
        lastGravity = physicsState.gravity;
      }

      if (
        lastRestitution !== physicsState.restitutionBall ||
        lastFriction !== physicsState.frictionBall ||
        lastFieldStrength !== physicsState.fieldStrength
      ) {
        ball.setLinearDamping(DEFAULT_PARAMS.smoothness);

        const ballFixture = ball.getFixtureList();
        if (ballFixture) {
          ballFixture.setRestitution(physicsState.restitutionBall);
          ballFixture.setFriction(physicsState.frictionBall);
        }

        pegs.forEach((peg) => {
          const pegFixture = peg.getFixtureList();
          if (pegFixture) {
            pegFixture.setRestitution(physicsState.restitutionBall);
            pegFixture.setFriction(DEFAULT_PARAMS.frictionPeg);
          }
        });

        lastRestitution = physicsState.restitutionBall;
        lastFriction = physicsState.frictionBall;
        lastFieldStrength = physicsState.fieldStrength;
      }

      if (
        lastBallRadius !== physicsState.ballRadiusLive ||
        lastPegRadius !== physicsState.pegRadiusLive
      ) {
        stopped = true;
        return;
      }

      accumulator +=
        dt * DEFAULT_PARAMS.timeScale * physicsState.animationSpeed;
      while (accumulator > timeStepLocal) {
        const ballPos = ball.getPosition();
        const velocity = ball.getLinearVelocity();
        const speed = velocity.length();

        deterministicCounter = applyAntiStickingForces(
          ball,
          speed,
          deterministicCounter,
        );

        const currentY = ballPos.y * SCALE;
        if (Math.abs(currentY - lastY) < PHYSICS_CONSTANTS.STUCK_THRESHOLD) {
          stuckCounter++;
          if (stuckCounter > PHYSICS_CONSTANTS.STUCK_COUNTER_LIMIT) {
            ball.setPosition(
              Vec2(
                ballPos.x,
                ballPos.y + PHYSICS_CONSTANTS.STUCK_PUSH_DISTANCE / SCALE,
              ),
            );
            ball.setLinearVelocity(Vec2(0, PHYSICS_CONSTANTS.STUCK_VELOCITY));
            stuckCounter = 0;
          }
        } else {
          stuckCounter = 0;
        }
        lastY = currentY;

        const targetWorld = Vec2(
          targetRef.current.x / SCALE,
          targetRef.current.y / SCALE,
        );

        if (physicsState.useMagneticField) {
          if (ballPos.y * SCALE > HEIGHT - MAGNET_BOTTOM_OFFSET - 100) {
            const baseForce =
              physicsState.fieldStrength *
              physicsState.magnetForce *
              PHYSICS_CONSTANTS.STRONG_FORCE_MULTIPLIER;
            applyMagneticForce(ball, targetWorld, ballPos, baseForce, 1, 1);
          }

          const fallProgress = calculateFallProgress(ballPos);
          const baseForce =
            physicsState.fieldStrength *
            physicsState.magnetForce *
            PHYSICS_CONSTANTS.BASE_FORCE_MULTIPLIER;
          const gradualMultiplier = Math.pow(
            fallProgress,
            physicsState.gradualPower,
          );
          applyMagneticForce(
            ball,
            targetWorld,
            ballPos,
            baseForce,
            gradualMultiplier,
            physicsState.horizontalRatio,
          );
        } else {
          if (ballPos.y * SCALE > HEIGHT - MAGNET_BOTTOM_OFFSET - 50) {
            const baseForce = physicsState.magnetForce * 1.0;
            applyMagneticForce(ball, targetWorld, ballPos, baseForce, 1, 1);
          }

          const fallProgress = calculateFallProgress(ballPos);
          const baseForce =
            physicsState.magnetForce * PHYSICS_CONSTANTS.WEAK_FORCE_MULTIPLIER;
          const gradualMultiplier = Math.pow(
            fallProgress,
            PHYSICS_CONSTANTS.GRADUAL_POWER_DEFAULT,
          );
          applyMagneticForce(
            ball,
            targetWorld,
            ballPos,
            baseForce,
            gradualMultiplier,
            PHYSICS_CONSTANTS.HORIZONTAL_RATIO_DEFAULT,
          );
        }

        if (ballPos.y * SCALE > HEIGHT - MAGNET_BOTTOM_OFFSET - 14.5) {
          const toTarget = Vec2.sub(targetWorld, ballPos);
          const distance = toTarget.length();

          // Вызываем callback при приземлении шарика
          setTimeout(() => {
            if (onBallLanded && !landed) {
              landed = true;
              onBallLanded();
            }

            accumulator -= timeStepLocal;
            return;
          }, magnetTime);
        }

        world.step(timeStepLocal);
        accumulator -= timeStepLocal;
      }
    }

    function animate(now: number): void {
      if (stopped) return;

      const fixedDt = 1 / 60;
      lastTime += fixedDt * 1000;

      stepPhysics(fixedDt);
      // Stop if ball reached bottom
      const pos = ball.getPosition();
      ballRef.current?.to({ x: pos.x * 50, y: pos.y * 50, duration: 0 });
      const h = HEIGHT / 70;
      const toBottom = HEIGHT / SCALE - pos.y;

      ballRef.current?.to({
        opacity:
          boardState === 'waiting'
            ? toBottom < 2.5
              ? 0
              : toBottom / (HEIGHT / SCALE)
            : boardState === 'multi' && toBottom < 1
              ? 0
              : 1,
        duration: 0.05,
      });

      if (pos.y * SCALE > HEIGHT - physicsState.ballRadiusLive - 7) {
        onRunningChange && onRunningChange(false);
        stopped = true;
        return;
      }

      animationIdRef.current = requestAnimationFrame(animate);
    }
    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      stopped = true;
      worldRef.current = null;

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [
    resetKey,
    running,
    physicsState,
    WIDTH,
    HEIGHT,
    SCALE,
    getPegId,
    PEG_OFFSET_X,
    PEG_START_Y,
    PEG_OFFSET_Y,
    calculateFallProgress,
    applyMagneticForce,
    applyAntiStickingForces,
    // onBallLanded,
  ]);

  return {
    worldRef,
    activeBall,
    allPegs,
  };
};
