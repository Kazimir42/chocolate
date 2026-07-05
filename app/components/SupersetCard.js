'use client';

import { memo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandleIcon, TrashIcon, CopyIcon } from './icons';
import { SupersetExerciseRow } from './SupersetExerciseRow';

/**
 * Card component for editing a superset step.
 * Rests between exercises and between sets are injected automatically
 * at execution time from the two rest fields.
 * Memoized + sortable: only re-renders when its own step changes.
 */
export const SupersetCard = memo(function SupersetCard({
  step,
  onUpdateField,
  onAddExercise,
  onUpdateExercise,
  onReorderExercises,
  onRemoveExercise,
  onDuplicate,
  onDelete,
}) {
  const exercises = step.exercises || [];

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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

  const handleNumberField = (field, value, min = 0) => {
    if (field === 'sets') {
      onUpdateField(step.id, field, Math.max(1, parseInt(value, 10) || 1));
    } else {
      const parsed = parseInt(value, 10);
      onUpdateField(step.id, field, Number.isNaN(parsed) ? null : Math.max(min, parsed));
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="card p-4 flex flex-col gap-4 border-l-4 !border-l-work">
      {/* Header: handle, type, actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none p-2 -m-1 text-muted"
          aria-label="Réordonner"
          {...attributes}
          {...listeners}
        >
          <DragHandleIcon />
        </button>
        <span className="eyebrow !text-work">Superset</span>
        <div className="flex-1" />
        <button
          type="button"
          className="btn-ghost rounded-lg p-2.5 text-muted"
          onClick={() => onDuplicate(step.id)}
          aria-label="Dupliquer le superset"
        >
          <CopyIcon />
        </button>
        <button
          type="button"
          className="btn-ghost rounded-lg p-2.5 text-danger"
          onClick={() => onDelete(step.id)}
          aria-label="Supprimer le superset"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Superset name */}
      <input
        className="field p-3 text-lg w-full"
        type="text"
        value={step.name}
        onChange={(e) => onUpdateField(step.id, 'name', e.target.value)}
        placeholder="Nom du superset"
        aria-label="Nom"
      />

      {/* Sets + auto rests */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="eyebrow" htmlFor={`superset-sets-${step.id}`}>
            Séries
          </label>
          <input
            id={`superset-sets-${step.id}`}
            className="field p-3 text-lg text-center w-full"
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={step.sets || 1}
            onChange={(e) => handleNumberField('sets', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="eyebrow" htmlFor={`superset-restex-${step.id}`}>
            Repos exo
          </label>
          <input
            id={`superset-restex-${step.id}`}
            className="field p-3 text-lg text-center w-full"
            type="number"
            inputMode="numeric"
            min={0}
            max={3600}
            value={step.restBetweenExercises ?? ''}
            onChange={(e) => handleNumberField('restBetweenExercises', e.target.value)}
            placeholder="—"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="eyebrow" htmlFor={`superset-restsets-${step.id}`}>
            Repos série
          </label>
          <input
            id={`superset-restsets-${step.id}`}
            className="field p-3 text-lg text-center w-full"
            type="number"
            inputMode="numeric"
            min={0}
            max={3600}
            value={step.restBetweenSets ?? ''}
            onChange={(e) => handleNumberField('restBetweenSets', e.target.value)}
            placeholder="—"
          />
        </div>
      </div>

      {/* Sub-exercises with nested DndContext */}
      <div className="flex flex-col gap-2">
        <span className="eyebrow">Exercices</span>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={exercises.map((ex) => ex.id)} strategy={verticalListSortingStrategy}>
            {exercises.map((ex) => (
              <SupersetExerciseRow
                key={ex.id}
                exercise={ex}
                supersetId={step.id}
                onUpdate={onUpdateExercise}
                onRemove={onRemoveExercise}
                canRemove={exercises.length > 1}
              />
            ))}
          </SortableContext>
        </DndContext>
        <button
          type="button"
          className="btn btn-ghost text-sm py-2.5"
          onClick={() => onAddExercise(step.id)}
        >
          + Exercice
        </button>
      </div>
    </div>
  );
});
