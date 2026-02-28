'use client';

import { ArrowUpIcon, ArrowDownIcon, TrashIcon } from './icons';

/**
 * Compact editor row for a sub-exercise inside a superset
 */
export function SupersetExerciseRow({ exercise, supersetId, index, onUpdate, onMove, onRemove, isFirst, isLast, canRemove }) {
  const handleFieldChange = (field, value) => {
    let processedValue = value;
    if (field === 'duration' || field === 'repetition') {
      processedValue = value === '' ? null : parseInt(value, 10);
    }
    onUpdate(supersetId, exercise.id, field, processedValue);
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
      <div className="flex flex-col shrink-0">
        <button
          type="button"
          className="p-0.5 text-text-muted disabled:opacity-20"
          onClick={() => onMove(supersetId, exercise.id, 'up')}
          disabled={isFirst}
          aria-label="Monter"
        >
          <ArrowUpIcon className="size-3" />
        </button>
        <button
          type="button"
          className="p-0.5 text-text-muted disabled:opacity-20"
          onClick={() => onMove(supersetId, exercise.id, 'down')}
          disabled={isLast}
          aria-label="Descendre"
        >
          <ArrowDownIcon className="size-3" />
        </button>
      </div>
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
