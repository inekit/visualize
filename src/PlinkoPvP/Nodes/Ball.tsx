import { Group, Image as KonvaImage } from 'react-konva';
import BallSvg from '../images/Ball.svg';
import React, { forwardRef } from 'react';
import { Group as Grp } from 'konva/lib/Group';
import { useGiftImage } from '../hooks/useGiftImage';

export default React.memo(
  forwardRef<
    Grp,
    {
      giftUrl: string | undefined;
      giftId: string | undefined;
      radius: number;
    }
  >(function Ball({ giftId, radius, giftUrl }, ballRef) {
    const balImg = new Image();
    balImg.src = BallSvg;

    const { img: giftImg } = useGiftImage({ giftId, giftUrl });

    return (
      <Group ref={ballRef} opacity={0}>
        <KonvaImage
          image={balImg}
          width={radius * 4}
          height={radius * 4}
          offset={{
            x: radius * 2,
            y: radius * 2,
          }}
        />
        {giftImg && (
          <KonvaImage
            image={giftImg}
            width={radius}
            height={radius}
            cornerRadius={100}
            offset={{
              x: radius / 2,
              y: radius / 2,
            }}
          />
        )}
      </Group>
    );
  }),
);
