import React, { useEffect, useRef } from 'react';
import { PlayerSector } from '../PlinkoPvPAPI';
import { SECTOR_HEIGHT } from '../constants';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import { Group as Grp } from 'konva/lib/Group';
import { useImage } from '../hooks/useImage';
import Konva from 'konva';

export const PlayingSector: React.FC<
  PlayerSector & { period: number; canvasHeight: number }
> = React.memo((props) => {
  const { img } = useImage({ link: props.player.avatarUrl });
  const groupRef = useRef<Grp | null>(null);

  useEffect(() => {
    let anim: Konva.Animation | null;
    if (props.isJumping) {
      const amplitude = -3;

      anim = new Konva.Animation(function (frame) {
        groupRef.current!.y(
          amplitude * Math.sin((frame!.time * 2 * Math.PI) / props.period) +
            props.canvasHeight -
            SECTOR_HEIGHT,
        );
      }, groupRef.current?.parent);
      anim.start();
      setTimeout(() => {
        anim?.stop();
      }, props.period);
    }
    return () => {
      anim?.stop();
      groupRef.current?.y(props.canvasHeight - SECTOR_HEIGHT);
    };
  }, [props.isJumping, props.period, props.canvasHeight]);
  return (
    <Group
      ref={groupRef}
      x={props.x}
      width={props.width}
      height={SECTOR_HEIGHT}
      y={props.canvasHeight - SECTOR_HEIGHT}
    >
      <Rect
        width={props.width}
        height={SECTOR_HEIGHT}
        fill={props.player.color}
      />
      {img && props.width >= 24 ? (
        <KonvaImage
          image={img}
          width={20}
          height={20}
          x={props.width / 2 - 10}
          y={2}
          cornerRadius={10}
        />
      ) : (
        <></>
      )}
    </Group>
  );
});
