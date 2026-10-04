import { useCallback, useEffect, useRef, useState } from "react";

const ZEN_DURATION = 25 * 60; // 25 minutes in seconds

export function useZenMode() {
  const [active, setActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(ZEN_DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setActive(true);
    setTimeRemaining(ZEN_DURATION);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
    setTimeRemaining(ZEN_DURATION);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, stop]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress = ((ZEN_DURATION - timeRemaining) / ZEN_DURATION) * 100;

  return { active, timeRemaining, formattedTime: formatTime(timeRemaining), progress, start, stop };
}
