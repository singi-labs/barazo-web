/**
 * CategoryTreeDnD - DnD wrapper for the admin category tree.
 * Handles drag-and-drop reordering and reparenting of categories.
 */

'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { CategoryTreeNode } from '@/lib/api/types'
import { flattenCategoryTree } from '@/lib/flatten-category-tree'
import { DraggableCategoryRow } from './category-row'

interface CategoryTreeDnDProps {
  categories: CategoryTreeNode[]
  onMove: (categoryId: string, newParentId: string | null, newSortOrder: number) => void
  onEdit: (cat: CategoryTreeNode) => void
  onDelete: (id: string) => void
}

export function CategoryTreeDnD({ categories, onMove, onEdit, onDelete }: CategoryTreeDnDProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const flatItems = flattenCategoryTree(categories)
  const itemIds = flatItems.map((item) => item.category.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeItem = flatItems.find((i) => i.category.id === active.id)
      const overItem = flatItems.find((i) => i.category.id === over.id)
      if (!activeItem || !overItem) return

      const newParentId = overItem.category.parentId
      const siblingsAtLevel = flatItems.filter((i) => i.category.parentId === newParentId)
      const overIndex = siblingsAtLevel.findIndex((i) => i.category.id === over.id)
      const newSortOrder = Math.max(0, overIndex)

      onMove(String(active.id), newParentId, newSortOrder)
    },
    [flatItems, onMove]
  )

  const activeItem = activeId ? flatItems.find((i) => i.category.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {categories.map((category) => (
            <DraggableCategoryRow
              key={category.id}
              category={category}
              depth={0}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <div className="rounded-md border border-primary bg-card p-3 shadow-lg opacity-90">
            <p className="text-sm font-medium text-foreground">{activeItem.category.name}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
