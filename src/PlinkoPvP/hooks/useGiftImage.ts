import React, { useEffect, useState } from 'react';
import { useImage } from './useImage';

export function useGiftImage({ giftId }: { giftId?: string }) {
  return useImage({
    link: giftId ? `https://api.changes.tg/original/${giftId}.png` : undefined,
  });
}
