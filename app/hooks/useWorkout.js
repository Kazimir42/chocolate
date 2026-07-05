'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { STORAGE_KEYS, DEFAULT_CYCLES_NUMBER } from '../lib/constants';
import { getStorageItem, getStorageNumber, setStorageItem } from '../lib/storage';
import { flattenSteps, migrateSteps, isRestStep } from '../lib/flattenSteps';
import { useTimer } from './useTimer';
import { useSound } from './useSound';
import { useWakeLock } from './useWakeLock';

/**
 * Hook to manage the entire workout session.
 *
 * The session position (step index, cycle, elapsed time) is persisted to
 * localStorage on every change, so navigating to the edit page, reloading,
 * or a screen lock never loses the current spot in the workout.
 *
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

  const { play: playSound, unlock: unlockSound, soundEnabled, toggleSound } = useSound('/sounds/1081.mp3');
  const { requestWakeLock } = useWakeLock();

  // Guard against rapid clicks causing exercise skips
  const isNavigating = useRef(false);
  // Session state to restore once the timer exists
  const pendingResumeRef = useRef(null);

  // Flatten steps for execution (supersets/sets → individual exercises + rests)
  const executionSteps = useMemo(() => flattenSteps(steps), [steps]);
  const totalSteps = executionSteps.length;

  // Derive current and next step from execution index
  const currentStep = executionSteps[currentExecIndex] || null;
  const nextStep = executionSteps[currentExecIndex + 1] || null;
  const currentRound = currentExecIndex + 1;
  const isResting = isRestStep(currentStep);

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

  // Load data + saved session from localStorage
  useEffect(() => {
    const savedSteps = migrateSteps(getStorageItem(STORAGE_KEYS.STEPS, []));
    const savedCycles = getStorageNumber(STORAGE_KEYS.CYCLES_NUMBER, DEFAULT_CYCLES_NUMBER);
    const flat = flattenSteps(savedSteps);
    const session = getStorageItem(STORAGE_KEYS.SESSION, null);

    let execIndex = 0;
    let cycle = 1;
    if (session && flat.length > 0) {
      execIndex = Math.min(Math.max(0, session.execIndex ?? 0), flat.length - 1);
      cycle = Math.min(Math.max(1, session.cycle ?? 1), Math.max(1, savedCycles));
      let elapsed = session.elapsed ?? 0;
      if (session.isRunning && session.savedAt) {
        // Time kept flowing while the app was away — catch up
        elapsed += Math.floor((Date.now() - session.savedAt) / 1000);
      }
      pendingResumeRef.current = { elapsed, isRunning: Boolean(session.isRunning) };
    }

    setSteps(savedSteps);
    setCyclesNumber(savedCycles);
    setCurrentExecIndex(execIndex);
    setCurrentCycle(cycle);
    setIsLoaded(true);
  }, []);

  // Restore the timer state of a saved session
  useEffect(() => {
    if (!isLoaded || !pendingResumeRef.current) return;
    const { elapsed, isRunning } = pendingResumeRef.current;
    pendingResumeRef.current = null;
    if (isRunning) {
      timer.startFrom(elapsed);
    } else if (elapsed > 0) {
      timer.hydrate(elapsed);
    }
  }, [isLoaded, timer]);

  // Persist session position on every change
  useEffect(() => {
    if (!isLoaded) return;
    if (isEnded) {
      setStorageItem(STORAGE_KEYS.SESSION, null);
      return;
    }
    setStorageItem(STORAGE_KEYS.SESSION, {
      execIndex: currentExecIndex,
      cycle: currentCycle,
      elapsed: timer.elapsed,
      isRunning: timer.isRunning,
      savedAt: Date.now(),
    });
  }, [isLoaded, isEnded, currentExecIndex, currentCycle, timer.elapsed, timer.isRunning]);

  // Release navigation guard after state has settled
  useEffect(() => {
    isNavigating.current = false;
  }, [currentExecIndex, currentCycle]);

  // Handle auto-start after step change — always from zero
  useEffect(() => {
    if (shouldAutoStart && currentStep) {
      timer.startFrom(0);
      setShouldAutoStart(false);
    }
  }, [shouldAutoStart, currentStep, timer]);

  // Authorize audio + keep the screen awake; must run inside a user gesture
  const primeDevice = useCallback(() => {
    unlockSound();
    requestWakeLock();
  }, [unlockSound, requestWakeLock]);

  // Handle click on timer area
  const handleTimerClick = useCallback(() => {
    primeDevice();
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
  }, [currentStep, timer, handleRoundComplete, primeDevice]);

  // Skip current step
  const skipStep = useCallback(() => {
    primeDevice();
    timer.reset();
    handleRoundComplete();
  }, [timer, handleRoundComplete, primeDevice]);

  // Go to previous step
  const previousStep = useCallback(() => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    primeDevice();
    timer.reset();

    if (currentExecIndex > 0) {
      setCurrentExecIndex((prev) => prev - 1);
    } else if (currentCycle > 1) {
      setCurrentExecIndex(totalSteps - 1);
      setCurrentCycle((prev) => prev - 1);
    } else {
      isNavigating.current = false;
    }
  }, [timer, currentExecIndex, currentCycle, totalSteps, primeDevice]);

  // Restart workout from beginning
  const restartWorkout = useCallback(() => {
    isNavigating.current = false;
    primeDevice();
    timer.reset();
    setCurrentExecIndex(0);
    setCurrentCycle(1);
    setIsEnded(false);
  }, [timer, primeDevice]);

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
    isResting,
    timer,
    soundEnabled,
    toggleSound,
    handleTimerClick,
    skipStep,
    previousStep,
    restartWorkout,
  };
}
