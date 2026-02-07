'use client';

import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../lib/constants';
import { getStorageItem, getStorageNumber, setStorageItem, setStorageValue } from '../lib/storage';

/**
 * Hook to manage workout profiles (CRUD)
 */
export function useProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProfiles = getStorageItem(STORAGE_KEYS.PROFILES, []);
    const savedActiveId = getStorageItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, null);
    setProfiles(savedProfiles);
    setActiveProfileId(savedActiveId);
  }, []);

  // Save a new profile from the current workout
  const saveProfile = useCallback((name) => {
    const steps = getStorageItem(STORAGE_KEYS.STEPS, []);
    const cyclesNumber = getStorageNumber(STORAGE_KEYS.CYCLES_NUMBER, 1);
    const now = Date.now();

    const newProfile = {
      id: `profile_${now}`,
      name,
      steps,
      cyclesNumber,
      createdAt: now,
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setStorageItem(STORAGE_KEYS.PROFILES, updated);
    setActiveProfileId(newProfile.id);
    setStorageItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, newProfile.id);

    return newProfile;
  }, [profiles]);

  // Load a profile into the current workout
  const loadProfile = useCallback((id) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return null;

    setStorageItem(STORAGE_KEYS.STEPS, profile.steps);
    setStorageValue(STORAGE_KEYS.CYCLES_NUMBER, profile.cyclesNumber);
    setActiveProfileId(id);
    setStorageItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);

    return profile;
  }, [profiles]);

  // Delete a profile
  const deleteProfile = useCallback((id) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    setStorageItem(STORAGE_KEYS.PROFILES, updated);

    if (activeProfileId === id) {
      setActiveProfileId(null);
      setStorageItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, null);
    }
  }, [profiles, activeProfileId]);

  // Update a profile
  const updateProfile = useCallback((id, newName) => {
    const updated = profiles.map((p) =>
      p.id === id ? { ...p, name: newName } : p
    );
    setProfiles(updated);
    setStorageItem(STORAGE_KEYS.PROFILES, updated);
  }, [profiles]);

  // Deselect the active profile
  const deselectProfile = useCallback(() => {
    setActiveProfileId(null);
    setStorageItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, null);
  }, []);

  // Sync the active profile with current workout data
  const syncActiveProfile = useCallback((steps, cyclesNumber) => {
    if (!activeProfileId) return;
    const updated = profiles.map((p) =>
      p.id === activeProfileId ? { ...p, steps, cyclesNumber } : p
    );
    setProfiles(updated);
    setStorageItem(STORAGE_KEYS.PROFILES, updated);
  }, [profiles, activeProfileId]);

  return {
    profiles,
    activeProfileId,
    saveProfile,
    loadProfile,
    deleteProfile,
    updateProfile,
    deselectProfile,
    syncActiveProfile,
  };
}
