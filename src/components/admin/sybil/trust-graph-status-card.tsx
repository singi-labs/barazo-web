/**
 * TrustGraphStatusCard - Displays trust graph computation status and recompute button.
 * @see specs/prd-web.md Section P2.10
 */

import { formatRelativeTime, formatNumber } from '@/lib/format'
import { SaveButton } from '@/components/admin/save-button'
import type { SaveStatus } from '@/hooks/use-save-state'

interface TrustGraphStatusCardProps {
  status: {
    lastComputedAt: string | null
    totalNodes: number
    totalEdges: number
    clustersFlagged: number
  }
  onRecompute: () => void
  saveStatus: SaveStatus
}

export function TrustGraphStatusCard({
  status,
  onRecompute,
  saveStatus,
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
        <SaveButton
          status={saveStatus}
          onClick={onRecompute}
          label="Recompute Now"
          savingLabel="Recomputing..."
          savedLabel="Started"
        />
      </div>
    </div>
  )
}
