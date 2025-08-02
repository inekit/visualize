import { useImage } from './useImage';

export function useGiftImage({
  giftId,
  giftUrl,
}: {
  giftId?: string;
  giftUrl?: string;
}) {
  return useImage({
    link:
      giftUrl ??
      (giftId ? `https://api.changes.tg/original/${giftId}.png` : undefined),
  });
}
