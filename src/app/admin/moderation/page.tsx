/**
 * Admin moderation page.
 * URL: /admin/moderation
 * Reports queue, first-post queue, action log, reported users, thresholds.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { WarningCircle, ShieldCheck, Clock, Prohibit } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
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

const RESOLUTION_ACTIONS: { value: ReportResolution; label: string }[] = [
  { value: 'dismissed', label: 'Dismiss' },
  { value: 'warned', label: 'Warn' },
  { value: 'labeled', label: 'Label' },
  { value: 'removed', label: 'Remove' },
  { value: 'banned', label: 'Ban' },
]

const ACTION_TYPE_LABELS: Record<string, string> = {
  lock: 'Locked',
  unlock: 'Unlocked',
  pin: 'Pinned',
  unpin: 'Unpinned',
  delete: 'Deleted',
  ban: 'Banned',
  unban: 'Unbanned',
  warn: 'Warned',
  label: 'Labeled',
  approve: 'Approved',
  reject: 'Rejected',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// --- Report Queue Tab ---
function ReportsTab({
  reports,
  onResolve,
}: {
  reports: ModerationReport[]
  onResolve: (id: string, resolution: ReportResolution) => void
}) {
  // Sort: potentially illegal first, then by date (newest first)
  const sorted = [...reports].sort((a, b) => {
    if (a.potentiallyIllegal !== b.potentiallyIllegal) {
      return a.potentiallyIllegal ? -1 : 1
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-3">
      {sorted.map((report) => (
        <article
          key={report.id}
          className={cn(
            'rounded-lg border border-border bg-card p-4',
            report.potentiallyIllegal && 'border-l-4 border-l-destructive'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {report.potentiallyIllegal && (
                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  <WarningCircle size={12} aria-hidden="true" />
                  Potentially illegal
                </span>
              )}
              <p className="text-sm font-medium text-foreground">
                <span className="capitalize">{report.reasonType}</span>
                {' -- reported by '}
                <span className="text-muted-foreground">{report.reporterHandle}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{report.targetContent}</p>
              {report.reason && (
                <p className="mt-1 text-xs text-muted-foreground italic">
                  &ldquo;{report.reason}&rdquo;
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Target: {report.targetAuthorHandle} &middot; {formatDate(report.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              {RESOLUTION_ACTIONS.map((action) => (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => onResolve(report.id, action.value)}
                  className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </article>
      ))}
      {sorted.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No pending reports.</p>
      )}
    </div>
  )
}

// --- First Post Queue Tab ---
function FirstPostTab({
  items,
  onResolve,
  onBatchResolve,
}: {
  items: FirstPostQueueItem[]
  onResolve: (id: string, action: 'approved' | 'rejected') => void
  onBatchResolve: (ids: string[], action: 'approved' | 'rejected') => void
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allSelected = items.length > 0 && selectedIds.size === items.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)))
    }
  }

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBatchAction = (action: 'approved' | 'rejected') => {
    const ids = Array.from(selectedIds)
    onBatchResolve(ids, action)
    setSelectedIds(new Set())
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="rounded border-border"
              aria-label="Select all"
            />
            Select all ({items.length})
          </label>
          {selectedIds.size > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleBatchAction('approved')}
                className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700"
              >
                Approve selected ({selectedIds.size})
              </button>
              <button
                type="button"
                onClick={() => handleBatchAction('rejected')}
                className="rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Reject selected ({selectedIds.size})
              </button>
            </div>
          )}
        </div>
      )}
      {items.map((item) => (
        <article key={item.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedIds.has(item.id)}
              onChange={() => toggleItem(item.id)}
              className="mt-1 rounded border-border"
              aria-label={`Select post by ${item.authorHandle}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{item.authorHandle}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} aria-hidden="true" />
                  New account, {item.accountAge} old
                </span>
                {item.crossCommunityCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck size={12} aria-hidden="true" />
                    Active in {item.crossCommunityCount} other communities
                  </span>
                )}
                {item.bannedFromOtherCommunities > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium text-destructive">
                    <Prohibit size={12} aria-hidden="true" />
                    Banned from {item.bannedFromOtherCommunities} other{' '}
                    {item.bannedFromOtherCommunities === 1 ? 'community' : 'communities'}
                  </span>
                )}
              </div>
              {item.title && (
                <p className="mt-2 text-sm font-medium text-foreground">{item.title}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.contentType === 'topic' ? 'Topic' : 'Reply'} &middot;{' '}
                {formatDate(item.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onResolve(item.id, 'approved')}
                className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => onResolve(item.id, 'rejected')}
                className="rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Reject
              </button>
            </div>
          </div>
        </article>
      ))}
      {items.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No posts awaiting approval.</p>
      )}
    </div>
  )
}

// --- Action Log Tab ---
function ActionLogTab({ entries }: { entries: ModerationLogEntry[] }) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">
              <span className="font-medium">{entry.moderatorHandle}</span>{' '}
              <span className="text-muted-foreground">
                {ACTION_TYPE_LABELS[entry.actionType] ?? entry.actionType}
              </span>
              {entry.targetHandle && (
                <span className="text-muted-foreground"> {entry.targetHandle}</span>
              )}
            </p>
            <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
          </div>
          {entry.reason && (
            <p className="mt-1 text-xs text-muted-foreground italic">{entry.reason}</p>
          )}
        </div>
      ))}
      {entries.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No moderation actions recorded.</p>
      )}
    </div>
  )
}

// --- Reported Users Tab ---
function ReportedUsersTab({ users }: { users: ReportedUser[] }) {
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user.did} className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{user.handle}</p>
              <p className="text-xs text-muted-foreground">
                {user.reportCount} reports &middot; Latest: {formatDate(user.latestReportAt)}
              </p>
              {user.bannedFromOtherCommunities > 0 && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-destructive">
                  <Prohibit size={12} aria-hidden="true" />
                  Banned from {user.bannedFromOtherCommunities} other communities
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      {users.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No reported users.</p>
      )}
    </div>
  )
}

// --- Thresholds Tab ---
function ThresholdsTab({
  thresholds,
  onSave,
}: {
  thresholds: ModerationThresholds
  onSave: (updated: Partial<ModerationThresholds>) => void
}) {
  const [values, setValues] = useState(thresholds)

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <label htmlFor="threshold-autoblock" className="block text-sm font-medium text-foreground">
          Auto-block report count
        </label>
        <input
          id="threshold-autoblock"
          type="number"
          min={1}
          value={values.autoBlockReportCount}
          onChange={(e) =>
            setValues({ ...values, autoBlockReportCount: parseInt(e.target.value, 10) || 1 })
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div>
        <label htmlFor="threshold-warn" className="block text-sm font-medium text-foreground">
          Warn threshold
        </label>
        <input
          id="threshold-warn"
          type="number"
          min={1}
          value={values.warnThreshold}
          onChange={(e) =>
            setValues({ ...values, warnThreshold: parseInt(e.target.value, 10) || 1 })
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div>
        <label htmlFor="threshold-fpq" className="block text-sm font-medium text-foreground">
          First-post queue count (0 to disable)
        </label>
        <input
          id="threshold-fpq"
          type="number"
          min={0}
          value={values.firstPostQueueCount}
          onChange={(e) =>
            setValues({ ...values, firstPostQueueCount: parseInt(e.target.value, 10) || 0 })
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div>
        <label htmlFor="threshold-ratelimit" className="block text-sm font-medium text-foreground">
          New account rate limit (writes/min)
        </label>
        <input
          id="threshold-ratelimit"
          type="number"
          min={1}
          value={values.newAccountRateLimit}
          onChange={(e) =>
            setValues({ ...values, newAccountRateLimit: parseInt(e.target.value, 10) || 1 })
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Anti-spam settings</legend>
        <div className="flex items-center gap-2">
          <input
            id="threshold-linkhold"
            type="checkbox"
            checked={values.linkPostingHold}
            onChange={(e) => setValues({ ...values, linkPostingHold: e.target.checked })}
            className="rounded border-border"
          />
          <label htmlFor="threshold-linkhold" className="text-sm text-foreground">
            Hold posts with links from new accounts for review
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="threshold-topicdelay"
            type="checkbox"
            checked={values.topicCreationDelay}
            onChange={(e) => setValues({ ...values, topicCreationDelay: e.target.checked })}
            className="rounded border-border"
          />
          <label htmlFor="threshold-topicdelay" className="text-sm text-foreground">
            Delay topic creation for new accounts
          </label>
        </div>
      </fieldset>
      <div className="flex gap-4">
        <div>
          <label
            htmlFor="threshold-burstcount"
            className="block text-sm font-medium text-foreground"
          >
            Burst detection: posts
          </label>
          <input
            id="threshold-burstcount"
            type="number"
            min={1}
            value={values.burstDetectionPostCount}
            onChange={(e) =>
              setValues({
                ...values,
                burstDetectionPostCount: parseInt(e.target.value, 10) || 1,
              })
            }
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label htmlFor="threshold-burstmin" className="block text-sm font-medium text-foreground">
            in minutes
          </label>
          <input
            id="threshold-burstmin"
            type="number"
            min={1}
            value={values.burstDetectionMinutes}
            onChange={(e) =>
              setValues({
                ...values,
                burstDetectionMinutes: parseInt(e.target.value, 10) || 1,
              })
            }
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSave(values)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Save Thresholds
      </button>
    </div>
  )
}

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
                <ReportsTab
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
                <FirstPostTab
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
              {activeTab === 'action-log' && <ActionLogTab entries={moderationLog} />}
            </div>
            <div
              role="tabpanel"
              id="panel-reported-users"
              aria-labelledby="tab-reported-users"
              hidden={activeTab !== 'reported-users'}
            >
              {activeTab === 'reported-users' && <ReportedUsersTab users={reportedUsers} />}
            </div>
            <div
              role="tabpanel"
              id="panel-thresholds"
              aria-labelledby="tab-thresholds"
              hidden={activeTab !== 'thresholds'}
            >
              {activeTab === 'thresholds' && thresholds && (
                <ThresholdsTab
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
