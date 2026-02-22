/**
 * ReportCard - Single report display with status badge, metadata, and appeal form.
 * @see specs/prd-web.md Section M7 (Appeals process)
 */

import { cn } from '@/lib/utils'
import { formatDateShort } from '@/lib/format'
import { ReportAppealForm } from '@/components/settings/report-appeal-form'
import type { MyReport } from '@/lib/api/types'

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

interface ReportCardProps {
  report: MyReport
  appealingId: number | null
  appealReason: string
  appealError: string
  appealSubmitting: boolean
  appealSuccess: number | null
  onAppealOpen: (reportId: number) => void
  onAppealCancel: () => void
  onAppealReasonChange: (reason: string) => void
  onAppealSubmit: (e: React.FormEvent) => void
}

export function ReportCard({
  report,
  appealingId,
  appealReason,
  appealError,
  appealSubmitting,
  appealSuccess,
  onAppealOpen,
  onAppealCancel,
  onAppealReasonChange,
  onAppealSubmit,
}: ReportCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
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

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Reported: {formatDateShort(report.createdAt)}</span>
        {report.resolvedAt && <span>Resolved: {formatDateShort(report.resolvedAt)}</span>}
      </div>

      {appealSuccess === report.id && (
        <p
          className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400"
          role="status"
        >
          Appeal submitted. A moderator will re-review your report.
        </p>
      )}

      {canAppeal(report) && appealingId !== report.id && appealSuccess !== report.id && (
        <button
          type="button"
          onClick={() => onAppealOpen(report.id)}
          className={cn(
            'rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors',
            'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Appeal
        </button>
      )}

      {appealingId === report.id && (
        <ReportAppealForm
          reportId={report.id}
          appealReason={appealReason}
          appealError={appealError}
          appealSubmitting={appealSubmitting}
          onAppealReasonChange={onAppealReasonChange}
          onAppealSubmit={onAppealSubmit}
          onAppealCancel={onAppealCancel}
        />
      )}
    </div>
  )
}
