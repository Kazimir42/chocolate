'use client';

import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_STEP, DEFAULT_CYCLES_NUMBER } from '../lib/constants';
import { getStorageItem, getStorageNumber, setStorageItem, setStorageValue } from '../lib/storage';

/**
 * Hook to manage workout steps
 * @returns {Object} Steps state and controls
 */
export function useSteps() {
  const [steps, setSteps] = useState([]);
  const [cyclesNumber, setCyclesNumber] = useState(DEFAULT_CYCLES_NUMBER);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSteps = getStorageItem(STORAGE_KEYS.STEPS, []);
    const savedCycles = getStorageNumber(STORAGE_KEYS.CYCLES_NUMBER, DEFAULT_CYCLES_NUMBER);

    setSteps(savedSteps);
    setCyclesNumber(savedCycles);
    setIsLoaded(true);
  }, []);

  // Save steps to localStorage whenever they change
  const saveSteps = useCallback((newSteps) => {
    setSteps(newSteps);
    setStorageItem(STORAGE_KEYS.STEPS, newSteps);
  }, []);

  // Update cycles number
  const updateCyclesNumber = useCallback((value) => {
    const numValue = parseInt(value, 10) || DEFAULT_CYCLES_NUMBER;
    setCyclesNumber(numValue);
    setStorageValue(STORAGE_KEYS.CYCLES_NUMBER, numValue);
  }, []);

  // Add a new step
  const addStep = useCallback(() => {
    const newId = steps.length > 0 ? Math.max(...steps.map((s) => s.id)) + 1 : 1;
    const newStep = { ...DEFAULT_STEP, id: newId };
    saveSteps([...steps, newStep]);
  }, [steps, saveSteps]);

  // Update a step field
  const updateStep = useCallback((id, field, value) => {
    const newSteps = steps.map((step) =>
      step.id === id ? { ...step, [field]: value } : step
    );
    saveSteps(newSteps);
  }, [steps, saveSteps]);

  // Delete a step
  const deleteStep = useCallback((id) => {
    const newSteps = steps.filter((step) => step.id !== id);
    saveSteps(newSteps);
  }, [steps, saveSteps]);

  // Move a step up or down
  const moveStep = useCallback((direction, id) => {
    const index = steps.findIndex((step) => step.id === id);
    if (index === -1) return;

    const newSteps = [...steps];

    if (direction === 'up' && index > 0) {
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    } else if (direction === 'down' && index < newSteps.length - 1) {
      [newSteps[index + 1], newSteps[index]] = [newSteps[index], newSteps[index + 1]];
    } else {
      return; // No change needed
    }

    saveSteps(newSteps);
  }, [steps, saveSteps]);

  // Reset all steps to not in progress
  const resetProgress = useCallback(() => {
    const newSteps = steps.map((step) => ({ ...step, in_progress: false }));
    saveSteps(newSteps);
    return newSteps;
  }, [steps, saveSteps]);

  // Set a step as in progress
  const setStepInProgress = useCallback((stepId) => {
    const newSteps = steps.map((step) => ({
      ...step,
      in_progress: step.id === stepId,
    }));
    saveSteps(newSteps);
  }, [steps, saveSteps]);

  // Load a full workout (steps + cycles) from a profile
  const loadWorkout = useCallback((newSteps, newCycles) => {
    saveSteps(newSteps);
    setCyclesNumber(newCycles);
    setStorageValue(STORAGE_KEYS.CYCLES_NUMBER, newCycles);
  }, [saveSteps]);

  return {
    steps,
    cyclesNumber,
    isLoaded,
    addStep,
    updateStep,
    deleteStep,
    moveStep,
    updateCyclesNumber,
    resetProgress,
    setStepInProgress,
    saveSteps,
    loadWorkout,
  };
}
