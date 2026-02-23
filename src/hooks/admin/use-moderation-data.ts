/**
 * Hook for managing moderation page state and API interactions.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
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
import type {
  ModerationReport,
  FirstPostQueueItem,
  ModerationLogEntry,
  ReportedUser,
  ModerationThresholds,
  ReportResolution,
} from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

export type ModerationTabId =
  | 'reports'
  | 'first-post'
  | 'action-log'
  | 'reported-users'
  | 'thresholds'

export const MODERATION_TABS: { id: ModerationTabId; label: string }[] = [
  { id: 'reports', label: 'Reports' },
  { id: 'first-post', label: 'First Post Queue' },
  { id: 'action-log', label: 'Action Log' },
  { id: 'reported-users', label: 'Reported Users' },
  { id: 'thresholds', label: 'Thresholds' },
]

export function useModerationData() {
  const { getAccessToken } = useAuth()
  const [activeTab, setActiveTab] = useState<ModerationTabId>('reports')
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

  return {
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
  }
}
