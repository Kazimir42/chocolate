'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { TIMER_TICK_MS } from '../lib/constants';

/**
 * Hook to manage a countdown/count-up timer.
 *
 * Elapsed time is derived from wall-clock timestamps, not from counting
 * interval ticks: if the tab is throttled or the screen locks, the timer
 * catches up to the real elapsed time as soon as the page is visible again.
 *
 * @param {Object} options - Timer options
 * @param {number|null} options.targetDuration - Target duration in seconds (null for count-up only)
 * @param {Function} options.onComplete - Callback when timer reaches target
 * @returns {Object} Timer state and controls
 */
export function useTimer({ targetDuration = null, onComplete }) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startedAtRef = useRef(null); // wall-clock ms of the (virtual) start
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stop = useCallback(() => {
    clearTick();
    startedAtRef.current = null;
    setIsRunning(false);
  }, []);

  // Ref mirror of elapsed, updated synchronously (not via effect) so that
  // reset() immediately followed by start() in the same tick sees 0 —
  // an effect-based mirror lags one render and made the next step start
  // with the previous step's elapsed time.
  const elapsedRef = useRef(0);
  const applyElapsed = useCallback((value) => {
    const floored = Math.floor(value);
    elapsedRef.current = floored;
    setElapsed(floored);
  }, []);

  const reset = useCallback(() => {
    stop();
    applyElapsed(0);
  }, [stop, applyElapsed]);

  const startFrom = useCallback((initialElapsed) => {
    clearTick();
    startedAtRef.current = Date.now() - initialElapsed * 1000;
    applyElapsed(initialElapsed);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      if (startedAtRef.current !== null) {
        applyElapsed((Date.now() - startedAtRef.current) / 1000);
      }
    }, TIMER_TICK_MS);
  }, [applyElapsed]);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    startFrom(elapsedRef.current);
  }, [startFrom]);

  // Set elapsed without starting (used to restore a paused session)
  const hydrate = useCallback((initialElapsed) => {
    applyElapsed(initialElapsed);
  }, [applyElapsed]);

  const toggle = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  // Catch up immediately when the page becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && startedAtRef.current !== null) {
        applyElapsed((Date.now() - startedAtRef.current) / 1000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [applyElapsed]);

  // Check if timer completed
  useEffect(() => {
    if (targetDuration !== null && elapsed >= targetDuration && isRunning) {
      stop();
      onCompleteRef.current?.();
    }
  }, [elapsed, targetDuration, isRunning, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTick();
  }, []);

  const remaining = targetDuration !== null ? Math.max(0, targetDuration - elapsed) : null;

  return {
    elapsed,
    remaining,
    isRunning,
    start,
    startFrom,
    hydrate,
    stop,
    reset,
    toggle,
  };
}
