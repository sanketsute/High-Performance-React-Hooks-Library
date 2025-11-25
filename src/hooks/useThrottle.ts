import { useState, useEffect, useRef } from 'react';


export const useThrottle =<T>(value: T, interval: number = 500): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= interval) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const timerId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, interval - timeSinceLastUpdate);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}