/**
 * CategoryRow - Recursive tree row for a single category with edit/delete controls.
 * @see specs/prd-web.md Section M11
 */

import { PencilSimple, TrashSimple } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { CategoryTreeNode, MaturityRating } from '@/lib/api/types'

const MATURITY_LABELS: Record<MaturityRating, string> = {
  safe: 'Safe',
  mature: 'Mature',
  adult: 'Adult',
}

const MATURITY_COLORS: Record<MaturityRating, string> = {
  safe: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  mature: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  adult: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

interface CategoryRowProps {
  category: CategoryTreeNode
  depth: number
  onEdit: (cat: CategoryTreeNode) => void
  onDelete: (id: string) => void
}

export function CategoryRow({ category, depth, onEdit, onDelete }: CategoryRowProps) {
  return (
    <>
      <div
        data-depth={depth}
        className={cn(
          'flex items-center justify-between rounded-md border border-border bg-card p-3',
          depth > 0 && 'ml-6'
        )}
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">{category.name}</p>
            {category.description && (
              <p className="text-xs text-muted-foreground">{category.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              MATURITY_COLORS[category.maturityRating]
            )}
          >
            {MATURITY_LABELS[category.maturityRating]}
          </span>
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${category.name}`}
          >
            <PencilSimple size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category.id)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${category.name}`}
          >
            <TrashSimple size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      {category.children.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}
