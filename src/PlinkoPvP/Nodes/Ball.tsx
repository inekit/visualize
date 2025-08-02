import { Group, Image as KonvaImage } from 'react-konva';
import { useGiftImage } from '../hooks/useGiftImage';
import BallSvg from '../images/Ball.svg';
import React, { forwardRef } from 'react';
import { Group as Grp } from 'konva/lib/Group';

export default React.memo(
  forwardRef<
    Grp,
    {
      giftId: string | undefined;
      radius: number;
    }
  >(function Ball({ giftId, radius }, ballRef) {
    const balImg = new Image();
    balImg.src = BallSvg;

    const { img: giftImg } = useGiftImage({ giftId });

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
            width={50}
            height={50}
            offset={{ x: 25, y: 25 }}
          />
        )}
      </Group>
    );
  }),
);
