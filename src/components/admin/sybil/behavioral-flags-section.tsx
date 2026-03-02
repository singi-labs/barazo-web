/**
 * BehavioralFlagsSection - List of behavioral flags with dismiss capability.
 * @see specs/prd-web.md Section P2.10
 */

import { formatRelativeTime } from '@/lib/format'
import { StatusBadge } from '@/components/admin/sybil/status-badge'
import type { BehavioralFlag } from '@/lib/api/types'

interface BehavioralFlagsSectionProps {
  flags: BehavioralFlag[]
  onDismiss: (id: number) => void
}

export function BehavioralFlagsSection({ flags, onDismiss }: BehavioralFlagsSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Behavioral flags</h2>
      {flags.length === 0 && (
        <p className="py-4 text-center text-muted-foreground">No behavioral flags.</p>
      )}
      {flags.map((flag) => (
        <article key={flag.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{flag.flagType}</span>
                <StatusBadge status={flag.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{flag.details}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {flag.affectedDids.length} affected accounts &middot; Detected{' '}
                {formatRelativeTime(flag.detectedAt)}
              </p>
            </div>
            {flag.status === 'pending' && (
              <button
                type="button"
                onClick={() => onDismiss(flag.id)}
                aria-label="Dismiss flag"
                className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Dismiss
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
