'use client';

import { DragHandleIcon, TrashIcon, CopyIcon } from './icons';

/**
 * Card component for editing a workout step
 */
export function StepCard({ step, onUpdate, onDelete, onDuplicate, dragHandleProps }) {
  const handleFieldChange = (field, value) => {
    let processedValue = value;

    if (field === 'duration' || field === 'repetition') {
      processedValue = value === '' ? null : parseInt(value, 10);
    }

    onUpdate(step.id, field, processedValue);
  };

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none p-1 text-text-muted"
          aria-label="Réordonner"
          {...dragHandleProps}
        >
          <DragHandleIcon />
        </button>
        <span className="text-xs font-bold uppercase tracking-wide text-blue-400 bg-blue-400/20 px-2 py-1 rounded">
          Étape
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm text-text-muted uppercase tracking-wide" htmlFor={`step-name-${step.id}`}>
          Nom
        </label>
        <input
          id={`step-name-${step.id}`}
          className="glass-input p-3 text-lg text-white w-full"
          type="text"
          value={step.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
        />
      </div>

      <div className="flex flex-row gap-3 w-full">
        <div className="flex flex-col gap-1 flex-1">
          <label className="font-semibold text-sm text-text-muted uppercase tracking-wide" htmlFor={`step-duration-${step.id}`}>
            Durée (sec)
          </label>
          <input
            id={`step-duration-${step.id}`}
            className="glass-input p-3 text-lg text-white text-center w-full"
            type="number"
            min={0}
            max={3600}
            value={step.duration ?? ''}
            onChange={(e) => handleFieldChange('duration', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="font-semibold text-sm text-text-muted uppercase tracking-wide" htmlFor={`step-repetition-${step.id}`}>
            Répétitions
          </label>
          <input
            id={`step-repetition-${step.id}`}
            className="glass-input p-3 text-lg text-white text-center w-full"
            type="number"
            min={0}
            max={999}
            value={step.repetition ?? ''}
            onChange={(e) => handleFieldChange('repetition', e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-row justify-end pt-2">
        <div className="flex flex-row gap-2">
          <button
            type="button"
            className="btn-glass p-2"
            onClick={() => onDuplicate(step.id)}
            aria-label="Dupliquer l'étape"
          >
            <CopyIcon />
          </button>
          <button
            type="button"
            className="btn-glass p-2 text-danger-coral hover:bg-danger-coral/20 hover:border-danger-coral/50"
            onClick={() => onDelete(step.id)}
            aria-label="Supprimer l'étape"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
