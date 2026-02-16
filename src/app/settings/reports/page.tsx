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
import { cn } from '@/lib/utils'
import { getMyReports, submitAppeal } from '@/lib/api/client'
import type { MyReport } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

function statusLabel(report: MyReport): string {
  if (report.appealStatus === 'pending') return 'Appeal pending'
  if (report.status === 'resolved' && report.resolutionType) {
    return report.resolutionType.charAt(0).toUpperCase() + report.resolutionType.slice(1)
  }
  return 'Pending'
}

function statusColor(report: MyReport): string {
  if (report.appealStatus === 'pending')
    return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
  if (report.status === 'pending') return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
  if (report.resolutionType === 'dismissed') return 'bg-muted text-muted-foreground'
  return 'bg-green-500/10 text-green-700 dark:text-green-400'
}

function canAppeal(report: MyReport): boolean {
  return (
    report.status === 'resolved' &&
    report.resolutionType === 'dismissed' &&
    report.appealStatus === 'none'
  )
}

export default function MyReportsPage() {
  const { getAccessToken } = useAuth()
  const [reports, setReports] = useState<MyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <ForumLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Settings', href: '/settings' },
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
              <div
                key={report.id}
                className="rounded-lg border border-border bg-card p-4 space-y-3"
              >
                {/* Report header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {report.reasonType.charAt(0).toUpperCase() + report.reasonType.slice(1)}
                    </p>
                    {report.description && (
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      statusColor(report)
                    )}
                  >
                    {statusLabel(report)}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Reported: {formatDate(report.createdAt)}</span>
                  {report.resolvedAt && <span>Resolved: {formatDate(report.resolvedAt)}</span>}
                </div>

                {/* Appeal success message */}
                {appealSuccess === report.id && (
                  <p
                    className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400"
                    role="status"
                  >
                    Appeal submitted. A moderator will re-review your report.
                  </p>
                )}

                {/* Appeal button */}
                {canAppeal(report) && appealingId !== report.id && appealSuccess !== report.id && (
                  <button
                    type="button"
                    onClick={() => handleAppealOpen(report.id)}
                    className={cn(
                      'rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors',
                      'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  >
                    Appeal
                  </button>
                )}

                {/* Appeal form */}
                {appealingId === report.id && (
                  <form onSubmit={handleAppealSubmit} className="space-y-3" noValidate>
                    <div className="space-y-1">
                      <label
                        htmlFor={`appeal-reason-${report.id}`}
                        className="block text-sm font-medium text-foreground"
                      >
                        Reason for appeal
                      </label>
                      <textarea
                        id={`appeal-reason-${report.id}`}
                        value={appealReason}
                        onChange={(e) => {
                          setAppealReason(e.target.value)
                          setAppealError('')
                        }}
                        placeholder="Explain why you believe this report should be reconsidered"
                        rows={3}
                        disabled={appealSubmitting}
                        className={cn(
                          'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          'disabled:cursor-not-allowed disabled:opacity-50'
                        )}
                      />
                      {appealError && (
                        <p className="text-sm text-destructive" role="alert">
                          {appealError}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={appealSubmitting}
                        className={cn(
                          'rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors',
                          'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          'disabled:cursor-not-allowed disabled:opacity-50'
                        )}
                      >
                        {appealSubmitting ? 'Submitting...' : 'Submit appeal'}
                      </button>
                      <button
                        type="button"
                        onClick={handleAppealCancel}
                        disabled={appealSubmitting}
                        className={cn(
                          'rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors',
                          'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          'disabled:cursor-not-allowed disabled:opacity-50'
                        )}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ForumLayout>
  )
}
