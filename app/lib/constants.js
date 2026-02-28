/**
 * Application constants
 */

// LocalStorage keys
export const STORAGE_KEYS = {
  STEPS: 'steps',
  CYCLES_NUMBER: 'cycles_number',
  PROFILES: 'profiles',
  ACTIVE_PROFILE_ID: 'active_profile_id',
  SOUND_ENABLED: 'sound_enabled',
};

// Timer constants
export const TIMER_INTERVAL_MS = 1000;

// Step types
export const STEP_TYPES = {
  EXERCISE: 'exercise',
  SUPERSET: 'superset',
};

// Default values
export const DEFAULT_STEP = {
  type: STEP_TYPES.EXERCISE,
  name: 'Exercice',
  duration: null,
  repetition: 8,
  in_progress: false,
};

export const DEFAULT_SUPERSET_EXERCISE = {
  name: 'Exercice',
  duration: null,
  repetition: 8,
};

export const DEFAULT_SUPERSET = {
  type: STEP_TYPES.SUPERSET,
  name: 'Superset',
  sets: 1,
  exercises: [],
  in_progress: false,
};

export const DEFAULT_CYCLES_NUMBER = 1;
