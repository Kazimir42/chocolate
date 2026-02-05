'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { TIMER_INTERVAL_MS } from '../lib/constants';

/**
 * Hook to manage a countdown/count-up timer
 * @param {Object} options - Timer options
 * @param {number|null} options.targetDuration - Target duration in seconds (null for count-up only)
 * @param {Function} options.onComplete - Callback when timer reaches target
 * @returns {Object} Timer state and controls
 */
export function useTimer({ targetDuration = null, onComplete }) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setElapsed(0);
  }, [stop]);

  const start = useCallback(() => {
    if (intervalRef.current) return;

    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, TIMER_INTERVAL_MS);
  }, []);

  const toggle = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  // Check if timer completed
  useEffect(() => {
    if (targetDuration !== null && elapsed >= targetDuration && isRunning) {
      stop();
      onCompleteRef.current?.();
    }
  }, [elapsed, targetDuration, isRunning, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const remaining = targetDuration !== null ? Math.max(0, targetDuration - elapsed) : null;

  return {
    elapsed,
    remaining,
    isRunning,
    start,
    stop,
    reset,
    toggle,
  };
}
