export interface Dimensions {
  width: number;
  height: number;
}

export interface Target {
  x: number;
  y: number;
}

export interface PhysicsConstants {
  MIN_DISTANCE: number;
  DISTANCE_OFFSET: number;
  BASE_FORCE_MULTIPLIER: number;
  STRONG_FORCE_MULTIPLIER: number;
  WEAK_FORCE_MULTIPLIER: number;
  VERTICAL_COMPONENT_MULTIPLIER: number;
  HORIZONTAL_RATIO_DEFAULT: number;
  GRADUAL_POWER_DEFAULT: number;
  STUCK_THRESHOLD: number;
  STUCK_COUNTER_LIMIT: number;
  STUCK_PUSH_DISTANCE: number;
  STUCK_VELOCITY: number;
  SLOW_SPEED_THRESHOLD: number;
  EMERGENCY_SPEED_THRESHOLD: number;
  DOWNWARD_FORCE: number;
  EMERGENCY_FORCE: number;
  RANDOM_FORCE_MAGNITUDE: number;
  RANDOM_FORCE_FREQUENCY: number;
}

export interface DefaultParams {
  magnetForce: number;
  gravity: number;
  restitutionBall: number;
  frictionBall: number;
  densityBall: number;
  restitutionPeg: number;
  frictionPeg: number;
  timeStep: number;
  smoothness: number;
  timeScale: number;
}

export interface PhysicsState {
  magnetForce: number;
  gravity: number;
  restitutionBall: number;
  frictionBall: number;
  ballRadiusLive: number;
  pegRadiusLive: number;
  useMagneticField: boolean;
  fieldStrength: number;
  animationSpeed: number;
  gradualPower: number;
  horizontalRatio: number;
}

export interface MousePosition {
  x: number;
  y: number;
}
