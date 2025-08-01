import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PlinkoPvPStageProps } from '../PlinkoPvP/PlinkoPvPAPI';
import { PEG_GLOW_INTERVAL, ROWS } from '../PlinkoPvP/constants';
import { Group as Grp } from 'konva/lib/Group';

import { usePhysicsEngine } from './usePhysicsEngine';
import { PhysicsState, Target } from '../PlinkoPvP/ConstaintsTypes';
import {
  DEFAULT_PARAMS,
  MAGNET_BOTTOM_OFFSET,
  BALL_RADIUS,
  PEG_RADIUS,
} from '../PlinkoPvP/constants';

export const usePinkoStage = (props: PlinkoPvPStageProps) => {
  const { initialTargetX, externalIsRunning, currentBall } = props;
  const { width: WIDTH, height: HEIGHT } = props.dimensions;
  const PEG_OFFSET_X = WIDTH / (9 + 1);

  // Состояния
  const [glowingPegs, setGlowingPegs] = useState<number | null>(null);
  const pegGlowIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [running, setRunning] = useState(false);

  // --- Magnet ---
  const [target, setTarget] = useState<Target>({
    x: initialTargetX ?? WIDTH / 2 + PEG_OFFSET_X / 2,
    y: HEIGHT - MAGNET_BOTTOM_OFFSET,
  });

  // --- Control parameters ---
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    magnetForce: DEFAULT_PARAMS.magnetForce,
    gravity: DEFAULT_PARAMS.gravity,
    restitutionBall: DEFAULT_PARAMS.restitutionBall,
    frictionBall: DEFAULT_PARAMS.frictionBall,
    ballRadiusLive: BALL_RADIUS,
    pegRadiusLive: PEG_RADIUS,
    useMagneticField: true,
    fieldStrength: 0.8,
    animationSpeed: 1.0,
    gradualPower: 1.0,
    horizontalRatio: 1.0,
  });

  useEffect(() => {
    setTarget((t) => ({
      x: initialTargetX ?? WIDTH / 2 + PEG_OFFSET_X / 2,
      y: t.y,
    }));
  }, [PEG_OFFSET_X, WIDTH, initialTargetX]);

  useEffect(() => {
    setTarget((t) => ({ x: t.x, y: HEIGHT - MAGNET_BOTTOM_OFFSET }));
  }, [HEIGHT]);

  // Синхронизируем с внешним состоянием
  useEffect(() => {
    if (externalIsRunning !== undefined) {
      setRunning(externalIsRunning);
    }
  }, [externalIsRunning]);

  // Применяем внешние настройки физики
  useEffect(() => {
    if (props.physicsSettings) {
      setPhysicsState((prev) => ({ ...prev, ...props.physicsSettings }));
    }
  }, [props.physicsSettings]);

  const { onRunningChange, onBallAnimationComplete } = props;

  const ballRef = useRef<Grp | null>(null);

  const { allPegs } = usePhysicsEngine({
    dimensions: props.dimensions,
    physicsState,
    target,
    running,
    onRunningChange,
    onBallLanded: () => {
      onBallAnimationComplete && onBallAnimationComplete();
    },
    ballRef,
    resetKey: props.resetKey,
    boardState: props.boardState,
    magnetTime: props.animation?.magnet ?? 0,
  });

  // Демо-режим: мерцающие точки
  useEffect(() => {
    if (props.boardState === 'waiting') {
      pegGlowIntervalRef.current = setInterval(() => {
        setGlowingPegs(Math.floor(Math.random() * (ROWS - 3)) + 3);
      }, PEG_GLOW_INTERVAL);
    } else {
      if (pegGlowIntervalRef.current) {
        clearInterval(pegGlowIntervalRef.current);
        pegGlowIntervalRef.current = null;
      }
      setGlowingPegs(null);
    }

    return () => {
      if (pegGlowIntervalRef.current) {
        clearInterval(pegGlowIntervalRef.current);
      }
    };
  }, [props.boardState]);

  return {
    glowingPegs,
    allPegs,
    physicsState,
    currentBall,
    ballRef,
  };
};
