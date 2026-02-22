/**
 * ReportAppealForm - Inline appeal form for a dismissed report.
 * @see specs/prd-web.md Section M7 (Appeals process)
 */

import { cn } from '@/lib/utils'

interface ReportAppealFormProps {
  reportId: number
  appealReason: string
  appealError: string
  appealSubmitting: boolean
  onAppealReasonChange: (reason: string) => void
  onAppealSubmit: (e: React.FormEvent) => void
  onAppealCancel: () => void
}

export function ReportAppealForm({
  reportId,
  appealReason,
  appealError,
  appealSubmitting,
  onAppealReasonChange,
  onAppealSubmit,
  onAppealCancel,
}: ReportAppealFormProps) {
  return (
    <form onSubmit={onAppealSubmit} className="space-y-3" noValidate>
      <div className="space-y-1">
        <label
          htmlFor={`appeal-reason-${reportId}`}
          className="block text-sm font-medium text-foreground"
        >
          Reason for appeal
        </label>
        <textarea
          id={`appeal-reason-${reportId}`}
          value={appealReason}
          onChange={(e) => onAppealReasonChange(e.target.value)}
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
          onClick={onAppealCancel}
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
  )
}
