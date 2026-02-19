/**
 * Admin sybil detection page.
 * URL: /admin/sybil-detection
 * Trust graph status, cluster list, cluster detail, behavioral flags.
 * @see specs/prd-web.md Section P2.10
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import {
  getSybilClusters,
  getSybilClusterDetail,
  updateSybilClusterStatus,
  getTrustGraphStatus,
  recomputeTrustGraph,
  getBehavioralFlags,
  updateBehavioralFlag,
} from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type {
  SybilCluster,
  SybilClusterDetail,
  SybilClusterStatus,
  TrustGraphStatus,
  BehavioralFlag,
} from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// --- Confirm Dialog ---
function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h3 id="confirm-dialog-title" className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p id="confirm-dialog-message" className="mt-2 text-sm text-muted-foreground">
          {message}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Trust Graph Status Card ---
function TrustGraphStatusCard({
  status,
  onRecompute,
  recomputing,
}: {
  status: TrustGraphStatus
  onRecompute: () => void
  recomputing: boolean
}) {
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

// --- Suspicion Ratio Bar ---
function SuspicionBar({ ratio }: { ratio: number }) {
  const percent = Math.round(ratio * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div
          className={cn(
            'h-full rounded-full',
            percent >= 70 ? 'bg-destructive' : percent >= 40 ? 'bg-yellow-500' : 'bg-green-500'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{percent}%</span>
    </div>
  )
}

// --- Status Badge ---
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    flagged: 'bg-destructive/10 text-destructive',
    monitoring: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    dismissed: 'bg-muted text-muted-foreground',
    banned: 'bg-destructive text-destructive-foreground',
    pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    action_taken: 'bg-green-500/10 text-green-700 dark:text-green-400',
  }
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
        colors[status] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {status}
    </span>
  )
}

// --- Cluster List View ---
function ClusterListView({
  clusters,
  onViewDetail,
}: {
  clusters: SybilCluster[]
  onViewDetail: (id: number) => void
}) {
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

// --- Cluster Detail View ---
function ClusterDetailView({
  detail,
  onBack,
  onAction,
}: {
  detail: SybilClusterDetail
  onBack: () => void
  onAction: (status: SybilClusterStatus) => void
}) {
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
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Account Age</th>
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

// --- Behavioral Flags Section ---
function BehavioralFlagsSection({
  flags,
  onDismiss,
}: {
  flags: BehavioralFlag[]
  onDismiss: (id: number) => void
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Behavioral Flags</h2>
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

// --- Main Page ---
export default function AdminSybilDetectionPage() {
  const { getAccessToken } = useAuth()
  const [clusters, setClusters] = useState<SybilCluster[]>([])
  const [graphStatus, setGraphStatus] = useState<TrustGraphStatus | null>(null)
  const [flags, setFlags] = useState<BehavioralFlag[]>([])
  const [selectedDetail, setSelectedDetail] = useState<SybilClusterDetail | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [recomputing, setRecomputing] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  const fetchData = useCallback(async () => {
    setLoadError(null)
    setLoading(true)
    try {
      const token = getAccessToken() ?? ''
      const [clustersRes, statusRes, flagsRes] = await Promise.all([
        getSybilClusters(token),
        getTrustGraphStatus(token),
        getBehavioralFlags(token),
      ])
      setClusters(clustersRes.clusters)
      setGraphStatus(statusRes)
      setFlags(flagsRes.flags)
    } catch {
      setLoadError('Failed to load sybil detection data. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const filteredClusters =
    statusFilter === 'all' ? clusters : clusters.filter((c) => c.status === statusFilter)

  const handleViewDetail = async (id: number) => {
    setActionError(null)
    try {
      const detail = await getSybilClusterDetail(id, getAccessToken() ?? '')
      setSelectedDetail(detail)
    } catch {
      setActionError('Failed to load cluster details.')
    }
  }

  const handleClusterAction = (status: SybilClusterStatus) => {
    if (!selectedDetail) return
    const actionLabel = status === 'banned' ? 'ban' : status === 'dismissed' ? 'dismiss' : status
    setConfirmAction({
      title: `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} cluster`,
      message: `Are you sure you want to ${actionLabel} this cluster with ${selectedDetail.memberCount} members?`,
      onConfirm: async () => {
        setConfirmAction(null)
        try {
          const updated = await updateSybilClusterStatus(
            selectedDetail.id,
            status,
            getAccessToken() ?? ''
          )
          setClusters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
          setSelectedDetail({ ...selectedDetail, ...updated })
        } catch {
          setActionError('Failed to update cluster status.')
        }
      },
    })
  }

  const handleRecompute = async () => {
    setRecomputing(true)
    try {
      await recomputeTrustGraph(getAccessToken() ?? '')
    } catch {
      setActionError('Failed to start recomputation.')
    } finally {
      setRecomputing(false)
    }
  }

  const handleDismissFlag = async (id: number) => {
    setActionError(null)
    try {
      const updated = await updateBehavioralFlag(id, 'dismissed', getAccessToken() ?? '')
      setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    } catch {
      setActionError('Failed to dismiss flag.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sybil Detection</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor the trust graph for suspicious account clusters. The system uses EigenTrust
            scores and behavioral heuristics to detect coordinated inauthentic activity.
          </p>
        </div>

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchData()} />
        )}

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

        {!loading && !loadError && (
          <>
            {/* Trust Graph Status */}
            {graphStatus && (
              <TrustGraphStatusCard
                status={graphStatus}
                onRecompute={() => void handleRecompute()}
                recomputing={recomputing}
              />
            )}

            {/* Cluster List or Detail */}
            {selectedDetail ? (
              <ClusterDetailView
                detail={selectedDetail}
                onBack={() => setSelectedDetail(null)}
                onAction={handleClusterAction}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Clusters</h2>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="cluster-status-filter"
                      className="text-sm text-muted-foreground"
                    >
                      Filter by status
                    </label>
                    <select
                      id="cluster-status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      aria-label="Filter by status"
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                    >
                      <option value="all">All</option>
                      <option value="flagged">Flagged</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="dismissed">Dismissed</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                </div>
                <ClusterListView
                  clusters={filteredClusters}
                  onViewDetail={(id) => void handleViewDetail(id)}
                />
              </div>
            )}

            {/* Behavioral Flags */}
            {!selectedDetail && (
              <BehavioralFlagsSection
                flags={flags}
                onDismiss={(id) => void handleDismissFlag(id)}
              />
            )}
          </>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmAction !== null}
          title={confirmAction?.title ?? ''}
          message={confirmAction?.message ?? ''}
          onConfirm={() => confirmAction?.onConfirm()}
          onCancel={() => setConfirmAction(null)}
        />

        {/* Live region for status updates */}
        <div aria-live="polite" className="sr-only">
          {recomputing && 'Trust graph recomputation started.'}
        </div>
      </div>
    </AdminLayout>
  )
}
