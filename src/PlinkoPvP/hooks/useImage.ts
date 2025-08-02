import React, { useEffect, useState } from 'react';

export function useImage({ link }: { link?: string }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!link) {
      setImg(null);
      return;
    }

    // Проверяем доступность картинки (опционально)
    fetch(link, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          const img = new Image();
          img.src = link;
          setImg(img);
          setError(null);
        } else {
          setImg(null);
          setError('Изображение не найдено');
        }
      })
      .catch(() => {
        setImg(null);
        setError('Ошибка загрузки');
      });
  }, [link]);

  return { error, img };
}
