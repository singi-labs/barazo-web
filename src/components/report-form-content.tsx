/**
 * ReportFormContent - Report form with reason radio buttons and details textarea.
 * @see specs/prd-web.md Section M7 (Report button)
 */

import { cn } from '@/lib/utils'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'sexual', label: 'Sexual content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'violation', label: 'Rule violation' },
  { value: 'misleading', label: 'Misleading' },
  { value: 'other', label: 'Other' },
] as const

interface ReportFormContentProps {
  reason: string
  details: string
  error: string
  submitting: boolean
  onReasonChange: (reason: string) => void
  onDetailsChange: (details: string) => void
  onErrorClear: () => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function ReportFormContent({
  reason,
  details,
  error,
  submitting,
  onReasonChange,
  onDetailsChange,
  onErrorClear,
  onSubmit,
  onClose,
}: ReportFormContentProps) {
  return (
    <>
      <h2 id="report-dialog-title" className="text-lg font-semibold text-foreground">
        Report Content
      </h2>

      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        <fieldset disabled={submitting}>
          <legend className="text-sm font-medium text-foreground">Reason</legend>
          <div className="mt-2 space-y-2">
            {REPORT_REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="report-reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => {
                    onReasonChange(r.value)
                    onErrorClear()
                  }}
                  className="h-4 w-4 border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="text-sm text-foreground">{r.label}</span>
              </label>
            ))}
          </div>
          {error && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </fieldset>

        <div className="space-y-1">
          <label htmlFor="report-details" className="block text-sm font-medium text-foreground">
            Additional details
          </label>
          <textarea
            id="report-details"
            value={details}
            onChange={(e) => onDetailsChange(e.target.value)}
            placeholder="Optional: provide more context"
            rows={3}
            disabled={submitting}
            className={cn(
              'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className={cn(
              'rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors',
              'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors',
              'hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </>
  )
}
