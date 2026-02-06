'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSteps, useProfiles } from '../hooks';
import { StepCard, HomeIcon, ProfileIcon } from '../components';

export default function StepsPage() {
  const {
    steps,
    cyclesNumber,
    isLoaded,
    addStep,
    updateStep,
    deleteStep,
    moveStep,
    updateCyclesNumber,
    loadWorkout,
  } = useSteps();

  const {
    profiles,
    activeProfileId,
    loadProfile,
    syncActiveProfile,
  } = useProfiles();

  const [showProfiles, setShowProfiles] = useState(false);
  const dropdownRef = useRef(null);

  // Auto-sync active profile when steps or cycles change
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isLoaded && activeProfileId) {
      syncActiveProfile(steps, cyclesNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, cyclesNumber]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfiles(false);
      }
    };
    if (showProfiles) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showProfiles]);

  const handleSelectProfile = (id) => {
    const profile = loadProfile(id);
    if (profile) {
      loadWorkout(profile.steps, profile.cyclesNumber);
    }
    setShowProfiles(false);
  };

  if (!isLoaded) {
    return null;
  }

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-main p-4 gap-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <Link
          className="btn-glass p-3"
          href="/"
          aria-label="Accueil"
        >
          <HomeIcon />
        </Link>
        <h1 className="font-bold text-2xl">Configuration</h1>
        <div className="relative" ref={dropdownRef}>
          <button
            className="btn-glass p-3"
            onClick={() => setShowProfiles(!showProfiles)}
            aria-label="Profils"
          >
            <ProfileIcon />
          </button>

          {showProfiles && (
            <div className="absolute top-full right-0 mt-2 glass p-2 z-10 min-w-48 flex flex-col gap-1">
              {profiles.length === 0 ? (
                <p className="text-sm text-text-muted p-2">Aucun profil</p>
              ) : (
                profiles.map((profile) => (
                  <button
                    key={profile.id}
                    className={`btn-glass p-3 text-left text-sm flex items-center justify-between gap-2 ${
                      profile.id === activeProfileId ? 'border border-orange' : ''
                    }`}
                    onClick={() => handleSelectProfile(profile.id)}
                  >
                    <span>{profile.name}</span>
                    {profile.id === activeProfileId && (
                      <span className="text-xs bg-orange text-white px-1.5 py-0.5 rounded-full">Actif</span>
                    )}
                  </button>
                ))
              )}
              <Link
                className="btn-glass p-3 text-sm text-orange-light text-center"
                href="/profiles"
              >
                Gérer les profils
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Active profile indicator */}
      {activeProfile && (
        <div className="w-full max-w-md text-center">
          <span className="text-sm text-text-muted">
            Profil : <span className="text-orange-light font-semibold">{activeProfile.name}</span>
          </span>
        </div>
      )}

      {/* Cycles Configuration */}
      <section className="w-full max-w-md">
        <div className="glass-card p-4 flex flex-col gap-2">
          <label className="font-semibold text-sm text-text-muted uppercase tracking-wide" htmlFor="inputCycleNumber">
            Nombre de cycles
          </label>
          <input
            id="inputCycleNumber"
            className="glass-input p-3 text-lg text-center font-bold text-white w-full"
            type="number"
            min={1}
            max={99}
            value={cyclesNumber}
            onChange={(e) => updateCyclesNumber(e.target.value)}
          />
        </div>
      </section>

      {/* Steps Configuration */}
      <section className="w-full max-w-md">
        <h2 className="font-bold text-xl pb-4 text-center text-orange-light">Étapes</h2>
        <div className="flex flex-col gap-4">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              onUpdate={updateStep}
              onDelete={deleteStep}
              onMove={moveStep}
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <button
            type="button"
            className="btn-orange text-white"
            onClick={addStep}
          >
            + Nouvelle étape
          </button>
        </div>
      </section>
    </main>
  );
}
