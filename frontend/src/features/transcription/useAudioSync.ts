import { useCallback, useRef, useState } from "react";

export function useAudioSync() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const handleTimeUpdate = useCallback(() => {
    const element = audioRef.current;
    if (element) setCurrentTime(element.currentTime);
  }, []);

  const seek = useCallback((time: number) => {
    const element = audioRef.current;
    if (!element) return;
    element.currentTime = time;
    void element.play();
  }, []);

  return { audioRef, currentTime, onTimeUpdate: handleTimeUpdate, seek };
}
