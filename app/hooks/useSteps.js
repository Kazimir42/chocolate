'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { STORAGE_KEYS, DEFAULT_STEP, DEFAULT_CYCLES_NUMBER, DEFAULT_SUPERSET, DEFAULT_SUPERSET_EXERCISE, STEP_TYPES } from '../lib/constants';
import { getStorageItem, getStorageNumber, setStorageItem, setStorageValue } from '../lib/storage';
import { migrateSteps } from '../lib/flattenSteps';

// Generate next unique ID across steps
function getNextId(currentSteps) {
  if (currentSteps.length === 0) return 1;
  return Math.max(...currentSteps.map((s) => s.id)) + 1;
}

/**
 * Hook to manage workout steps.
 *
 * All updaters use functional setState so their identity is stable across
 * renders — memoized cards only re-render when their own step changes.
 * Persistence to localStorage is debounced to stay off the keystroke path.
 *
 * @returns {Object} Steps state and controls
 */
export function useSteps() {
  const [steps, setSteps] = useState([]);
  const [cyclesNumber, setCyclesNumber] = useState(DEFAULT_CYCLES_NUMBER);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (with migration)
  useEffect(() => {
    const savedSteps = getStorageItem(STORAGE_KEYS.STEPS, []);
    const savedCycles = getStorageNumber(STORAGE_KEYS.CYCLES_NUMBER, DEFAULT_CYCLES_NUMBER);

    setSteps(migrateSteps(savedSteps));
    setCyclesNumber(savedCycles);
    setIsLoaded(true);
  }, []);

  // Debounced persistence, flushed on unmount so no edit is ever lost
  const stepsRef = useRef(steps);
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    stepsRef.current = steps;
    if (!isLoaded) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      setStorageItem(STORAGE_KEYS.STEPS, stepsRef.current);
    }, 300);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [steps, isLoaded]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        setStorageItem(STORAGE_KEYS.STEPS, stepsRef.current);
      }
    };
  }, []);

  // Update cycles number
  const updateCyclesNumber = useCallback((value) => {
    const numValue = parseInt(value, 10) || DEFAULT_CYCLES_NUMBER;
    setCyclesNumber(numValue);
    setStorageValue(STORAGE_KEYS.CYCLES_NUMBER, numValue);
  }, []);

  // Add a new exercise step
  const addStep = useCallback((overrides = {}) => {
    setSteps((prev) => [...prev, { ...DEFAULT_STEP, ...overrides, id: getNextId(prev) }]);
  }, []);

  // Add a new superset step
  const addSuperset = useCallback(() => {
    setSteps((prev) => [
      ...prev,
      {
        ...DEFAULT_SUPERSET,
        id: getNextId(prev),
        exercises: [
          { ...DEFAULT_SUPERSET_EXERCISE, id: 1 },
          { ...DEFAULT_SUPERSET_EXERCISE, id: 2, name: 'Exercice 2' },
        ],
      },
    ]);
  }, []);

  // Update a top-level field on a step (works for both exercise and superset)
  const updateStep = useCallback((id, field, value) => {
    setSteps((prev) => prev.map((step) =>
      step.id === id ? { ...step, [field]: value } : step
    ));
  }, []);

  // Update a superset-specific field (sets, rests, name)
  const updateSupersetField = useCallback((supersetId, field, value) => {
    setSteps((prev) => prev.map((step) => {
      if (step.id !== supersetId || step.type !== STEP_TYPES.SUPERSET) return step;
      return { ...step, [field]: value };
    }));
  }, []);

  // Add an exercise inside a superset
  const addSupersetExercise = useCallback((supersetId, overrides = {}) => {
    setSteps((prev) => prev.map((step) => {
      if (step.id !== supersetId || step.type !== STEP_TYPES.SUPERSET) return step;
      const exercises = step.exercises || [];
      const newExId = exercises.length > 0 ? Math.max(...exercises.map((e) => e.id)) + 1 : 1;
      return {
        ...step,
        exercises: [...exercises, { ...DEFAULT_SUPERSET_EXERCISE, ...overrides, id: newExId }],
      };
    }));
  }, []);

  // Update a field on a sub-exercise inside a superset
  const updateSupersetExercise = useCallback((supersetId, exerciseId, field, value) => {
    setSteps((prev) => prev.map((step) => {
      if (step.id !== supersetId || step.type !== STEP_TYPES.SUPERSET) return step;
      return {
        ...step,
        exercises: step.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, [field]: value } : ex
        ),
      };
    }));
  }, []);

  // Reorder sub-exercises inside a superset (index-based for dnd-kit)
  const reorderSupersetExercises = useCallback((supersetId, oldIndex, newIndex) => {
    setSteps((prev) => prev.map((step) => {
      if (step.id !== supersetId || step.type !== STEP_TYPES.SUPERSET) return step;
      const exercises = [...step.exercises];
      if (oldIndex < 0 || oldIndex >= exercises.length || newIndex < 0 || newIndex >= exercises.length) return step;
      const [moved] = exercises.splice(oldIndex, 1);
      exercises.splice(newIndex, 0, moved);
      return { ...step, exercises };
    }));
  }, []);

  // Remove a sub-exercise from a superset
  const removeSupersetExercise = useCallback((supersetId, exerciseId) => {
    setSteps((prev) => prev.map((step) => {
      if (step.id !== supersetId || step.type !== STEP_TYPES.SUPERSET) return step;
      return {
        ...step,
        exercises: step.exercises.filter((ex) => ex.id !== exerciseId),
      };
    }));
  }, []);

  // Duplicate a step (insert copy right after it)
  const duplicateStep = useCallback((id) => {
    setSteps((prev) => {
      const index = prev.findIndex((step) => step.id === id);
      if (index === -1) return prev;
      const newId = getNextId(prev);
      const original = prev[index];

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

      const newSteps = [...prev];
      newSteps.splice(index + 1, 0, copy);
      return newSteps;
    });
  }, []);

  // Delete a step
  const deleteStep = useCallback((id) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  }, []);

  // Reorder top-level steps (index-based for dnd-kit)
  const reorderSteps = useCallback((oldIndex, newIndex) => {
    setSteps((prev) => {
      if (oldIndex < 0 || oldIndex >= prev.length || newIndex < 0 || newIndex >= prev.length) return prev;
      const newSteps = [...prev];
      const [moved] = newSteps.splice(oldIndex, 1);
      newSteps.splice(newIndex, 0, moved);
      return newSteps;
    });
  }, []);

  // Load a full workout (steps + cycles) from a profile
  const loadWorkout = useCallback((newSteps, newCycles) => {
    setSteps(migrateSteps(newSteps));
    setCyclesNumber(newCycles);
    setStorageValue(STORAGE_KEYS.CYCLES_NUMBER, newCycles);
  }, []);

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
    reorderSupersetExercises,
    removeSupersetExercise,
    duplicateStep,
    deleteStep,
    reorderSteps,
    updateCyclesNumber,
    loadWorkout,
  };
}
