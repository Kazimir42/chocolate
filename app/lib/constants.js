/**
 * Application constants
 */

// LocalStorage keys
export const STORAGE_KEYS = {
  STEPS: 'steps',
  CYCLES_NUMBER: 'cycles_number',
  PROFILES: 'profiles',
  ACTIVE_PROFILE_ID: 'active_profile_id',
};

// Timer constants
export const TIMER_INTERVAL_MS = 1000;

// Default values
export const DEFAULT_STEP = {
  name: 'new step',
  duration: 60,
  repetition: null,
  in_progress: false,
};

export const DEFAULT_CYCLES_NUMBER = 1;
