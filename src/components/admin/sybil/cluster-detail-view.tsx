/**
 * SybilClusterDetailView - Detail view for a single sybil cluster.
 * Shows member table and action buttons (Monitor/Dismiss/Ban).
 * @see specs/prd-web.md Section P2.10
 */

import { ArrowLeft } from '@phosphor-icons/react'
import { StatusBadge } from '@/components/admin/sybil/status-badge'
import { SuspicionBar } from '@/components/admin/sybil/suspicion-bar'
import type { SybilClusterDetail, SybilClusterStatus } from '@/lib/api/types'

interface SybilClusterDetailViewProps {
  detail: SybilClusterDetail
  onBack: () => void
  onAction: (status: SybilClusterStatus) => void
}

export function SybilClusterDetailView({ detail, onBack, onAction }: SybilClusterDetailViewProps) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Back to cluster list"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to clusters
      </button>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Cluster #{detail.id}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{detail.memberCount} members</span>
              <StatusBadge status={detail.status} />
              <SuspicionBar ratio={detail.suspicionRatio} />
            </div>
          </div>
          <div className="flex gap-2">
            {detail.status !== 'monitoring' && (
              <button
                type="button"
                onClick={() => onAction('monitoring')}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Monitor
              </button>
            )}
            {detail.status !== 'dismissed' && (
              <button
                type="button"
                onClick={() => onAction('dismissed')}
                aria-label="Dismiss cluster"
                className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Dismiss
              </button>
            )}
            {detail.status !== 'banned' && (
              <button
                type="button"
                onClick={() => onAction('banned')}
                aria-label="Ban cluster"
                className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Ban
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Member table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Handle</th>
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Role</th>
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Trust</th>
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Reputation</th>
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Account age</th>
              <th className="pb-2 font-medium text-muted-foreground">Communities</th>
            </tr>
          </thead>
          <tbody>
            {detail.members.map((member) => (
              <tr key={member.did} className="border-b border-border last:border-0">
                <td className="py-2 pr-4">
                  <div>
                    <p className="font-medium text-foreground">{member.handle}</p>
                    <p className="text-xs text-muted-foreground">{member.displayName}</p>
                  </div>
                </td>
                <td className="py-2 pr-4">
                  <StatusBadge status={member.roleInCluster} />
                </td>
                <td className="py-2 pr-4 text-muted-foreground">
                  {(member.trustScore * 100).toFixed(0)}%
                </td>
                <td className="py-2 pr-4 text-muted-foreground">
                  {(member.reputationScore * 100).toFixed(0)}%
                </td>
                <td className="py-2 pr-4 text-muted-foreground">{member.accountAge}</td>
                <td className="py-2 text-muted-foreground">{member.communitiesActiveIn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
