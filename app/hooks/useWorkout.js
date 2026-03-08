'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { STORAGE_KEYS, DEFAULT_CYCLES_NUMBER } from '../lib/constants';
import { getStorageItem, getStorageNumber } from '../lib/storage';
import { flattenSteps, migrateSteps } from '../lib/flattenSteps';
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
  const [currentExecIndex, setCurrentExecIndex] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isEnded, setIsEnded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldAutoStart, setShouldAutoStart] = useState(false);

  const { play: playSound, soundEnabled, toggleSound } = useSound('/sounds/1081.mp3');
  useWakeLock();

  // Guard against rapid clicks causing exercise skips
  const isNavigating = useRef(false);

  // Flatten steps for execution (supersets → individual exercises + rests)
  const executionSteps = useMemo(() => flattenSteps(steps), [steps]);
  const totalSteps = executionSteps.length;

  // Derive current and next step from execution index
  const currentStep = executionSteps[currentExecIndex] || null;
  const nextStep = executionSteps[currentExecIndex + 1] || null;
  const currentRound = currentExecIndex + 1;

  // Handle round completion
  const handleRoundComplete = useCallback(() => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    if (currentExecIndex < totalSteps - 1) {
      // Move to next step
      setCurrentExecIndex((prev) => prev + 1);
      setShouldAutoStart(true);
    } else {
      // End of cycle
      if (currentCycle >= cyclesNumber) {
        setIsEnded(true);
      } else {
        setCurrentExecIndex(0);
        setCurrentCycle((prev) => prev + 1);
        setShouldAutoStart(true);
      }
    }
  }, [currentExecIndex, totalSteps, currentCycle, cyclesNumber]);

  // Play sound then complete round (only for timer-based completion)
  const handleTimerComplete = useCallback(() => {
    playSound();
    handleRoundComplete();
  }, [playSound, handleRoundComplete]);

  const timer = useTimer({
    targetDuration: currentStep?.duration || null,
    onComplete: handleTimerComplete,
  });

  // Load data from localStorage
  useEffect(() => {
    const savedSteps = getStorageItem(STORAGE_KEYS.STEPS, []);
    const savedCycles = getStorageNumber(STORAGE_KEYS.CYCLES_NUMBER, DEFAULT_CYCLES_NUMBER);

    setSteps(migrateSteps(savedSteps));
    setCyclesNumber(savedCycles);
    setCurrentExecIndex(0);
    setIsLoaded(true);
  }, []);

  // Release navigation guard after state has settled
  useEffect(() => {
    isNavigating.current = false;
  }, [currentExecIndex, currentCycle]);

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
    if (isNavigating.current) return;
    isNavigating.current = true;

    timer.reset();

    if (currentExecIndex > 0) {
      setCurrentExecIndex((prev) => prev - 1);
    } else if (currentCycle > 1) {
      setCurrentExecIndex(totalSteps - 1);
      setCurrentCycle((prev) => prev - 1);
    } else {
      isNavigating.current = false;
    }
  }, [timer, currentExecIndex, currentCycle, totalSteps]);

  // Restart workout from beginning
  const restartWorkout = useCallback(() => {
    isNavigating.current = false;
    timer.reset();
    setCurrentExecIndex(0);
    setCurrentCycle(1);
    setIsEnded(false);
  }, [timer]);

  return {
    steps,
    executionSteps,
    totalSteps,
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
