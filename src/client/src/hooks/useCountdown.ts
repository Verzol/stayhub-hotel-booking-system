import { useState, useEffect, useRef } from 'react';

interface UseCountdownOptions {
  targetDate: Date | string | null;
  onExpire?: () => void;
  interval?: number; // Update interval in ms (default: 1000ms = 1 second)
}

interface CountdownResult {
  timeRemaining: number; // milliseconds
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string; // "MM:SS"
}

/**
 * Custom hook for countdown timer
 * @param targetDate - Target date/time to countdown to
 * @param onExpire - Callback when countdown expires
 * @param interval - Update interval in milliseconds (default: 1000ms)
 * @returns Countdown state and formatted time
 */
export function useCountdown({
  targetDate,
  onExpire,
  interval = 1000,
}: UseCountdownOptions): CountdownResult {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const onExpireRef = useRef(onExpire);

  // Update ref when callback changes
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!targetDate) {
      // Initialize state when targetDate is not provided
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeRemaining(0);
      setIsExpired(true);
      return;
    }

    const target =
      typeof targetDate === 'string' ? new Date(targetDate) : targetDate;

    const updateCountdown = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        if (onExpireRef.current) {
          onExpireRef.current();
        }
        return;
      }

      setTimeRemaining(diff);
      setIsExpired(false);
    };

    // Initial calculation
    updateCountdown();

    // Set up interval
    const timer = setInterval(updateCountdown, interval);

    return () => clearInterval(timer);
  }, [targetDate, interval]);

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    timeRemaining,
    minutes,
    seconds,
    isExpired,
    formatted,
  };
}
