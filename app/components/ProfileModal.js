'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function ProfileModal({ title, placeholder, confirmLabel, initialName = '', onConfirm, onClose }) {
  const [name, setName] = useState(initialName);
  const dialogRef = useRef(null);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  // Focus trap
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll(
      'input, button, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [onClose]);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={handleKeyDown}
    >
      <div ref={dialogRef} className="card p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="display-name text-2xl text-center text-ink">{title}</h2>
        <input
          className="field p-3 w-full"
          type="text"
          placeholder={placeholder}
          value={name}
          maxLength={50}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
          }}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary flex-1 disabled:opacity-40"
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
