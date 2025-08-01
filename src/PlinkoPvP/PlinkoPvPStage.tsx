import React from 'react';
import { PlinkoPvPStageProps } from './PlinkoPvPAPI';
import { usePinkoStage } from '../hooks/usePinkoStage';

import { Layer, Stage } from 'react-konva';
import { PulsingPegs } from './Nodes/Pegs';
import { PlayingSector } from './Nodes/PlayingSector';
import Ball from './Nodes/Ball';

export const PlinkoPvPStage: React.FC<PlinkoPvPStageProps> = (props) => {
  const { glowingPegs, allPegs, physicsState, currentBall, ballRef } =
    usePinkoStage(props);

  return (
    <Stage width={props.dimensions.width} height={props.dimensions.height}>
      <Layer>
        <PulsingPegs
          allPegs={allPegs}
          glowingPegs={glowingPegs}
          radius={physicsState.pegRadiusLive * 2}
        />
        <Ball
          ref={ballRef}
          radius={physicsState.ballRadiusLive}
          giftId={currentBall?.giftId}
        />
        {props.playersSectors.map((sector) => (
          <PlayingSector
            {...sector}
            period={props.animation?.bounce ?? 0}
            canvasHeight={props.dimensions.height}
            isJumping={
              props.boardState === 'round' &&
              !props.externalIsRunning &&
              props.currentBall?.winnerId === sector.player.id
            }
          />
        ))}
      </Layer>
    </Stage>
  );
};
