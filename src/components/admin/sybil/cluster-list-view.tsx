/**
 * SybilClusterListView - List of sybil clusters with summary info.
 * @see specs/prd-web.md Section P2.10
 */

import { formatRelativeTime } from '@/lib/format'
import { StatusBadge } from '@/components/admin/sybil/status-badge'
import { SuspicionBar } from '@/components/admin/sybil/suspicion-bar'
import type { SybilCluster } from '@/lib/api/types'

interface SybilClusterListViewProps {
  clusters: SybilCluster[]
  onViewDetail: (id: number) => void
}

export function SybilClusterListView({ clusters, onViewDetail }: SybilClusterListViewProps) {
  if (clusters.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No clusters found.</p>
  }

  return (
    <div className="space-y-2">
      {clusters.map((cluster) => (
        <article key={cluster.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {cluster.memberCount} members
                </span>
                <StatusBadge status={cluster.status} />
                <SuspicionBar ratio={cluster.suspicionRatio} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {cluster.internalEdgeCount} internal / {cluster.externalEdgeCount} external
                connections &middot; Detected {formatRelativeTime(cluster.detectedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onViewDetail(cluster.id)}
              aria-label="View details"
              className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              View details
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
