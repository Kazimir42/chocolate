import { STEP_TYPES } from './constants';

/**
 * Detect if a step is a rest (auto-generated or named "Repos" by the user)
 */
export function isRestStep(step) {
  return Boolean(step?.isRest || /^repos/i.test(step?.name || ''));
}

/**
 * Migrate legacy steps to the current shape:
 * - add type: 'exercise' when missing
 * - add sets / rest fields when missing
 */
export function migrateSteps(steps) {
  return steps.map((step) => {
    if (step.type === STEP_TYPES.SUPERSET) {
      return {
        sets: 1,
        restBetweenExercises: null,
        restBetweenSets: null,
        ...step,
      };
    }
    return {
      type: STEP_TYPES.EXERCISE,
      sets: 1,
      restBetweenSets: null,
      ...step,
    };
  });
}

function makeRest(id, duration, meta = {}) {
  return {
    type: STEP_TYPES.EXERCISE,
    id,
    name: 'Repos',
    duration,
    repetition: null,
    isRest: true,
    in_progress: false,
    ...meta,
  };
}

/**
 * Flatten steps for workout execution.
 * - Exercise steps with sets > 1 are repeated, with rests injected between sets
 * - Superset steps are expanded set by set, with rests injected between
 *   exercises and between sets
 *
 * Flattened sub-steps carry metadata for display:
 *   _superset: { parentId, parentName, exerciseIndex, exerciseCount, setIndex, setCount }
 *   _set: { setIndex, setCount, parentName } (simple exercise repeated in sets)
 */
export function flattenSteps(steps) {
  const result = [];

  for (const step of steps) {
    if (step.type === STEP_TYPES.SUPERSET) {
      const exercises = step.exercises || [];
      const count = exercises.length;
      const sets = Math.max(1, step.sets || 1);
      const restEx = step.restBetweenExercises || null;
      const restSets = step.restBetweenSets || null;

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
          if (restEx && i < count - 1) {
            result.push(makeRest(`${step.id}_s${s}_rest_${ex.id}`, restEx, {
              _superset: {
                parentId: step.id,
                parentName: step.name,
                exerciseIndex: i,
                exerciseCount: count,
                setIndex: s,
                setCount: sets,
              },
            }));
          }
        });
        if (restSets && s < sets - 1) {
          result.push(makeRest(`${step.id}_s${s}_setrest`, restSets, {
            _superset: {
              parentId: step.id,
              parentName: step.name,
              exerciseIndex: count - 1,
              exerciseCount: count,
              setIndex: s,
              setCount: sets,
            },
          }));
        }
      }
    } else {
      const sets = Math.max(1, step.sets || 1);
      const restSets = step.restBetweenSets || null;

      if (sets === 1) {
        result.push({ ...step, type: step.type || STEP_TYPES.EXERCISE });
      } else {
        for (let s = 0; s < sets; s++) {
          result.push({
            ...step,
            type: STEP_TYPES.EXERCISE,
            id: `${step.id}_s${s}`,
            _set: { setIndex: s, setCount: sets, parentName: step.name },
          });
          if (restSets && s < sets - 1) {
            result.push(makeRest(`${step.id}_s${s}_rest`, restSets, {
              _set: { setIndex: s, setCount: sets, parentName: step.name },
            }));
          }
        }
      }
    }
  }

  return result;
}
