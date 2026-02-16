/**
 * ReportDialog - Report content with AT Protocol reason categories.
 * Button + accessible dialog with reason selection, optional details,
 * and success/error acknowledgment after submission.
 * Follows com.atproto.moderation.defs reason types.
 * @see specs/prd-web.md Section M7 (Report button)
 * @see decisions/content-moderation.md
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Flag, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface ReportSubmission {
  subjectUri: string
  reason: string
  details: string
}

interface ReportDialogProps {
  subjectUri: string
  onSubmit: (report: ReportSubmission) => void | Promise<void>
  disabled?: boolean
  className?: string
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'sexual', label: 'Sexual content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'violation', label: 'Rule violation' },
  { value: 'misleading', label: 'Misleading' },
  { value: 'other', label: 'Other' },
] as const

export function ReportDialog({
  subjectUri,
  onSubmit,
  disabled = false,
  className,
}: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    setOpen(false)
    setReason('')
    setDetails('')
    setError('')
    setSubmitting(false)
    setSubmitted(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    },
    [handleClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) {
      setError('Please select a reason')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit({ subjectUri, reason, details })
      setSubmitted(true)
    } catch {
      setError('Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (disabled) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Report content"
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
          'text-muted-foreground hover:bg-accent hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
      >
        <Flag size={14} />
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" onClick={handleClose} />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-dialog-title"
            className="relative z-50 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg"
          >
            {submitted ? (
              <div className="space-y-4 text-center">
                <CheckCircle
                  size={48}
                  className="mx-auto text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
                <h2 id="report-dialog-title" className="text-lg font-semibold text-foreground">
                  Report submitted
                </h2>
                <p className="text-sm text-muted-foreground" role="status">
                  A moderator will review your report.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className={cn(
                    'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors',
                    'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 id="report-dialog-title" className="text-lg font-semibold text-foreground">
                  Report Content
                </h2>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
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
                              setReason(r.value)
                              setError('')
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
                    <label
                      htmlFor="report-details"
                      className="block text-sm font-medium text-foreground"
                    >
                      Additional details
                    </label>
                    <textarea
                      id="report-details"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
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
                      onClick={handleClose}
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
            )}
          </div>
        </div>
      )}
    </>
  )
}
