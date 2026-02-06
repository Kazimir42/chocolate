'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWorkout, useProfiles } from './hooks';
import { StepDisplay, ProgressInfo, CompletionScreen, SettingsIcon, SkipIcon, PreviousIcon, RestartIcon, MenuIcon, ProfileIcon } from './components';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
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
    handleTimerClick,
    skipStep,
    previousStep,
    restartWorkout,
  } = useWorkout();

  if (!isLoaded) {
    return null;
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
        {/* Header with settings and progress */}
        <div className="flex justify-between items-start p-4">
          <div className="relative flex gap-2">
            <button
              className="btn-glass p-3"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              aria-label="Menu"
            >
              <MenuIcon />
            </button>

            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 flex flex-col gap-2 glass p-2 z-10">
                <Link
                  className="btn-glass p-3 flex items-center gap-2"
                  href="/steps"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Paramètres"
                >
                  <SettingsIcon />
                  <span className="text-sm">Paramètres</span>
                </Link>
                <Link
                  className="btn-glass p-3 flex items-center gap-2"
                  href="/profiles"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Profils"
                >
                  <ProfileIcon />
                  <span className="text-sm">Profils</span>
                </Link>
                <button
                  className="btn-glass p-3 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    previousStep();
                    setMenuOpen(false);
                  }}
                  aria-label="Précédent"
                >
                  <PreviousIcon />
                  <span className="text-sm">Précédent</span>
                </button>
                <button
                  className="btn-glass p-3 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    skipStep();
                    setMenuOpen(false);
                  }}
                  aria-label="Passer"
                >
                  <SkipIcon />
                  <span className="text-sm">Passer</span>
                </button>
                <button
                  className="btn-glass p-3 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    restartWorkout();
                    setMenuOpen(false);
                  }}
                  aria-label="Recommencer"
                >
                  <RestartIcon />
                  <span className="text-sm">Recommencer</span>
                </button>
              </div>
            )}
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

        {/* Start prompt */}
        <div className="pb-4 text-center w-full">
          <p className={`font-light text-lg text-text-muted transition-opacity ${timer.isRunning ? 'opacity-0' : 'opacity-100'}`}>
            Appuyez pour démarrer
          </p>
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
