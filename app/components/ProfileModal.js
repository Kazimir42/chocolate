'use client';

import { useState, useEffect } from 'react';

export function ProfileModal({ title, placeholder, confirmLabel, initialName = '', onConfirm, onClose }) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="font-bold text-xl text-center">{title}</h2>
        <input
          className="glass-input p-3 text-white w-full"
          type="text"
          placeholder={placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
          }}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-glass p-3 flex-1"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn-orange text-white flex-1 disabled:opacity-40"
            onClick={handleConfirm}
            disabled={!name.trim()}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
