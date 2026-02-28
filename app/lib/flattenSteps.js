import { STEP_TYPES } from './constants';

/**
 * Migrate legacy steps (without type) to include type: 'exercise'
 */
export function migrateSteps(steps) {
  return steps.map((step) => {
    if (!step.type) {
      return { ...step, type: STEP_TYPES.EXERCISE };
    }
    return step;
  });
}

/**
 * Flatten steps for workout execution.
 * - Exercise steps pass through as-is
 * - Superset steps are expanded into individual exercises with rest steps injected
 *
 * Each flattened sub-exercise gets a `_superset` metadata object:
 *   { parentId, parentName, exerciseIndex, exerciseCount, isRestBetween, isRestAfter }
 */
export function flattenSteps(steps) {
  const result = [];

  for (const step of steps) {
    if (step.type === STEP_TYPES.SUPERSET) {
      const exercises = step.exercises || [];
      const count = exercises.length;
      const sets = step.sets || 1;

      for (let s = 0; s < sets; s++) {
        exercises.forEach((ex, i) => {
          result.push({
            ...ex,
            type: STEP_TYPES.EXERCISE,
            id: `${step.id}_s${s}_ex_${ex.id}`,
            in_progress: false,
            _superset: {
              parentId: step.id,
              parentName: step.name,
              exerciseIndex: i,
              exerciseCount: count,
              setIndex: s,
              setCount: sets,
            },
          });
        });
      }
    } else {
      // Regular exercise step — pass through
      result.push({ ...step, type: step.type || STEP_TYPES.EXERCISE });
    }
  }

  return result;
}
