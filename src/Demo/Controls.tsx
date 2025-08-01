import React from 'react';
import { PhysicsState, DefaultParams } from '../PlinkoPvP/ConstaintsTypes';

interface ControlsProps {
  physicsState: PhysicsState;
  onPhysicsStateChange: (updates: Partial<PhysicsState>) => void;
  onResetParameters: () => void;
  defaultParams: DefaultParams;
}

export const Controls: React.FC<ControlsProps> = ({
  physicsState,
  onPhysicsStateChange,
  onResetParameters,
  defaultParams,
}) => {
  const handleMagnetForceChange = (value: number) => {
    if (isNaN(value) || value < 1 || value > 100) return;
    onPhysicsStateChange({ magnetForce: value });
  };

  const handleGravityChange = (value: number) => {
    if (isNaN(value) || value < 0 || value > 30) return;
    onPhysicsStateChange({ gravity: value });
  };

  const handleRestitutionBallChange = (value: number) => {
    if (isNaN(value) || value < 0 || value > 1) return;
    onPhysicsStateChange({ restitutionBall: value });
  };

  const handleFrictionBallChange = (value: number) => {
    if (isNaN(value) || value < 0 || value > 1) return;
    onPhysicsStateChange({ frictionBall: value });
  };

  return (
    <div
      style={{
        minWidth: '280px',
        background: '#f8f9fa',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        height: 'fit-content',
        maxHeight: 600,
        overflowY: 'auto',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
        Controls
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          <label
            style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            <span
              style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}
            >
              Magnet: {physicsState.magnetForce.toFixed(1)}
            </span>
            <input
              type="range"
              min={1}
              max={100}
              step={0.1}
              value={physicsState.magnetForce}
              onChange={(e) => handleMagnetForceChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </label>
          <label
            style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            <span
              style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}
            >
              Gravity: {physicsState.gravity.toFixed(1)}
            </span>
            <input
              type="range"
              min={0}
              max={30}
              step={0.1}
              value={physicsState.gravity}
              onChange={(e) => handleGravityChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          <label
            style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            <span
              style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}
            >
              Bounce: {physicsState.restitutionBall.toFixed(2)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={physicsState.restitutionBall}
              onChange={(e) =>
                handleRestitutionBallChange(Number(e.target.value))
              }
              style={{ width: '100%' }}
            />
          </label>
          <label
            style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            <span
              style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}
            >
              Friction: {physicsState.frictionBall.toFixed(2)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={physicsState.frictionBall}
              onChange={(e) => handleFrictionBallChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          <label
            style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            <span
              style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}
            >
              Ball: {physicsState.ballRadiusLive.toFixed(1)}px
            </span>
            <input
              type="range"
              min={8}
              max={15}
              step={0.5}
              value={physicsState.ballRadiusLive}
              onChange={(e) =>
                onPhysicsStateChange({ ballRadiusLive: Number(e.target.value) })
              }
              style={{ width: '100%' }}
            />
          </label>
          <label
            style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            <span
              style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}
            >
              Peg: {physicsState.pegRadiusLive.toFixed(1)}px
            </span>
            <input
              type="range"
              min={4}
              max={10}
              step={0.5}
              value={physicsState.pegRadiusLive}
              onChange={(e) =>
                onPhysicsStateChange({ pegRadiusLive: Number(e.target.value) })
              }
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div
          style={{
            borderTop: '1px solid #dee2e6',
            paddingTop: '8px',
            marginTop: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px',
            }}
          >
            <input
              type="checkbox"
              checked={physicsState.useMagneticField}
              onChange={(e) =>
                onPhysicsStateChange({ useMagneticField: e.target.checked })
              }
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              Strong magnetic field (magnet always works)
            </span>
          </div>
          {physicsState.useMagneticField && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#333',
                  }}
                >
                  Intensity: {physicsState.fieldStrength.toFixed(2)}
                </span>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={physicsState.fieldStrength}
                  onChange={(e) =>
                    onPhysicsStateChange({
                      fieldStrength: Number(e.target.value),
                    })
                  }
                  style={{ width: '100%' }}
                />
              </label>
            </div>
          )}

          {physicsState.useMagneticField && (
            <div
              style={{
                borderTop: '1px solid #dee2e6',
                paddingTop: '8px',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '6px',
                }}
              >
                Fine-tuning Settings:
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#333',
                    }}
                  >
                    Gradual Power: {physicsState.gradualPower.toFixed(1)}
                  </span>
                  <input
                    type="range"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={physicsState.gradualPower}
                    onChange={(e) =>
                      onPhysicsStateChange({
                        gradualPower: Number(e.target.value),
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </label>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#333',
                    }}
                  >
                    Horizontal Ratio: {physicsState.horizontalRatio.toFixed(2)}
                  </span>
                  <input
                    type="range"
                    min={0.7}
                    max={1.0}
                    step={0.05}
                    value={physicsState.horizontalRatio}
                    onChange={(e) =>
                      onPhysicsStateChange({
                        horizontalRatio: Number(e.target.value),
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </label>
              </div>
            </div>
          )}

          <div
            style={{
              borderTop: '1px solid #dee2e6',
              paddingTop: '8px',
              marginTop: '8px',
            }}
          >
            <label
              style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              <span
                style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}
              >
                Speed: {physicsState.animationSpeed.toFixed(1)}x
              </span>
              <input
                type="range"
                min={0.1}
                max={3.0}
                step={0.1}
                value={physicsState.animationSpeed}
                onChange={(e) =>
                  onPhysicsStateChange({
                    animationSpeed: Number(e.target.value),
                  })
                }
                style={{ width: '100%' }}
              />
            </label>
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#e9ecef',
          padding: '8px',
          borderRadius: '6px',
          marginTop: '12px',
          fontSize: '11px',
          color: '#666',
          border: '1px solid #dee2e6',
        }}
      >
        <strong>Fine-tuning:</strong> Gradual Power (smoothness), Horizontal
        Ratio (naturalness)
        <br />
        <strong>Magnet Force:</strong> Overall attraction strength
        <br />
        <strong>Field Strength:</strong> Magnetic field intensity multiplier
        <br />
        <strong>Deterministic:</strong> Same settings = same result every time!
        🎯
      </div>
    </div>
  );
};
