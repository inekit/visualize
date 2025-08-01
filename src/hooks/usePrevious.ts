import { useRef } from 'react';

export default function usePrevious(value: unknown, forceChange?: boolean) {
  const currentRef = useRef(value);
  const previousRef = useRef<unknown>();
  if (currentRef.current !== value || forceChange) {
    (previousRef as unknown as { current: unknown }).current =
      currentRef.current;
    currentRef.current = value;
  }
  return previousRef.current;
}
