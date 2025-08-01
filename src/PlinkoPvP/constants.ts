import { PhysicsConstants, DefaultParams } from './ConstaintsTypes';

// Константы
export const MAX_WIDTH = 3000;
export const MAX_HEIGHT = 1000;
export const BASE_SCALE = 50;
export const BALL_RADIUS = 16;
export const PEG_RADIUS = 3;
export const ROWS = 11;
export const COLS = 9;
export const MAGNET_BOTTOM_OFFSET = 24;
export const SECTOR_HEIGHT = 24;
export const PEG_GLOW_INTERVAL = 1500;

// Physics constants
export const PHYSICS_CONSTANTS: PhysicsConstants = {
  MIN_DISTANCE: 0.01,
  DISTANCE_OFFSET: 0.1,
  BASE_FORCE_MULTIPLIER: 0.8,
  STRONG_FORCE_MULTIPLIER: 3.0,
  WEAK_FORCE_MULTIPLIER: 0.3,
  VERTICAL_COMPONENT_MULTIPLIER: 0.1,
  HORIZONTAL_RATIO_DEFAULT: 0.9,
  GRADUAL_POWER_DEFAULT: 1.2,
  STUCK_THRESHOLD: 1,
  STUCK_COUNTER_LIMIT: 30,
  STUCK_PUSH_DISTANCE: 0.5,
  STUCK_VELOCITY: 2,
  SLOW_SPEED_THRESHOLD: 2.0,
  EMERGENCY_SPEED_THRESHOLD: 0.1,
  DOWNWARD_FORCE: 10.0,
  EMERGENCY_FORCE: 20.0,
  RANDOM_FORCE_MAGNITUDE: 1.0,
  RANDOM_FORCE_FREQUENCY: 0.1,
};

// Default physics parameters
export const DEFAULT_PARAMS: DefaultParams = {
  magnetForce: 13,
  gravity: 20,
  restitutionBall: 0.1,
  frictionBall: 0.01,
  densityBall: 1.0,
  restitutionPeg: 0.1,
  frictionPeg: 0.01,
  timeStep: 1 / 180,
  smoothness: 0.15,
  timeScale: 1,
};
