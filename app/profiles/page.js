'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProfiles } from '../hooks';
import { HomeIcon, TrashIcon } from '../components';

export default function ProfilesPage() {
  const {
    profiles,
    activeProfileId,
    saveProfile,
    loadProfile,
    deleteProfile,
    renameProfile,
  } = useProfiles();

  const [showModal, setShowModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleSave = () => {
    const name = profileName.trim();
    if (!name) return;
    saveProfile(name);
    setProfileName('');
    setShowModal(false);
  };

  const handleLoad = (id) => {
    loadProfile(id);
  };

  const handleDelete = (id) => {
    deleteProfile(id);
  };

  const handleRenameStart = (profile) => {
    setEditingId(profile.id);
    setEditingName(profile.name);
  };

  const handleRenameConfirm = () => {
    const name = editingName.trim();
    if (name && editingId) {
      renameProfile(editingId, name);
    }
    setEditingId(null);
    setEditingName('');
  };

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
        <h1 className="font-bold text-2xl">Profils</h1>
        <div className="w-12"></div>
      </div>

      {/* Save current workout */}
      <section className="w-full max-w-md">
        <button
          type="button"
          className="btn-orange text-white w-full"
          onClick={() => setShowModal(true)}
        >
          Sauvegarder l&apos;entraînement actuel
        </button>
      </section>

      {/* Profiles list */}
      <section className="w-full max-w-md flex flex-col gap-4">
        {profiles.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-text-muted">Aucun profil sauvegardé</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <div key={profile.id} className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                {editingId === profile.id ? (
                  <input
                    className="glass-input p-2 text-white flex-1 mr-2"
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleRenameConfirm}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameConfirm();
                      if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditingName('');
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    className="font-bold text-lg text-left"
                    onClick={() => handleRenameStart(profile)}
                    title="Renommer"
                  >
                    {profile.name}
                  </button>
                )}
                {activeProfileId === profile.id && (
                  <span className="text-xs font-semibold bg-orange text-white px-2 py-1 rounded-full">
                    Actif
                  </span>
                )}
              </div>

              <p className="text-sm text-text-muted">
                {profile.steps.length} étape{profile.steps.length !== 1 ? 's' : ''} · {profile.cyclesNumber} cycle{profile.cyclesNumber !== 1 ? 's' : ''}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-glass p-2 px-4 text-sm flex-1"
                  onClick={() => handleLoad(profile.id)}
                >
                  Charger
                </button>
                <button
                  type="button"
                  className="btn-glass p-2 text-red-400"
                  onClick={() => handleDelete(profile.id)}
                  aria-label="Supprimer"
                >
                  <TrashIcon className="size-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Save modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-sm flex flex-col gap-4">
            <h2 className="font-bold text-xl text-center">Nom du profil</h2>
            <input
              className="glass-input p-3 text-white w-full"
              type="text"
              placeholder="Ex: Push day"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
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
                onClick={handleSave}
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
