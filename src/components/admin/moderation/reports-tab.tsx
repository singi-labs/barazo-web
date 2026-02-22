/**
 * ModerationReportsTab - Report queue with resolution actions.
 * Sorts potentially illegal reports first, then by newest.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { ModerationReport, ReportResolution } from '@/lib/api/types'

const RESOLUTION_ACTIONS: { value: ReportResolution; label: string }[] = [
  { value: 'dismissed', label: 'Dismiss' },
  { value: 'warned', label: 'Warn' },
  { value: 'labeled', label: 'Label' },
  { value: 'removed', label: 'Remove' },
  { value: 'banned', label: 'Ban' },
]

interface ModerationReportsTabProps {
  reports: ModerationReport[]
  onResolve: (id: string, resolution: ReportResolution) => void
}

export function ModerationReportsTab({ reports, onResolve }: ModerationReportsTabProps) {
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
