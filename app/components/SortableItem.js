'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Wrapper component that makes an item sortable via @dnd-kit.
 * Uses a render prop (children function) to inject dragHandleProps
 * so that only the drag handle initiates dragging, not the whole card.
 *
 * @param {string|number} id - Unique identifier for this sortable item
 * @param {function} children - Render prop: (dragHandleProps) => ReactNode
 */
export function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(dragHandleProps)}
    </div>
  );
}
