/**
 * Admin moderation page.
 * URL: /admin/moderation
 * Reports queue, first-post queue, action log, reported users, thresholds.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { ModerationReportsTab } from '@/components/admin/moderation/reports-tab'
import { ModerationFirstPostTab } from '@/components/admin/moderation/first-post-tab'
import { ModerationActionLogTab } from '@/components/admin/moderation/action-log-tab'
import { ModerationReportedUsersTab } from '@/components/admin/moderation/reported-users-tab'
import { ModerationThresholdsTab } from '@/components/admin/moderation/thresholds-tab'
import { cn } from '@/lib/utils'
import { useModerationData, MODERATION_TABS } from '@/hooks/admin/use-moderation-data'

export default function AdminModerationPage() {
  const {
    activeTab,
    setActiveTab,
    reports,
    firstPostQueue,
    moderationLog,
    reportedUsers,
    thresholds,
    loading,
    loadError,
    actionError,
    setActionError,
    fetchData,
    handleResolveReport,
    handleResolveFirstPost,
    handleBatchResolveFirstPost,
    handleSaveThresholds,
  } = useModerationData()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Moderation</h1>

        {/* Tab navigation */}
        <div
          role="tablist"
          aria-label="Moderation sections"
          className="flex gap-1 border-b border-border"
        >
          {MODERATION_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-b-2 border-primary font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchData()} />
        )}

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

        {/* Tab panels */}
        {!loading && (
          <>
            <div
              role="tabpanel"
              id="panel-reports"
              aria-labelledby="tab-reports"
              hidden={activeTab !== 'reports'}
            >
              {activeTab === 'reports' && (
                <ModerationReportsTab
                  reports={reports}
                  onResolve={(id, res) => void handleResolveReport(id, res)}
                />
              )}
            </div>
            <div
              role="tabpanel"
              id="panel-first-post"
              aria-labelledby="tab-first-post"
              hidden={activeTab !== 'first-post'}
            >
              {activeTab === 'first-post' && (
                <ModerationFirstPostTab
                  items={firstPostQueue}
                  onResolve={(id, action) => void handleResolveFirstPost(id, action)}
                  onBatchResolve={(ids, action) => void handleBatchResolveFirstPost(ids, action)}
                />
              )}
            </div>
            <div
              role="tabpanel"
              id="panel-action-log"
              aria-labelledby="tab-action-log"
              hidden={activeTab !== 'action-log'}
            >
              {activeTab === 'action-log' && <ModerationActionLogTab entries={moderationLog} />}
            </div>
            <div
              role="tabpanel"
              id="panel-reported-users"
              aria-labelledby="tab-reported-users"
              hidden={activeTab !== 'reported-users'}
            >
              {activeTab === 'reported-users' && (
                <ModerationReportedUsersTab users={reportedUsers} />
              )}
            </div>
            <div
              role="tabpanel"
              id="panel-thresholds"
              aria-labelledby="tab-thresholds"
              hidden={activeTab !== 'thresholds'}
            >
              {activeTab === 'thresholds' && thresholds && (
                <ModerationThresholdsTab
                  thresholds={thresholds}
                  onSave={(updated) => void handleSaveThresholds(updated)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
