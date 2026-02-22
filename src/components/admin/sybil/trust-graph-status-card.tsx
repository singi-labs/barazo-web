/**
 * TrustGraphStatusCard - Displays trust graph computation status and recompute button.
 * @see specs/prd-web.md Section P2.10
 */

import { formatRelativeTime, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

interface TrustGraphStatusCardProps {
  status: {
    lastComputedAt: string | null
    totalNodes: number
    totalEdges: number
    clustersFlagged: number
  }
  onRecompute: () => void
  recomputing: boolean
}

export function TrustGraphStatusCard({
  status,
  onRecompute,
  recomputing,
}: TrustGraphStatusCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {status.lastComputedAt
              ? `Last computed: ${formatRelativeTime(status.lastComputedAt)}`
              : 'Never computed'}
            {' | '}
            <span>{formatNumber(status.totalNodes)} nodes</span>
            {' | '}
            <span>{formatNumber(status.totalEdges)} edges</span>
            {' | '}
            <span>{status.clustersFlagged} clusters flagged</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onRecompute}
          disabled={recomputing}
          aria-label="Recompute now"
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            recomputing
              ? 'cursor-not-allowed bg-muted text-muted-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {recomputing ? 'Recomputing...' : 'Recompute Now'}
        </button>
      </div>
    </div>
  )
}
