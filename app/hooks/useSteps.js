'use client';

import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_STEP, DEFAULT_CYCLES_NUMBER, DEFAULT_SUPERSET, DEFAULT_SUPERSET_EXERCISE, STEP_TYPES } from '../lib/constants';
import { getStorageItem, getStorageNumber, setStorageItem, setStorageValue } from '../lib/storage';
import { migrateSteps } from '../lib/flattenSteps';

/**
 * Hook to manage workout steps
 * @returns {Object} Steps state and controls
 */
export function useSteps() {
  const [steps, setSteps] = useState([]);
  const [cyclesNumber, setCyclesNumber] = useState(DEFAULT_CYCLES_NUMBER);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper: generate next unique ID across all steps (including superset sub-exercises)
  const getNextId = useCallback((currentSteps) => {
    if (currentSteps.length === 0) return 1;
    return Math.max(...currentSteps.map((s) => s.id)) + 1;
  }, []);

  // Load from localStorage on mount (with migration)
  useEffect(() => {
    const savedSteps = getStorageItem(STORAGE_KEYS.STEPS, []);
    const savedCycles = getStorageNumber(STORAGE_KEYS.CYCLES_NUMBER, DEFAULT_CYCLES_NUMBER);

    const migrated = migrateSteps(savedSteps);
    setSteps(migrated);
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

  // Add a new exercise step
  const addStep = useCallback((overrides = {}) => {
    const newId = getNextId(steps);
    const newStep = { ...DEFAULT_STEP, ...overrides, id: newId };
    saveSteps([...steps, newStep]);
  }, [steps, saveSteps, getNextId]);

  // Add a new superset step
  const addSuperset = useCallback(() => {
    const newId = getNextId(steps);
    const newSuperset = {
      ...DEFAULT_SUPERSET,
      id: newId,
      exercises: [
        { ...DEFAULT_SUPERSET_EXERCISE, id: 1 },
        { ...DEFAULT_SUPERSET_EXERCISE, id: 2, name: 'Exercice 2' },
      ],
    };
    saveSteps([...steps, newSuperset]);
  }, [steps, saveSteps, getNextId]);

  // Update a top-level field on a step (works for both exercise and superset)
  const updateStep = useCallback((id, field, value) => {
    const newSteps = steps.map((step) =>
      step.id === id ? { ...step, [field]: value } : step
    );
    saveSteps(newSteps);
  }, [steps, saveSteps]);

  // Update a superset-specific field (restBetween, restAfter, name)
  const updateSupersetField = useCallback((supersetId, field, value) => {
    const newSteps = steps.map((step) => {
      if (step.id !== supersetId || step.type !== STEP_TYPES.SUPERSET) return step;
      return { ...step, [field]: value };
    });
    saveSteps(newSteps);
  }, [steps, saveSteps]);

  // Add an exercise inside a superset
  const addSupersetExercise = useCallback((supersetId, overrides = {}) => {
    const newSteps = steps.map((step) => {
      if (step.id !== supersetId || step.type !== STEP_TYPES.SUPERSET) return step;
      const exercises = step.exercises || [];
      const newExId = exercises.length > 0 ? Math.max(...exercises.map((e) => e.id)) + 1 : 1;
      return {
        ...step,
        exercises: [...exercises, { ...DEFAULT_SUPERSET_EXERCISE, ...overrides, id: newExId }],
      };
    });
    saveSteps(newSteps);
  }, [steps, saveSteps]);

  // Update a field on a sub-exercise inside a superset
  const updateSupersetExercise = useCallback((supersetId, exerciseId, field, value) => {
    const newSteps = steps.map((step) => {
      if (step.id !== supersetId || step.type !== STEP_TYPES.SUPERSET) return step;
      return {
        ...step,
        exercises: step.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, [field]: value } : ex
        ),
      };
    });
    saveSteps(newSteps);
  }, [steps, saveSteps]);

  // Move a sub-exercise up or down inside a superset
  const moveSupersetExercise = useCallback((supersetId, exerciseId, direction) => {
    const newSteps = steps.map((step) => {
      if (step.id !== supersetId || step.type !== STEP_TYPES.SUPERSET) return step;
      const exercises = [...step.exercises];
      const index = exercises.findIndex((ex) => ex.id === exerciseId);
      if (index === -1) return step;

      if (direction === 'up' && index > 0) {
        [exercises[index - 1], exercises[index]] = [exercises[index], exercises[index - 1]];
      } else if (direction === 'down' && index < exercises.length - 1) {
        [exercises[index + 1], exercises[index]] = [exercises[index], exercises[index + 1]];
      } else {
        return step;
      }

      return { ...step, exercises };
    });
    saveSteps(newSteps);
  }, [steps, saveSteps]);

  // Remove a sub-exercise from a superset
  const removeSupersetExercise = useCallback((supersetId, exerciseId) => {
    const newSteps = steps.map((step) => {
      if (step.id !== supersetId || step.type !== STEP_TYPES.SUPERSET) return step;
      return {
        ...step,
        exercises: step.exercises.filter((ex) => ex.id !== exerciseId),
      };
    });
    saveSteps(newSteps);
  }, [steps, saveSteps]);

  // Duplicate a step (insert copy right after it)
  const duplicateStep = useCallback((id) => {
    const index = steps.findIndex((step) => step.id === id);
    if (index === -1) return;
    const newId = getNextId(steps);
    const original = steps[index];

    let copy;
    if (original.type === STEP_TYPES.SUPERSET) {
      // Deep copy exercises with new IDs
      const exercisesCopy = (original.exercises || []).map((ex, i) => ({
        ...ex,
        id: i + 1,
      }));
      copy = { ...original, id: newId, in_progress: false, exercises: exercisesCopy };
    } else {
      copy = { ...original, id: newId, in_progress: false };
    }

    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, copy);
    saveSteps(newSteps);
  }, [steps, saveSteps, getNextId]);

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
      return;
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
    saveSteps(migrateSteps(newSteps));
    setCyclesNumber(newCycles);
    setStorageValue(STORAGE_KEYS.CYCLES_NUMBER, newCycles);
  }, [saveSteps]);

  return {
    steps,
    cyclesNumber,
    isLoaded,
    addStep,
    addSuperset,
    updateStep,
    updateSupersetField,
    addSupersetExercise,
    updateSupersetExercise,
    moveSupersetExercise,
    removeSupersetExercise,
    duplicateStep,
    deleteStep,
    moveStep,
    updateCyclesNumber,
    resetProgress,
    setStepInProgress,
    saveSteps,
    loadWorkout,
  };
}
