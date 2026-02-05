'use client';

import { useRef, useCallback } from 'react';

/**
 * Hook to manage sound playback
 * @param {string} src - Audio source URL
 * @returns {Object} Sound controls
 */
export function useSound(src) {
  const audioRef = useRef(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    }

    // Reset to start if already playing
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Autoplay might be blocked by browser
    });
  }, [src]);

  return { play };
}
