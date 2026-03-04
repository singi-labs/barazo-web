/**
 * PageRow - Recursive tree row for a single page with edit/delete controls.
 * Follows CategoryRow pattern for consistency.
 */

import Link from 'next/link'
import { PencilSimple, TrashSimple } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { PageTreeNode, PageStatus } from '@/lib/api/types'

const STATUS_LABELS: Record<PageStatus, string> = {
  draft: 'Draft',
  published: 'Published',
}

const STATUS_COLORS: Record<PageStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

interface PageRowProps {
  page: PageTreeNode
  depth: number
  onDelete: (id: string) => void
}

export function PageRow({ page, depth, onDelete }: PageRowProps) {
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
            <p className="text-sm font-medium text-foreground">{page.title}</p>
            <p className="text-xs text-muted-foreground">/p/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              STATUS_COLORS[page.status]
            )}
          >
            {STATUS_LABELS[page.status]}
          </span>
          <Link
            href={`/admin/pages/${page.id}`}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${page.title}`}
          >
            <PencilSimple size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(page.id)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${page.title}`}
          >
            <TrashSimple size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      {page.children.map((child) => (
        <PageRow key={child.id} page={child} depth={depth + 1} onDelete={onDelete} />
      ))}
    </>
  )
}
