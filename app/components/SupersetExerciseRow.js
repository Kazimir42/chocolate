'use client';

import { DragHandleIcon, TrashIcon } from './icons';

/**
 * Compact editor row for a sub-exercise inside a superset
 */
export function SupersetExerciseRow({ exercise, supersetId, onUpdate, onRemove, canRemove, dragHandleProps }) {
  const handleFieldChange = (field, value) => {
    let processedValue = value;
    if (field === 'duration' || field === 'repetition') {
      processedValue = value === '' ? null : parseInt(value, 10);
    }
    onUpdate(supersetId, exercise.id, field, processedValue);
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none p-0.5 text-text-muted"
        aria-label="Réordonner"
        {...dragHandleProps}
      >
        <DragHandleIcon className="size-4" />
      </button>
      <input
        className="glass-input p-2 text-sm text-white flex-1 min-w-0"
        type="text"
        value={exercise.name}
        onChange={(e) => handleFieldChange('name', e.target.value)}
        placeholder="Nom"
      />
      <input
        className="glass-input p-2 text-sm text-white text-center w-16"
        type="number"
        min={0}
        max={3600}
        value={exercise.duration ?? ''}
        onChange={(e) => handleFieldChange('duration', e.target.value)}
        placeholder="Sec"
      />
      <input
        className="glass-input p-2 text-sm text-white text-center w-16"
        type="number"
        min={0}
        max={999}
        value={exercise.repetition ?? ''}
        onChange={(e) => handleFieldChange('repetition', e.target.value)}
        placeholder="Reps"
      />
      {canRemove && (
        <button
          type="button"
          className="p-1 text-danger-coral hover:bg-danger-coral/20 rounded shrink-0"
          onClick={() => onRemove(supersetId, exercise.id)}
          aria-label="Supprimer l'exercice"
        >
          <TrashIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
