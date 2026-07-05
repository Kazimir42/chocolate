'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../lib/constants';
import { getStorageItem, setStorageItem } from '../lib/storage';

/**
 * Hook to manage sound playback through the Web Audio API.
 *
 * Mobile browsers block audio that isn't triggered by a user gesture,
 * which made the whistle unreliable when fired from a timer callback.
 * The fix: create/resume an AudioContext inside a real user gesture
 * (call `unlock()` from any tap handler) — once unlocked, buffer
 * playback from timers is allowed.
 *
 * @param {string} src - Audio source URL
 * @returns {Object} Sound controls
 */
export function useSound(src) {
  const ctxRef = useRef(null);
  const bufferRef = useRef(null);
  const fallbackRef = useRef(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = getStorageItem(STORAGE_KEYS.SOUND_ENABLED, true);
    setEnabled(saved);
    // Fallback for browsers without Web Audio
    fallbackRef.current = new Audio(src);
    fallbackRef.current.preload = 'auto';
  }, [src]);

  const ensureContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctxRef.current = new Ctx();
      fetch(src)
        .then((res) => res.arrayBuffer())
        .then((data) => ctxRef.current.decodeAudioData(data))
        .then((buffer) => {
          bufferRef.current = buffer;
        })
        .catch(() => {
          // Decoding failed — fallback element will be used
        });
    }
    return ctxRef.current;
  }, [src]);

  // Call from any user gesture (tap) to authorize audio playback
  const unlock = useCallback(() => {
    const ctx = ensureContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }, [ensureContext]);

  const play = useCallback(() => {
    if (!enabled) return;

    const ctx = ensureContext();
    if (ctx && bufferRef.current) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const source = ctx.createBufferSource();
      source.buffer = bufferRef.current;
      source.connect(ctx.destination);
      source.start(0);
      return;
    }

    // Fallback: HTMLAudioElement
    if (fallbackRef.current) {
      fallbackRef.current.currentTime = 0;
      fallbackRef.current.play().catch(() => {});
    }
  }, [enabled, ensureContext]);

  const toggleSound = useCallback(() => {
    setEnabled((prev) => {
      const newValue = !prev;
      setStorageItem(STORAGE_KEYS.SOUND_ENABLED, newValue);
      return newValue;
    });
  }, []);

  return { play, unlock, soundEnabled: enabled, toggleSound };
}
