'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandleIcon, TrashIcon } from './icons';

/**
 * Editor row for a sub-exercise inside a superset.
 * Two lines: the name gets a full line to itself, numbers go below.
 * Memoized + sortable: only re-renders when its own exercise changes.
 */
export const SupersetExerciseRow = memo(function SupersetExerciseRow({ exercise, supersetId, onUpdate, onRemove, canRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exercise.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFieldChange = (field, value) => {
    let processedValue = value;
    if (field === 'duration' || field === 'repetition') {
      processedValue = value === '' ? null : parseInt(value, 10);
    }
    onUpdate(supersetId, exercise.id, field, processedValue);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-2 p-3 rounded-xl bg-raised border border-line">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none p-1.5 -m-1 text-muted"
          aria-label="Réordonner"
          {...attributes}
          {...listeners}
        >
          <DragHandleIcon className="size-4" />
        </button>
        <input
          className="field p-2.5 text-base flex-1 min-w-0 !bg-surface"
          type="text"
          value={exercise.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="Nom"
          aria-label="Nom de l'exercice"
        />
        {canRemove && (
          <button
            type="button"
            className="p-2 text-danger shrink-0"
            onClick={() => onRemove(supersetId, exercise.id)}
            aria-label="Supprimer l'exercice"
          >
            <TrashIcon className="size-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 pl-6">
        <div className="flex items-center gap-2">
          <span className="eyebrow shrink-0">Sec</span>
          <input
            className="field p-2 text-base text-center w-full !bg-surface"
            type="number"
            inputMode="numeric"
            min={0}
            max={3600}
            value={exercise.duration ?? ''}
            onChange={(e) => handleFieldChange('duration', e.target.value)}
            placeholder="—"
            aria-label="Durée (secondes)"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="eyebrow shrink-0">Reps</span>
          <input
            className="field p-2 text-base text-center w-full !bg-surface"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={exercise.repetition ?? ''}
            onChange={(e) => handleFieldChange('repetition', e.target.value)}
            placeholder="—"
            aria-label="Répétitions"
          />
        </div>
      </div>
    </div>
  );
});
