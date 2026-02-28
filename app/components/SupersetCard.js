'use client';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { DragHandleIcon, TrashIcon, CopyIcon } from './icons';
import { SortableItem } from './SortableItem';
import { SupersetExerciseRow } from './SupersetExerciseRow';

/**
 * Card component for editing a superset step
 */
export function SupersetCard({
  step,
  onUpdateField,
  onAddExercise,
  onUpdateExercise,
  onReorderExercises,
  onRemoveExercise,
  onDuplicate,
  onDelete,
  dragHandleProps,
}) {
  const exercises = step.exercises || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = exercises.findIndex((ex) => ex.id === active.id);
    const newIndex = exercises.findIndex((ex) => ex.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderExercises(step.id, oldIndex, newIndex);
    }
  };

  return (
    <div className="glass-card p-4 flex flex-col gap-4 border-l-4 border-orange">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none p-1 text-text-muted"
          aria-label="Réordonner"
          {...dragHandleProps}
        >
          <DragHandleIcon />
        </button>
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

      {/* Sub-exercises with nested DndContext */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm text-text-muted uppercase tracking-wide">
          Exercices
        </label>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={exercises.map((ex) => ex.id)} strategy={verticalListSortingStrategy}>
            {exercises.map((ex) => (
              <SortableItem key={ex.id} id={ex.id}>
                {(exDragHandleProps) => (
                  <SupersetExerciseRow
                    exercise={ex}
                    supersetId={step.id}
                    onUpdate={onUpdateExercise}
                    onRemove={onRemoveExercise}
                    canRemove={exercises.length > 1}
                    dragHandleProps={exDragHandleProps}
                  />
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
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
      <div className="flex flex-row justify-end pt-2">
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
