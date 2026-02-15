/**
 * Reusable error alert component for displaying API errors visibly.
 * Used to replace silent error handling across admin and frontend pages.
 */

'use client'

import { WarningCircle, ArrowClockwise, X } from '@phosphor-icons/react'

interface ErrorAlertProps {
  /** Error message to display */
  message: string
  /** Optional retry callback. Shows a retry button when provided. */
  onRetry?: () => void
  /** Optional dismiss callback. Shows a dismiss button when provided. */
  onDismiss?: () => void
  /** Visual variant: 'page' fills the content area, 'inline' sits alongside content */
  variant?: 'page' | 'inline'
}

export function ErrorAlert({ message, onRetry, onDismiss, variant = 'inline' }: ErrorAlertProps) {
  if (variant === 'page') {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
      >
        <WarningCircle size={32} className="text-destructive" aria-hidden="true" />
        <p className="text-sm text-destructive">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <ArrowClockwise size={14} aria-hidden="true" />
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
    >
      <WarningCircle size={16} className="shrink-0 text-destructive" aria-hidden="true" />
      <p className="flex-1 text-sm text-destructive">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-destructive/60 transition-colors hover:text-destructive"
          aria-label="Dismiss error"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
