'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to manage screen wake lock.
 * Prevents the device screen from turning off during use.
 *
 * The initial request (on mount) can fail silently on some devices, so the
 * returned `requestWakeLock` should also be called from user gestures —
 * a request made inside a tap handler succeeds far more reliably.
 */
export function useWakeLock() {
  const wakeLockRef = useRef(null);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      return;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      // The lock is released by the OS when the tab is hidden;
      // clear our ref so the next request re-acquires it
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null;
      });
    } catch {
      // Wake Lock request failed - usually due to low battery or tab visibility
    }
  }, []);

  useEffect(() => {
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [requestWakeLock]);

  return { requestWakeLock };
}
