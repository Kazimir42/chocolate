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

  return (
    <div className="flex flex-col gap-4 justify-center h-full text-center">
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
