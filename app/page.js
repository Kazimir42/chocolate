'use client';

import Link from 'next/link';
import { useWorkout, useProfiles } from './hooks';
import { StepDisplay, ProgressInfo, CompletionScreen, LoadingScreen, ListIcon, SkipIcon, PreviousIcon, RestartIcon, SoundOnIcon, SoundOffIcon } from './components';

export default function Home() {
  const { profiles, activeProfileId } = useProfiles();
  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const {
    steps,
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
  } = useWorkout();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (steps.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-main p-4 gap-6 text-center">
        <p className="text-xl text-text-muted">Aucun exercice défini</p>
        <Link href="/steps" className="btn-orange text-white">
          Configurer mon programme
        </Link>
      </main>
    );
  }

  if (isEnded) {
    return (
      <main className="flex min-h-screen flex-col items-center bg-gradient-main">
        <CompletionScreen />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-main">
      {/* Current Step Section */}
      <div
        className="h-[70vh] w-full cursor-pointer relative transition duration-300 flex flex-col"
        onClick={handleTimerClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTimerClick();
          }
        }}
        aria-label={timer.isRunning ? 'Pause' : 'Démarrer'}
      >
        {/* Header with actions and progress */}
        <div className="flex justify-between items-start p-4">
          <div className="flex gap-0">
            <Link
              className="p-3 opacity-60"
              href="/steps"
              onClick={(e) => e.stopPropagation()}
              aria-label="Programme"
            >
              <ListIcon />
            </Link>
            <button
              className="p-3 opacity-60"
              onClick={(e) => {
                e.stopPropagation();
                restartWorkout();
              }}
              aria-label="Recommencer"
            >
              <RestartIcon />
            </button>
            <button
              className="p-3 opacity-60"
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
            totalRounds={steps.length}
            currentCycle={currentCycle}
            totalCycles={cyclesNumber}
            profileName={activeProfile?.name}
          />
        </div>

        {/* Central step display */}
        <div className="flex-1 flex items-center justify-center px-4">
          <StepDisplay
            step={currentStep}
            remaining={timer.remaining}
            size="large"
            isRunning={timer.isRunning}
          />
        </div>

        {/* Bottom bar: previous / start prompt / skip */}
        <div className="flex items-center justify-between px-4 pb-4">
          <button
            className="p-3 opacity-40"
            onClick={(e) => {
              e.stopPropagation();
              previousStep();
            }}
            aria-label="Précédent"
          >
            <PreviousIcon />
          </button>
          <p className={`font-light text-lg text-text-muted transition-opacity ${timer.isRunning ? 'opacity-0' : 'opacity-100'}`}>
            Appuyez pour démarrer
          </p>
          <button
            className="p-3 opacity-40"
            onClick={(e) => {
              e.stopPropagation();
              skipStep();
            }}
            aria-label="Passer"
          >
            <SkipIcon />
          </button>
        </div>
      </div>

      {/* Next Step Section */}
      <div className="h-[30vh] next-section w-full flex flex-col">
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm font-semibold text-orange-light uppercase tracking-wide">Suivant</p>
        </div>
        {nextStep ? (
          <div className="flex-1 flex items-center justify-center px-4 pb-4">
            <StepDisplay step={nextStep} remaining={null} size="small" />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-2xl font-bold text-orange">Terminé !</p>
          </div>
        )}
      </div>
    </main>
  );
}
