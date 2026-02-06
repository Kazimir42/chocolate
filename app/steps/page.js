'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSteps, useProfiles } from '../hooks';
import { StepCard, HomeIcon, TrashIcon, PencilIcon } from '../components';

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
    saveProfile,
    loadProfile,
    deleteProfile,
    renameProfile,
    syncActiveProfile,
  } = useProfiles();

  const [showModal, setShowModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameName, setRenameName] = useState('');

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

  const handleSelectProfile = (e) => {
    const id = e.target.value;
    if (!id) return;
    const profile = loadProfile(id);
    if (profile) {
      loadWorkout(profile.steps, profile.cyclesNumber);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = () => {
    const name = profileName.trim();
    if (!name) return;
    saveProfile(name);
    setProfileName('');
    setShowModal(false);
  };

  const handleDeleteActiveProfile = () => {
    if (activeProfileId) {
      deleteProfile(activeProfileId);
      setShowDeleteConfirm(false);
    }
  };

  const handleRenameStart = () => {
    const active = profiles.find((p) => p.id === activeProfileId);
    if (active) {
      setRenameName(active.name);
      setShowRenameModal(true);
    }
  };

  const handleRenameConfirm = () => {
    const name = renameName.trim();
    if (name && activeProfileId) {
      renameProfile(activeProfileId, name);
    }
    setShowRenameModal(false);
    setRenameName('');
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-main p-4 gap-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <Link
          className="p-3 opacity-60"
          href="/"
          aria-label="Accueil"
        >
          <HomeIcon />
        </Link>
        <h1 className="font-bold text-2xl">Programme</h1>
        <div className="w-12"></div>
      </div>

      {/* Profile selector */}
      <section className="w-full max-w-md">
        <div className="glass-card p-4 flex flex-col gap-3">
          <label className="font-semibold text-sm text-text-muted uppercase tracking-wide">
            Profil
          </label>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              className="btn-glass p-3 flex items-center justify-center text-orange-light font-bold text-xl shrink-0"
              onClick={() => setShowModal(true)}
              aria-label="Créer un profil"
            >
              +
            </button>
            <select
              className="glass-input p-3 text-white flex-1 bg-transparent min-w-0"
              value={activeProfileId || ''}
              onChange={handleSelectProfile}
            >
              <option value="">Aucun profil</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
            {activeProfileId && (
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  className="btn-glass p-3 flex items-center justify-center text-text-muted"
                  onClick={handleRenameStart}
                  aria-label="Renommer le profil"
                >
                  <PencilIcon className="size-6" />
                </button>
                <button
                  type="button"
                  className="btn-glass p-3 flex items-center justify-center text-red-400"
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="Supprimer le profil"
                >
                  <TrashIcon className="size-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

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

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-sm flex flex-col gap-4">
            <h2 className="font-bold text-xl text-center">Supprimer le profil</h2>
            <p className="text-center text-text-muted">
              Supprimer « {profiles.find((p) => p.id === activeProfileId)?.name} » ?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-glass p-3 flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="p-3 flex-1 rounded-xl font-semibold bg-red-500/20 text-red-400 border border-red-500/30"
                onClick={handleDeleteActiveProfile}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename profile modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-sm flex flex-col gap-4">
            <h2 className="font-bold text-xl text-center">Renommer le profil</h2>
            <input
              className="glass-input p-3 text-white w-full"
              type="text"
              placeholder="Nouveau nom"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameConfirm();
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-glass p-3 flex-1"
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameName('');
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn-orange text-white flex-1"
                onClick={handleRenameConfirm}
              >
                Renommer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create profile modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-sm flex flex-col gap-4">
            <h2 className="font-bold text-xl text-center">Nouveau profil</h2>
            <input
              className="glass-input p-3 text-white w-full"
              type="text"
              placeholder="Ex: Push day"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveProfile();
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-glass p-3 flex-1"
                onClick={() => {
                  setShowModal(false);
                  setProfileName('');
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn-orange text-white flex-1"
                onClick={handleSaveProfile}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
