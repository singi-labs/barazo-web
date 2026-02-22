/**
 * Admin moderation page.
 * URL: /admin/moderation
 * Reports queue, first-post queue, action log, reported users, thresholds.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { ModerationReportsTab } from '@/components/admin/moderation/reports-tab'
import { ModerationFirstPostTab } from '@/components/admin/moderation/first-post-tab'
import { ModerationActionLogTab } from '@/components/admin/moderation/action-log-tab'
import { ModerationReportedUsersTab } from '@/components/admin/moderation/reported-users-tab'
import { ModerationThresholdsTab } from '@/components/admin/moderation/thresholds-tab'
import {
  getModerationReports,
  resolveReport,
  getFirstPostQueue,
  resolveFirstPost,
  getModerationLog,
  getReportedUsers,
  getModerationThresholds,
  updateModerationThresholds,
} from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type {
  ModerationReport,
  FirstPostQueueItem,
  ModerationLogEntry,
  ReportedUser,
  ModerationThresholds,
  ReportResolution,
} from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

type TabId = 'reports' | 'first-post' | 'action-log' | 'reported-users' | 'thresholds'

const TABS: { id: TabId; label: string }[] = [
  { id: 'reports', label: 'Reports' },
  { id: 'first-post', label: 'First Post Queue' },
  { id: 'action-log', label: 'Action Log' },
  { id: 'reported-users', label: 'Reported Users' },
  { id: 'thresholds', label: 'Thresholds' },
]

export default function AdminModerationPage() {
  const { getAccessToken } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('reports')
  const [reports, setReports] = useState<ModerationReport[]>([])
  const [firstPostQueue, setFirstPostQueue] = useState<FirstPostQueueItem[]>([])
  const [moderationLog, setModerationLog] = useState<ModerationLogEntry[]>([])
  const [reportedUsers, setReportedUsers] = useState<ReportedUser[]>([])
  const [thresholds, setThresholds] = useState<ModerationThresholds | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoadError(null)
    try {
      const [reportsRes, queueRes, logRes, usersRes, thresholdsRes] = await Promise.all([
        getModerationReports(getAccessToken() ?? ''),
        getFirstPostQueue(getAccessToken() ?? ''),
        getModerationLog(getAccessToken() ?? ''),
        getReportedUsers(getAccessToken() ?? ''),
        getModerationThresholds(getAccessToken() ?? ''),
      ])
      setReports(reportsRes.reports)
      setFirstPostQueue(queueRes.items)
      setModerationLog(logRes.entries)
      setReportedUsers(usersRes.users)
      setThresholds(thresholdsRes)
    } catch {
      setLoadError('Failed to load moderation data. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleResolveReport = async (id: string, resolution: ReportResolution) => {
    setActionError(null)
    try {
      await resolveReport(id, resolution, getAccessToken() ?? '')
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch {
      setActionError('Failed to resolve report. Please try again.')
    }
  }

  const handleResolveFirstPost = async (id: string, action: 'approved' | 'rejected') => {
    setActionError(null)
    try {
      await resolveFirstPost(id, action, getAccessToken() ?? '')
      setFirstPostQueue((prev) => prev.filter((item) => item.id !== id))
    } catch {
      setActionError(
        `Failed to ${action === 'approved' ? 'approve' : 'reject'} post. Please try again.`
      )
    }
  }

  const handleBatchResolveFirstPost = async (ids: string[], action: 'approved' | 'rejected') => {
    setActionError(null)
    try {
      await Promise.all(ids.map((id) => resolveFirstPost(id, action, getAccessToken() ?? '')))
      setFirstPostQueue((prev) => prev.filter((item) => !ids.includes(item.id)))
    } catch {
      setActionError('Failed to process batch action. Some items may not have been updated.')
    }
  }

  const handleSaveThresholds = async (updated: Partial<ModerationThresholds>) => {
    setActionError(null)
    try {
      const result = await updateModerationThresholds(updated, getAccessToken() ?? '')
      setThresholds(result)
    } catch {
      setActionError('Failed to save thresholds. Please try again.')
    }
  }

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
          {TABS.map((tab) => (
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
