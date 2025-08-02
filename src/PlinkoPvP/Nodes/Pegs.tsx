import { Body } from 'planck-js';
import React, { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import PegSvg from '../images/Peg.png';
import { BASE_SCALE, PEG_GLOW_INTERVAL } from '../constants';

export function PulsingPegs({
  allPegs,
  glowingPegs,
  radius,
  canvasHeight,
}: {
  allPegs: React.RefObject<Body[]>;
  glowingPegs: number | null;
  radius: number;
  canvasHeight: number;
}) {
  const pegImg = new Image();
  pegImg.src = PegSvg;
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let start: number;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      const pulseValue =
        (Math.sin((elapsed / PEG_GLOW_INTERVAL) * Math.PI) / 2) * 1.2 + 1;

      setPulse(pulseValue);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <>
      {allPegs.current.map((peg, index) => {
        const rowNumber =
          Math.floor(((peg.getPosition().y * BASE_SCALE) / canvasHeight) * 10) +
          3;
        const isGlowing =
          glowingPegs !== null &&
          (rowNumber === glowingPegs ||
            rowNumber === glowingPegs + 2 ||
            rowNumber === glowingPegs - 2);

        const scale = isGlowing ? pulse : 1;
        return (
          <KonvaImage
            key={index}
            x={peg.getPosition().x * BASE_SCALE}
            y={peg.getPosition().y * BASE_SCALE}
            image={pegImg}
            width={radius * 2}
            height={radius * 2}
            scale={{ x: scale, y: scale }}
            offset={{ x: radius, y: radius }}
          />
        );
      })}
    </>
  );
}
