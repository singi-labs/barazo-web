/**
 * My Reports page - lists user's submitted reports with appeal functionality.
 * URL: /settings/reports
 * Shows report status, resolution, and allows appeals for dismissed reports.
 * Client component (form state, API calls).
 * @see specs/prd-web.md Section M7 (Appeals process)
 * @see decisions/content-moderation.md
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ErrorAlert } from '@/components/error-alert'
import { ReportCard } from '@/components/settings/report-card'
import { getMyReports, submitAppeal, getPublicSettings } from '@/lib/api/client'
import type { MyReport } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

export default function MyReportsPage() {
  const { getAccessToken } = useAuth()
  const [reports, setReports] = useState<MyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [communityName, setCommunityName] = useState('')

  useEffect(() => {
    getPublicSettings()
      .then((settings) => setCommunityName(settings.communityName))
      .catch(() => {})
  }, [])
  const [appealingId, setAppealingId] = useState<number | null>(null)
  const [appealReason, setAppealReason] = useState('')
  const [appealError, setAppealError] = useState('')
  const [appealSubmitting, setAppealSubmitting] = useState(false)
  const [appealSuccess, setAppealSuccess] = useState<number | null>(null)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }

    getMyReports(token)
      .then((response) => {
        setReports(response.reports)
      })
      .catch(() => setError('Failed to load reports'))
      .finally(() => setLoading(false))
  }, [getAccessToken])

  const handleAppealOpen = useCallback((reportId: number) => {
    setAppealingId(reportId)
    setAppealReason('')
    setAppealError('')
    setAppealSuccess(null)
  }, [])

  const handleAppealCancel = useCallback(() => {
    setAppealingId(null)
    setAppealReason('')
    setAppealError('')
  }, [])

  const handleAppealReasonChange = useCallback((reason: string) => {
    setAppealReason(reason)
    setAppealError('')
  }, [])

  const handleAppealSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!appealReason.trim()) {
        setAppealError('Please provide a reason for your appeal.')
        return
      }
      if (appealingId === null) return

      const token = getAccessToken()
      if (!token) {
        setAppealError('Not authenticated')
        return
      }

      setAppealSubmitting(true)
      setAppealError('')

      try {
        const updated = await submitAppeal(appealingId, appealReason.trim(), token)
        setReports((prev) => prev.map((r) => (r.id === appealingId ? updated : r)))
        setAppealSuccess(appealingId)
        setAppealingId(null)
        setAppealReason('')
      } catch {
        setAppealError('Failed to submit appeal. Please try again.')
      } finally {
        setAppealSubmitting(false)
      }
    },
    [appealingId, appealReason, getAccessToken]
  )

  return (
    <ForumLayout communityName={communityName}>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Account Settings', href: '/settings' },
            { label: 'My Reports' },
          ]}
        />

        <h1 className="text-2xl font-bold text-foreground">My Reports</h1>

        {loading ? (
          <div className="max-w-2xl animate-pulse space-y-4">
            <div className="h-24 rounded-lg bg-muted" />
            <div className="h-24 rounded-lg bg-muted" />
          </div>
        ) : error ? (
          <ErrorAlert message={error} variant="page" />
        ) : reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have no reports. Reports you submit will appear here.
          </p>
        ) : (
          <div className="max-w-2xl space-y-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                appealingId={appealingId}
                appealReason={appealReason}
                appealError={appealError}
                appealSubmitting={appealSubmitting}
                appealSuccess={appealSuccess}
                onAppealOpen={handleAppealOpen}
                onAppealCancel={handleAppealCancel}
                onAppealReasonChange={handleAppealReasonChange}
                onAppealSubmit={handleAppealSubmit}
              />
            ))}
          </div>
        )}
      </div>
    </ForumLayout>
  )
}
