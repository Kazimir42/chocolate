'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { useSteps, useProfiles } from '../hooks';
import { DEFAULT_CYCLES_NUMBER, STEP_TYPES } from '../lib/constants';
import { StepCard, SupersetCard, ProfileModal, LoadingScreen, HomeIcon, TrashIcon, PencilIcon } from '../components';

export default function StepsPage() {
  const {
    steps,
    cyclesNumber,
    isLoaded,
    addStep,
    addSuperset,
    updateStep,
    updateSupersetField,
    addSupersetExercise,
    updateSupersetExercise,
    reorderSupersetExercises,
    removeSupersetExercise,
    duplicateStep,
    deleteStep,
    reorderSteps,
    updateCyclesNumber,
    loadWorkout,
  } = useSteps();

  const {
    profiles,
    activeProfileId,
    saveProfile,
    loadProfile,
    deleteProfile,
    updateProfile,
    deselectProfile,
    syncActiveProfile,
  } = useProfiles();

  const [profileModal, setProfileModal] = useState(null); // { mode: 'create' | 'edit', initialName? }

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
    if (!id) {
      deselectProfile();
      loadWorkout([], DEFAULT_CYCLES_NUMBER);
      return;
    }
    const profile = loadProfile(id);
    if (profile) {
      loadWorkout(profile.steps, profile.cyclesNumber);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleProfileModalConfirm = (name) => {
    if (profileModal?.mode === 'create') {
      saveProfile(name, steps, cyclesNumber);
    } else if (profileModal?.mode === 'edit' && activeProfileId) {
      updateProfile(activeProfileId, name);
    }
    setProfileModal(null);
  };

  const handleDeleteActiveProfile = () => {
    if (activeProfileId) {
      deleteProfile(activeProfileId);
      setShowDeleteConfirm(false);
    }
  };

  // Top-level drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSteps(oldIndex, newIndex);
    }
  };

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <main className="flex min-h-dvh flex-col items-center bg-bg p-4 gap-6">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between">
        <Link
          className="p-3 -ml-3 text-muted"
          href="/"
          aria-label="Accueil"
        >
          <HomeIcon />
        </Link>
        <h1 className="display-name text-3xl text-ink">Programme</h1>
        <div className="w-9"></div>
      </div>

      {/* Profile + cycles */}
      <section className="w-full max-w-md">
        <div className="card p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="eyebrow">Profil</label>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                className="btn-ghost rounded-lg p-3 text-work font-bold text-xl leading-none shrink-0"
                onClick={() => setProfileModal({ mode: 'create' })}
                aria-label="Créer un profil"
              >
                +
              </button>
              <select
                className="field p-3 flex-1 min-w-0"
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
                    className="btn-ghost rounded-lg p-3 text-muted"
                    onClick={() => {
                      const active = profiles.find((p) => p.id === activeProfileId);
                      if (active) setProfileModal({ mode: 'edit', initialName: active.name });
                    }}
                    aria-label="Modifier le profil"
                  >
                    <PencilIcon className="size-5" />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost rounded-lg p-3 text-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label="Supprimer le profil"
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="eyebrow" htmlFor="inputCycleNumber">
              Nombre de cycles
            </label>
            <input
              id="inputCycleNumber"
              className="field p-3 text-lg text-center w-full"
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              value={cyclesNumber}
              onChange={(e) => updateCyclesNumber(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Steps Configuration */}
      <section className="w-full max-w-md pb-8">
        <h2 className="eyebrow pb-4 text-center">Étapes</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-4">
              {steps.map((step) =>
                step.type === STEP_TYPES.SUPERSET ? (
                  <SupersetCard
                    key={step.id}
                    step={step}
                    onUpdateField={updateSupersetField}
                    onAddExercise={addSupersetExercise}
                    onUpdateExercise={updateSupersetExercise}
                    onReorderExercises={reorderSupersetExercises}
                    onRemoveExercise={removeSupersetExercise}
                    onDuplicate={duplicateStep}
                    onDelete={deleteStep}
                  />
                ) : (
                  <StepCard
                    key={step.id}
                    step={step}
                    onUpdate={updateStep}
                    onDuplicate={duplicateStep}
                    onDelete={deleteStep}
                  />
                )
              )}
            </div>
          </SortableContext>
        </DndContext>
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => addStep()}
          >
            + Étape
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => addStep({ name: 'Repos', duration: 60, repetition: null })}
          >
            + Repos
          </button>
          <button
            type="button"
            className="btn btn-ghost !text-work !border-work/40"
            onClick={addSuperset}
          >
            + Superset
          </button>
        </div>
      </section>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Supprimer le profil">
          <div className="card p-6 w-full max-w-sm flex flex-col gap-4">
            <h2 className="display-name text-2xl text-center text-ink">Supprimer le profil</h2>
            <p className="text-center text-muted text-sm">
              Supprimer « {profiles.find((p) => p.id === activeProfileId)?.name} » ?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-danger flex-1"
                onClick={handleDeleteActiveProfile}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit profile modal */}
      {profileModal && (
        <ProfileModal
          title={profileModal.mode === 'create' ? 'Nouveau profil' : 'Modifier le profil'}
          placeholder={profileModal.mode === 'create' ? 'Ex: Push day' : 'Nouveau nom'}
          confirmLabel={profileModal.mode === 'create' ? 'Sauvegarder' : 'Modifier'}
          initialName={profileModal.initialName || ''}
          onConfirm={handleProfileModalConfirm}
          onClose={() => setProfileModal(null)}
        />
      )}
    </main>
  );
}
