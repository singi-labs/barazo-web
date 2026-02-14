/**
 * Age gate confirmation dialog.
 * Shown when user tries to enable Mature content without prior age declaration.
 * Calls POST /api/users/me/age-declaration on confirm.
 * @see decisions/features-and-ux.md "Content Maturity & User Safety"
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { declareAge } from '@/lib/api/client'

interface AgeGateDialogProps {
  open: boolean
  onConfirm: (ageDeclarationAt: string) => void
  onCancel: () => void
}

export function AgeGateDialog({ open, onConfirm, onCancel }: AgeGateDialogProps) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleConfirm = async () => {
    setConfirming(true)
    setError(null)

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setError('Not authenticated')
      setConfirming(false)
      return
    }

    try {
      const result = await declareAge(token)
      onConfirm(result.ageDeclarationAt)
    } catch {
      setError('Failed to confirm age')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <h2 id="age-gate-title" className="text-lg font-semibold text-foreground">
          Age Confirmation Required
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          To view Mature content, you must confirm that you are at least 16 years old. This is a
          one-time declaration stored with your account.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Mature content may include strong language, graphic descriptions, and sensitive topics
          (politics, drugs, violence). It does not include explicit sexual content.
        </p>

        {error && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'rounded-md border border-border px-4 py-2 text-sm text-foreground',
              'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            className={cn(
              'rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {confirming ? 'Confirming...' : 'I confirm I am 16 or older'}
          </button>
        </div>
      </div>
    </div>
  )
}
