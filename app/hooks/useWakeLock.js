'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to manage screen wake lock
 * Prevents the device screen from turning off during use
 */
export function useWakeLock() {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
        return;
      }

      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch {
        // Wake Lock request failed - usually due to low battery or tab visibility
      }
    };

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
  }, []);
}
