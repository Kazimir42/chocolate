'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { STORAGE_KEYS, DEFAULT_CYCLES_NUMBER } from '../lib/constants';
import { getStorageItem, getStorageNumber, setStorageItem } from '../lib/storage';
import { useTimer } from './useTimer';
import { useSound } from './useSound';
import { useWakeLock } from './useWakeLock';

/**
 * Hook to manage the entire workout session
 * @returns {Object} Workout state and controls
 */
export function useWorkout() {
  const [steps, setSteps] = useState([]);
  const [cyclesNumber, setCyclesNumber] = useState(DEFAULT_CYCLES_NUMBER);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [isEnded, setIsEnded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldAutoStart, setShouldAutoStart] = useState(false);

  const { play: playSound, soundEnabled, toggleSound } = useSound('/sounds/1081.mp3');
  useWakeLock();

  // Find current and next step from steps array
  const { currentStep, nextStep, currentStepIndex } = useMemo(() => {
    const index = steps.findIndex((step) => step.in_progress);
    const current = index !== -1 ? steps[index] : (steps.length > 0 ? steps[0] : null);
    const next = index !== -1 ? (steps[index + 1] || null) : (steps.length > 1 ? steps[1] : null);

    return {
      currentStep: current,
      nextStep: next,
      currentStepIndex: index !== -1 ? index : 0,
    };
  }, [steps]);

  // Handle round completion
  const handleRoundComplete = useCallback(() => {
    playSound();

    if (nextStep) {
      // Move to next step
      const newSteps = steps.map((step) => ({
        ...step,
        in_progress: step.id === nextStep.id,
      }));
      setSteps(newSteps);
      setStorageItem(STORAGE_KEYS.STEPS, newSteps);
      setCurrentRound((prev) => prev + 1);
      setShouldAutoStart(true);
    } else {
      // End of cycle
      const newSteps = steps.map((step, index) => ({
        ...step,
        in_progress: index === 0,
      }));
      setSteps(newSteps);
      setStorageItem(STORAGE_KEYS.STEPS, newSteps);
      setCurrentRound(1);

      if (currentCycle >= cyclesNumber) {
        setIsEnded(true);
      } else {
        setCurrentCycle((prev) => prev + 1);
        setShouldAutoStart(true);
      }
    }
  }, [nextStep, steps, currentCycle, cyclesNumber, playSound]);

  const timer = useTimer({
    targetDuration: currentStep?.duration || null,
    onComplete: handleRoundComplete,
  });

  // Load data from localStorage
  useEffect(() => {
    const savedSteps = getStorageItem(STORAGE_KEYS.STEPS, []);
    const savedCycles = getStorageNumber(STORAGE_KEYS.CYCLES_NUMBER, DEFAULT_CYCLES_NUMBER);

    // Reset all steps to not in progress, then set first as in progress
    const resetSteps = savedSteps.map((step, index) => ({
      ...step,
      in_progress: index === 0,
    }));

    setSteps(resetSteps);
    setCyclesNumber(savedCycles);
    setStorageItem(STORAGE_KEYS.STEPS, resetSteps);
    setIsLoaded(true);
  }, []);

  // Handle auto-start after step change
  useEffect(() => {
    if (shouldAutoStart && currentStep) {
      timer.reset();
      timer.start();
      setShouldAutoStart(false);
    }
  }, [shouldAutoStart, currentStep, timer]);

  // Handle click on timer area
  const handleTimerClick = useCallback(() => {
    const hasNoTimer = !currentStep?.duration || currentStep.duration === '';

    if (hasNoTimer) {
      if (!timer.isRunning) {
        timer.start();
      } else {
        handleRoundComplete();
      }
    } else {
      timer.toggle();
    }
  }, [currentStep, timer, handleRoundComplete]);

  // Skip current step
  const skipStep = useCallback(() => {
    timer.reset();
    handleRoundComplete();
  }, [timer, handleRoundComplete]);

  // Go to previous step
  const previousStep = useCallback(() => {
    timer.reset();

    if (currentStepIndex > 0) {
      // Go to previous step in current cycle
      const prevStep = steps[currentStepIndex - 1];
      const newSteps = steps.map((step) => ({
        ...step,
        in_progress: step.id === prevStep.id,
      }));
      setSteps(newSteps);
      setStorageItem(STORAGE_KEYS.STEPS, newSteps);
      setCurrentRound((prev) => prev - 1);
    } else if (currentCycle > 1) {
      // Go to last step of previous cycle
      const lastStep = steps[steps.length - 1];
      const newSteps = steps.map((step) => ({
        ...step,
        in_progress: step.id === lastStep.id,
      }));
      setSteps(newSteps);
      setStorageItem(STORAGE_KEYS.STEPS, newSteps);
      setCurrentRound(steps.length);
      setCurrentCycle((prev) => prev - 1);
    }
  }, [timer, currentStepIndex, steps, currentCycle]);

  // Restart workout from beginning
  const restartWorkout = useCallback(() => {
    timer.reset();
    const newSteps = steps.map((step, index) => ({
      ...step,
      in_progress: index === 0,
    }));
    setSteps(newSteps);
    setStorageItem(STORAGE_KEYS.STEPS, newSteps);
    setCurrentRound(1);
    setCurrentCycle(1);
    setIsEnded(false);
  }, [timer, steps]);

  return {
    steps,
    currentStep,
    nextStep,
    currentCycle,
    currentRound,
    cyclesNumber,
    isEnded,
    isLoaded,
    timer,
    soundEnabled,
    toggleSound,
    handleTimerClick,
    skipStep,
    previousStep,
    restartWorkout,
  };
}
