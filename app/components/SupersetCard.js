'use client';

import { ArrowUpIcon, ArrowDownIcon, TrashIcon, CopyIcon } from './icons';
import { SupersetExerciseRow } from './SupersetExerciseRow';

/**
 * Card component for editing a superset step
 */
export function SupersetCard({
  step,
  onUpdateField,
  onAddExercise,
  onUpdateExercise,
  onMoveExercise,
  onRemoveExercise,
  onDuplicate,
  onDelete,
  onMove,
  isFirst,
  isLast,
}) {
  const exercises = step.exercises || [];

  return (
    <div className="glass-card p-4 flex flex-col gap-4 border-l-4 border-orange">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-orange bg-orange/20 px-2 py-1 rounded">
          Superset
        </span>
      </div>

      {/* Superset name */}
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm text-text-muted uppercase tracking-wide" htmlFor={`superset-name-${step.id}`}>
          Nom
        </label>
        <input
          id={`superset-name-${step.id}`}
          className="glass-input p-3 text-lg text-white w-full"
          type="text"
          value={step.name}
          onChange={(e) => onUpdateField(step.id, 'name', e.target.value)}
        />
      </div>

      {/* Sets */}
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm text-text-muted uppercase tracking-wide" htmlFor={`superset-sets-${step.id}`}>
          Séries
        </label>
        <input
          id={`superset-sets-${step.id}`}
          className="glass-input p-3 text-lg text-white text-center w-full"
          type="number"
          min={1}
          max={99}
          value={step.sets || 1}
          onChange={(e) => onUpdateField(step.id, 'sets', parseInt(e.target.value, 10) || 1)}
        />
      </div>

      {/* Sub-exercises */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm text-text-muted uppercase tracking-wide">
          Exercices
        </label>
        {exercises.map((ex, i) => (
          <SupersetExerciseRow
            key={ex.id}
            exercise={ex}
            supersetId={step.id}
            index={i}
            onUpdate={onUpdateExercise}
            onMove={onMoveExercise}
            onRemove={onRemoveExercise}
            isFirst={i === 0}
            isLast={i === exercises.length - 1}
            canRemove={exercises.length > 1}
          />
        ))}
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-glass p-2 text-sm text-orange-light flex-1"
            onClick={() => onAddExercise(step.id)}
          >
            + Exercice
          </button>
          <button
            type="button"
            className="btn-glass p-2 text-sm text-text-muted flex-1"
            onClick={() => onAddExercise(step.id, { name: 'Repos', duration: 60, repetition: null })}
          >
            + Repos
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row justify-between pt-2">
        <div className="flex flex-row gap-2">
          <button
            type="button"
            className="btn-glass p-2 disabled:opacity-30"
            onClick={() => onMove('up', step.id)}
            disabled={isFirst}
            aria-label="Monter l'étape"
          >
            <ArrowUpIcon />
          </button>
          <button
            type="button"
            className="btn-glass p-2 disabled:opacity-30"
            onClick={() => onMove('down', step.id)}
            disabled={isLast}
            aria-label="Descendre l'étape"
          >
            <ArrowDownIcon />
          </button>
        </div>
        <div className="flex flex-row gap-2">
          <button
            type="button"
            className="btn-glass p-2"
            onClick={() => onDuplicate(step.id)}
            aria-label="Dupliquer le superset"
          >
            <CopyIcon />
          </button>
          <button
            type="button"
            className="btn-glass p-2 text-danger-coral hover:bg-danger-coral/20 hover:border-danger-coral/50"
            onClick={() => onDelete(step.id)}
            aria-label="Supprimer le superset"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
