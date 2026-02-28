import { formatTime } from '../lib/time';

/**
 * Display a workout step with name and optional duration
 */
export function StepDisplay({ step, remaining, size = 'large', isRunning = false }) {
  if (!step) return null;

  const isLarge = size === 'large';
  const titleClass = isLarge ? 'text-4xl md:text-5xl' : 'text-2xl';
  const timerClass = isLarge ? 'text-6xl md:text-7xl' : 'text-4xl';

  const displayName = step.repetition
    ? `${step.repetition}x ${step.name}`
    : step.name;

  const superset = step._superset;

  return (
    <div className="flex flex-col gap-4 justify-center h-full text-center">
      {superset && (
        <div className="flex flex-col items-center gap-1">
          <span className={`${isLarge ? 'text-xs' : 'text-[10px]'} font-semibold uppercase tracking-widest text-text-muted`}>
            {superset.parentName}
          </span>
          <div className="flex items-center gap-3">
            <span className={`${isLarge ? 'text-sm' : 'text-xs'} font-bold text-orange bg-orange/20 px-3 py-1 rounded-full`}>
              {superset.exerciseIndex + 1}/{superset.exerciseCount}
            </span>
            {superset.setCount > 1 && (
              <span className={`${isLarge ? 'text-sm' : 'text-xs'} font-bold text-white/70 bg-white/10 px-3 py-1 rounded-full`}>
                Série {superset.setIndex + 1}/{superset.setCount}
              </span>
            )}
          </div>
        </div>
      )}
      <h1 className={`${titleClass} font-bold text-white`}>
        {displayName}
      </h1>
      {step.duration && remaining !== null && (
        <p className={`${timerClass} font-bold ${isRunning ? 'glow-orange timer-pulse' : ''} text-orange`}>
          {formatTime(remaining)}
        </p>
      )}
      {step.duration && remaining === null && (
        <p className={`${timerClass} font-bold text-text-muted`}>
          {formatTime(step.duration)}
        </p>
      )}
    </div>
  );
}
