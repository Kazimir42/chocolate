import { formatTime } from '../lib/time';
import { isRestStep } from '../lib/flattenSteps';

/**
 * Build the context line above the step name (superset / sets position)
 */
function contextLine(step) {
  const parts = [];
  if (step._superset) {
    const s = step._superset;
    parts.push(s.parentName);
    parts.push(`Exo ${s.exerciseIndex + 1}/${s.exerciseCount}`);
    if (s.setCount > 1) parts.push(`Série ${s.setIndex + 1}/${s.setCount}`);
  } else if (step._set) {
    parts.push(`Série ${step._set.setIndex + 1}/${step._set.setCount}`);
  }
  return parts.join(' · ');
}

/**
 * Display a workout step with name and optional duration.
 * The accent color encodes the state: orange = work, blue = rest.
 */
export function StepDisplay({ step, remaining, size = 'large', isRunning = false }) {
  if (!step) return null;

  const isLarge = size === 'large';
  const resting = isRestStep(step);
  const accent = resting ? 'text-rest' : 'text-work';
  const context = contextLine(step);

  if (!isLarge) {
    // Compact preview (next step)
    return (
      <div className="flex items-baseline gap-3 min-w-0">
        <span className="display-name text-2xl text-ink truncate">
          {step.name}
        </span>
        <span className={`digits text-xl shrink-0 ${accent}`}>
          {step.duration ? formatTime(step.duration) : step.repetition ? `×${step.repetition}` : ''}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center px-2">
      {context && (
        <span className="eyebrow">{context}</span>
      )}
      <h1 className="display-name text-6xl md:text-7xl text-ink break-words max-w-full">
        {step.name}
      </h1>
      {step.duration ? (
        <p
          className={`digits text-8xl md:text-9xl ${isRunning ? `${accent} timer-pulse` : 'text-muted'}`}
        >
          {formatTime(remaining !== null ? remaining : step.duration)}
        </p>
      ) : step.repetition ? (
        <p className={`digits text-7xl md:text-8xl ${isRunning ? accent : 'text-muted'}`}>
          ×{step.repetition}
        </p>
      ) : null}
    </div>
  );
}
