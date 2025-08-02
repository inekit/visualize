import React, { useCallback } from 'react';
import { PlayerSector, PlinkoPvPProps } from './PlinkoPvPAPI';
import { PlinkoPvPStage } from './PlinkoPvPStage';
import { usePinko } from './hooks/usePinko';
import { CenterLabel } from './CenterLabel/CenterLabel';
import styles from './PinkoPvP.module.scss';

export const PlinkoPvP: React.FC<PlinkoPvPProps> = React.memo((props) => {
  // Настройки физики для разных режимов
  const getPhysicsSettings = useCallback(() => {
    switch (props.boardState) {
      case 'waiting':
        return {
          magnetForce: 5,
          gravity: 15,
          restitutionBall: 0.3,
          frictionBall: 0.05,
          useMagneticField: false,
        };
      case 'single':
        return {
          magnetForce: 20,
          gravity: 18,
          restitutionBall: 0.4,
          frictionBall: 0.03,
          useMagneticField: true,
        };
      case 'multi':
      case 'round':
        return {
          magnetForce: 25,
          gravity: 20,
          restitutionBall: 0.5,
          frictionBall: 0.02,
          useMagneticField: true,
        };
      default:
        return {
          magnetForce: 15,
          gravity: 18,
          restitutionBall: 0.4,
          frictionBall: 0.03,
          useMagneticField: true,
        };
    }
  }, [props.boardState]);

  const physicsSettings = getPhysicsSettings();

  const { boardState, timer, balls } = props;
  const {
    prevPlayerSectors,
    playerSectors,
    resetKey,
    dimensions,
    handleBallComplete,
    currentTargetX,
    currentAnimation,
    isRunning,
    isTail,
    activeBallIndex,
    pinkoRef,
  } = usePinko(props);

  return (
    <div className={styles.plinko} ref={pinkoRef}>
      {boardState !== 'round' && (
        <CenterLabel
          type={
            boardState === 'single' || boardState === 'waiting'
              ? 'wait'
              : 'timer'
          }
          time={timer}
        />
      )}
      <PlinkoPvPStage
        playersSectors={
          isTail && boardState === 'multi' ? prevPlayerSectors : playerSectors
        }
        boardState={boardState}
        currentBall={balls[activeBallIndex]}
        timer={timer}
        physicsSettings={physicsSettings}
        onBallAnimationComplete={handleBallComplete}
        initialTargetX={currentTargetX}
        externalIsRunning={isRunning}
        animation={currentAnimation ?? undefined}
        resetKey={resetKey}
        dimensions={dimensions}
      />

      {/* Наложение с информацией о PvP */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          margin: 'auto',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        {/* Статус игры */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'inline-block',
          }}
        >
          {boardState.toUpperCase()}
          {timer !== undefined && boardState === 'multi' && ` - ${timer}s`}
          {isRunning && ' - АКТИВНО'}
        </div>
      </div>
    </div>
  );
});
