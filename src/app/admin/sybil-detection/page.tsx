/**
 * Admin sybil detection page.
 * URL: /admin/sybil-detection
 * Trust graph status, cluster list, cluster detail, behavioral flags.
 * @see specs/prd-web.md Section P2.10
 */

'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TrustGraphStatusCard } from '@/components/admin/sybil/trust-graph-status-card'
import { SybilClusterListView } from '@/components/admin/sybil/cluster-list-view'
import { SybilClusterDetailView } from '@/components/admin/sybil/cluster-detail-view'
import { BehavioralFlagsSection } from '@/components/admin/sybil/behavioral-flags-section'
import { useSybilData } from '@/hooks/admin/use-sybil-data'

export default function AdminSybilDetectionPage() {
  const {
    clusters,
    graphStatus,
    flags,
    selectedDetail,
    setSelectedDetail,
    statusFilter,
    setStatusFilter,
    loading,
    loadError,
    actionError,
    setActionError,
    recomputing,
    confirmAction,
    setConfirmAction,
    fetchData,
    handleViewDetail,
    handleClusterAction,
    handleRecompute,
    handleDismissFlag,
  } = useSybilData()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sybil detection</h1>
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
                  clusters={clusters}
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
