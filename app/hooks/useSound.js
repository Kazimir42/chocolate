'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../lib/constants';
import { getStorageItem, setStorageItem } from '../lib/storage';

/**
 * Hook to manage sound playback
 * @param {string} src - Audio source URL
 * @returns {Object} Sound controls
 */
export function useSound(src) {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = getStorageItem(STORAGE_KEYS.SOUND_ENABLED, true);
    setEnabled(saved);
  }, []);

  const play = useCallback(() => {
    if (!enabled) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    }

    // Reset to start if already playing
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Autoplay might be blocked by browser
    });
  }, [src, enabled]);

  const toggleSound = useCallback(() => {
    const newValue = !enabled;
    setEnabled(newValue);
    setStorageItem(STORAGE_KEYS.SOUND_ENABLED, newValue);
  }, [enabled]);

  return { play, soundEnabled: enabled, toggleSound };
}
