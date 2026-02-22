/**
 * Admin sybil detection page.
 * URL: /admin/sybil-detection
 * Trust graph status, cluster list, cluster detail, behavioral flags.
 * @see specs/prd-web.md Section P2.10
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TrustGraphStatusCard } from '@/components/admin/sybil/trust-graph-status-card'
import { SybilClusterListView } from '@/components/admin/sybil/cluster-list-view'
import { SybilClusterDetailView } from '@/components/admin/sybil/cluster-detail-view'
import { BehavioralFlagsSection } from '@/components/admin/sybil/behavioral-flags-section'
import {
  getSybilClusters,
  getSybilClusterDetail,
  updateSybilClusterStatus,
  getTrustGraphStatus,
  recomputeTrustGraph,
  getBehavioralFlags,
  updateBehavioralFlag,
} from '@/lib/api/client'
import type {
  SybilCluster,
  SybilClusterDetail,
  SybilClusterStatus,
  TrustGraphStatus,
  BehavioralFlag,
} from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

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
            {graphStatus && (
              <TrustGraphStatusCard
                status={graphStatus}
                onRecompute={() => void handleRecompute()}
                recomputing={recomputing}
              />
            )}

            {selectedDetail ? (
              <SybilClusterDetailView
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
                <SybilClusterListView
                  clusters={filteredClusters}
                  onViewDetail={(id) => void handleViewDetail(id)}
                />
              </div>
            )}

            {!selectedDetail && (
              <BehavioralFlagsSection
                flags={flags}
                onDismiss={(id) => void handleDismissFlag(id)}
              />
            )}
          </>
        )}

        <ConfirmDialog
          open={confirmAction !== null}
          title={confirmAction?.title ?? ''}
          description={confirmAction?.message ?? ''}
          confirmLabel="Confirm"
          variant="destructive"
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
