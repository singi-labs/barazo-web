/**
 * ReportDialog - Report content with AT Protocol reason categories.
 * Button + accessible dialog with reason selection, optional details,
 * and success/error acknowledgment after submission.
 * @see specs/prd-web.md Section M7 (Report button)
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Flag, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ReportFormContent } from '@/components/report-form-content'

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
      if (e.key === 'Escape') handleClose()
    },
    [handleClose]
  )

  useEffect(() => {
    if (open) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
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
              <ReportFormContent
                reason={reason}
                details={details}
                error={error}
                submitting={submitting}
                onReasonChange={setReason}
                onDetailsChange={setDetails}
                onErrorClear={() => setError('')}
                onSubmit={handleSubmit}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
