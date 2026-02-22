/**
 * ModerationFirstPostTab - First-post approval queue with batch actions.
 * Shows account age, cross-community activity, and ban warnings.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState } from 'react'
import { ShieldCheck, Clock, Prohibit } from '@phosphor-icons/react'
import { formatDate } from '@/lib/format'
import type { FirstPostQueueItem } from '@/lib/api/types'

interface ModerationFirstPostTabProps {
  items: FirstPostQueueItem[]
  onResolve: (id: string, action: 'approved' | 'rejected') => void
  onBatchResolve: (ids: string[], action: 'approved' | 'rejected') => void
}

export function ModerationFirstPostTab({
  items,
  onResolve,
  onBatchResolve,
}: ModerationFirstPostTabProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allSelected = items.length > 0 && selectedIds.size === items.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)))
    }
  }

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBatchAction = (action: 'approved' | 'rejected') => {
    const ids = Array.from(selectedIds)
    onBatchResolve(ids, action)
    setSelectedIds(new Set())
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="rounded border-border"
              aria-label="Select all"
            />
            Select all ({items.length})
          </label>
          {selectedIds.size > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleBatchAction('approved')}
                className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700"
              >
                Approve selected ({selectedIds.size})
              </button>
              <button
                type="button"
                onClick={() => handleBatchAction('rejected')}
                className="rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Reject selected ({selectedIds.size})
              </button>
            </div>
          )}
        </div>
      )}
      {items.map((item) => (
        <article key={item.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedIds.has(item.id)}
              onChange={() => toggleItem(item.id)}
              className="mt-1 rounded border-border"
              aria-label={`Select post by ${item.authorHandle}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{item.authorHandle}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} aria-hidden="true" />
                  New account, {item.accountAge} old
                </span>
                {item.crossCommunityCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck size={12} aria-hidden="true" />
                    Active in {item.crossCommunityCount} other communities
                  </span>
                )}
                {item.bannedFromOtherCommunities > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium text-destructive">
                    <Prohibit size={12} aria-hidden="true" />
                    Banned from {item.bannedFromOtherCommunities} other{' '}
                    {item.bannedFromOtherCommunities === 1 ? 'community' : 'communities'}
                  </span>
                )}
              </div>
              {item.title && (
                <p className="mt-2 text-sm font-medium text-foreground">{item.title}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.contentType === 'topic' ? 'Topic' : 'Reply'} &middot;{' '}
                {formatDate(item.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onResolve(item.id, 'approved')}
                className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => onResolve(item.id, 'rejected')}
                className="rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Reject
              </button>
            </div>
          </div>
        </article>
      ))}
      {items.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No posts awaiting approval.</p>
      )}
    </div>
  )
}
