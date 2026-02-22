/**
 * ModerationActionLogTab - Read-only list of moderation action log entries.
 * @see specs/prd-web.md Section M11
 */

import { formatDate } from '@/lib/format'
import type { ModerationLogEntry } from '@/lib/api/types'

const ACTION_TYPE_LABELS: Record<string, string> = {
  lock: 'Locked',
  unlock: 'Unlocked',
  pin: 'Pinned',
  unpin: 'Unpinned',
  delete: 'Deleted',
  ban: 'Banned',
  unban: 'Unbanned',
  warn: 'Warned',
  label: 'Labeled',
  approve: 'Approved',
  reject: 'Rejected',
}

interface ModerationActionLogTabProps {
  entries: ModerationLogEntry[]
}

export function ModerationActionLogTab({ entries }: ModerationActionLogTabProps) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">
              <span className="font-medium">{entry.moderatorHandle}</span>{' '}
              <span className="text-muted-foreground">
                {ACTION_TYPE_LABELS[entry.actionType] ?? entry.actionType}
              </span>
              {entry.targetHandle && (
                <span className="text-muted-foreground"> {entry.targetHandle}</span>
              )}
            </p>
            <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
          </div>
          {entry.reason && (
            <p className="mt-1 text-xs text-muted-foreground italic">{entry.reason}</p>
          )}
        </div>
      ))}
      {entries.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No moderation actions recorded.</p>
      )}
    </div>
  )
}
