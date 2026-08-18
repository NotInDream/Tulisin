import { useCallback, useRef, useState } from "react";

export function useAudioSync() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const rangeEndRef = useRef<number | null>(null);

  const handleTimeUpdate = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;
    setCurrentTime(element.currentTime);
    if (rangeEndRef.current !== null && element.currentTime >= rangeEndRef.current) {
      element.pause();
      rangeEndRef.current = null;
    }
  }, []);

  const seek = useCallback((time: number) => {
    const element = audioRef.current;
    if (!element) return;
    rangeEndRef.current = null;
    element.currentTime = time;
    void element.play();
  }, []);

  const playRange = useCallback((start: number, end: number) => {
    const element = audioRef.current;
    if (!element) return;
    rangeEndRef.current = end > start ? end : null;
    element.currentTime = start;
    void element.play();
  }, []);

  return { audioRef, currentTime, onTimeUpdate: handleTimeUpdate, seek, playRange };
}
