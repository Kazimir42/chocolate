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
    // Preload audio file to avoid delay on first play
    audioRef.current = new Audio(src);
    audioRef.current.preload = 'auto';
  }, [src]);

  const play = useCallback(() => {
    if (!enabled || !audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Autoplay might be blocked by browser
    });
  }, [enabled]);

  const toggleSound = useCallback(() => {
    const newValue = !enabled;
    setEnabled(newValue);
    setStorageItem(STORAGE_KEYS.SOUND_ENABLED, newValue);
  }, [enabled]);

  return { play, soundEnabled: enabled, toggleSound };
}
