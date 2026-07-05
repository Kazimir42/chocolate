'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandleIcon, TrashIcon, CopyIcon } from './icons';

/**
 * Card component for editing a workout step.
 * Memoized + sortable: only re-renders when its own step changes.
 */
export const StepCard = memo(function StepCard({ step, onUpdate, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFieldChange = (field, value) => {
    let processedValue = value;

    if (field === 'duration' || field === 'repetition' || field === 'restBetweenSets') {
      processedValue = value === '' ? null : parseInt(value, 10);
    }
    if (field === 'sets') {
      processedValue = Math.max(1, parseInt(value, 10) || 1);
    }

    onUpdate(step.id, field, processedValue);
  };

  return (
    <div ref={setNodeRef} style={style} className="card p-4 flex flex-col gap-4">
      {/* Header: handle, type, actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none p-2 -m-1 text-muted"
          aria-label="Réordonner"
          {...attributes}
          {...listeners}
        >
          <DragHandleIcon />
        </button>
        <span className="eyebrow">Étape</span>
        <div className="flex-1" />
        <button
          type="button"
          className="btn-ghost rounded-lg p-2.5 text-muted"
          onClick={() => onDuplicate(step.id)}
          aria-label="Dupliquer l'étape"
        >
          <CopyIcon />
        </button>
        <button
          type="button"
          className="btn-ghost rounded-lg p-2.5 text-danger"
          onClick={() => onDelete(step.id)}
          aria-label="Supprimer l'étape"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Name gets the full width */}
      <input
        className="field p-3 text-lg w-full"
        type="text"
        value={step.name}
        onChange={(e) => handleFieldChange('name', e.target.value)}
        placeholder="Nom de l'exercice"
        aria-label="Nom"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="eyebrow" htmlFor={`step-duration-${step.id}`}>
            Durée (sec)
          </label>
          <input
            id={`step-duration-${step.id}`}
            className="field p-3 text-lg text-center w-full"
            type="number"
            inputMode="numeric"
            min={0}
            max={3600}
            value={step.duration ?? ''}
            onChange={(e) => handleFieldChange('duration', e.target.value)}
            placeholder="—"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="eyebrow" htmlFor={`step-repetition-${step.id}`}>
            Répétitions
          </label>
          <input
            id={`step-repetition-${step.id}`}
            className="field p-3 text-lg text-center w-full"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={step.repetition ?? ''}
            onChange={(e) => handleFieldChange('repetition', e.target.value)}
            placeholder="—"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="eyebrow" htmlFor={`step-sets-${step.id}`}>
            Séries
          </label>
          <input
            id={`step-sets-${step.id}`}
            className="field p-3 text-lg text-center w-full"
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={step.sets ?? 1}
            onChange={(e) => handleFieldChange('sets', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="eyebrow" htmlFor={`step-rest-${step.id}`}>
            Repos série (sec)
          </label>
          <input
            id={`step-rest-${step.id}`}
            className="field p-3 text-lg text-center w-full"
            type="number"
            inputMode="numeric"
            min={0}
            max={3600}
            value={step.restBetweenSets ?? ''}
            onChange={(e) => handleFieldChange('restBetweenSets', e.target.value)}
            placeholder="—"
          />
        </div>
      </div>
    </div>
  );
});
