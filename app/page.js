'use client';

import Link from 'next/link';
import { useWorkout, useProfiles } from './hooks';
import { StepDisplay, ProgressInfo, CompletionScreen, LoadingScreen, ListIcon, SkipIcon, PreviousIcon, RestartIcon, SoundOnIcon, SoundOffIcon } from './components';

export default function Home() {
  const { profiles, activeProfileId } = useProfiles();
  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const {
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
  } = useWorkout();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (steps.length === 0) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-bg p-4 gap-6 text-center">
        <h1 className="display-name text-4xl text-ink">Aucun exercice</h1>
        <p className="text-muted text-sm">Le programme est vide pour l&apos;instant.</p>
        <Link href="/steps" className="btn btn-primary">
          Configurer mon programme
        </Link>
      </main>
    );
  }

  if (isEnded) {
    return (
      <main className="flex min-h-dvh flex-col items-center bg-bg">
        <CompletionScreen onRestart={restartWorkout} />
      </main>
    );
  }

  // The accent color encodes the state: orange = work, blue = rest
  const accentBg = isResting ? 'bg-rest' : 'bg-work';

  // Overall progress across the whole workout, including the running timer
  const stepFraction = currentStep?.duration
    ? Math.min(1, timer.elapsed / currentStep.duration)
    : 0;
  const totalUnits = Math.max(1, cyclesNumber * totalSteps);
  const doneUnits = (currentCycle - 1) * totalSteps + (currentRound - 1) + stepFraction;
  const progressPercent = Math.min(100, (doneUnits / totalUnits) * 100);

  // What comes after this step (falls back to the next cycle's first step)
  const upcoming = nextStep || (currentCycle < cyclesNumber ? executionSteps[0] : null);
  const upcomingLabel = nextStep ? 'Suivant' : upcoming ? `Suivant · cycle ${currentCycle + 1}` : 'Dernier effort';

  const hint = !timer.isRunning
    ? (timer.elapsed > 0 ? 'En pause · appuyez pour reprendre' : 'Appuyez pour démarrer')
    : (!currentStep?.duration ? 'Appuyez quand c’est fait' : null);

  return (
    <main className="flex h-dvh flex-col bg-bg overflow-hidden">
      {/* Current Step Section — the whole zone acts as the play/pause button.
          A div with role=button (not <button>) because it contains real buttons. */}
      <div
        role="button"
        tabIndex={0}
        className="flex-1 min-h-0 w-full cursor-pointer relative flex flex-col text-left select-none"
        onClick={handleTimerClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTimerClick();
          }
        }}
        aria-label={timer.isRunning ? 'Pause' : 'Démarrer'}
      >
        {/* Header with actions and progress */}
        <div className="flex justify-between items-start p-4 w-full">
          <div className="flex gap-0">
            <Link
              className="p-3 text-muted"
              href="/steps"
              onClick={(e) => e.stopPropagation()}
              aria-label="Programme"
            >
              <ListIcon />
            </Link>
            <button
              className="p-3 text-muted"
              onClick={(e) => {
                e.stopPropagation();
                restartWorkout();
              }}
              aria-label="Recommencer"
            >
              <RestartIcon />
            </button>
            <button
              className="p-3 text-muted"
              onClick={(e) => {
                e.stopPropagation();
                toggleSound();
              }}
              aria-label={soundEnabled ? 'Couper le son' : 'Activer le son'}
            >
              {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
            </button>
          </div>

          <ProgressInfo
            currentRound={currentRound}
            totalRounds={totalSteps}
            currentCycle={currentCycle}
            totalCycles={cyclesNumber}
            profileName={activeProfile?.name}
          />
        </div>

        {/* Central step display */}
        <div className="flex-1 min-h-0 flex items-center justify-center px-4 w-full">
          <StepDisplay
            step={currentStep}
            remaining={timer.remaining}
            size="large"
            isRunning={timer.isRunning}
          />
        </div>

        {/* Bottom bar: previous / hint / skip */}
        <div className="flex items-center justify-between px-4 pb-3 w-full">
          <button
            className="p-3 text-muted"
            onClick={(e) => {
              e.stopPropagation();
              previousStep();
            }}
            aria-label="Précédent"
          >
            <PreviousIcon />
          </button>
          <p className={`eyebrow transition-opacity ${hint ? 'opacity-100' : 'opacity-0'}`}>
            {hint || '·'}
          </p>
          <button
            className="p-3 text-muted"
            onClick={(e) => {
              e.stopPropagation();
              skipStep();
            }}
            aria-label="Passer"
          >
            <SkipIcon />
          </button>
        </div>

        {/* Workout progress bar */}
        <div className="w-full h-1 bg-line">
          <div
            className={`h-full ${accentBg}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Next Step Section */}
      <div className="w-full bg-surface border-t border-line px-5 py-4 flex flex-col gap-2 shrink-0">
        <p className="eyebrow">{upcomingLabel}</p>
        {upcoming ? (
          <StepDisplay step={upcoming} remaining={null} size="small" />
        ) : (
          <p className="display-name text-2xl text-work">Fin de la séance</p>
        )}
      </div>
    </main>
  );
}
