/**
 * Age gate dialog with age bracket dropdown.
 * Shown when user tries to enable Mature content without prior age declaration.
 * Calls POST /api/users/me/age-declaration on confirm with selected age bracket.
 * @see decisions/features-and-ux.md "Content Maturity & User Safety"
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AGE_OPTIONS } from '@/lib/constants'
import { declareAge } from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'

interface AgeGateDialogProps {
  open: boolean
  onConfirm: (declaredAge: number) => void
  onCancel: () => void
}

export function AgeGateDialog({ open, onConfirm, onCancel }: AgeGateDialogProps) {
  const { getAccessToken } = useAuth()
  const [selectedAge, setSelectedAge] = useState<number | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleConfirm = async () => {
    if (selectedAge === null) {
      setError('Please select your age bracket')
      return
    }

    setConfirming(true)
    setError(null)

    const token = getAccessToken()
    if (!token) {
      setError('Not authenticated')
      setConfirming(false)
      return
    }

    try {
      const result = await declareAge(selectedAge, token)
      onConfirm(result.declaredAge)
    } catch {
      setError('Failed to save age declaration')
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
          Age Declaration
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          To access Mature content, please select your age bracket. This determines which content is
          available to you based on this community&apos;s settings.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Mature content may include strong language, graphic descriptions, and sensitive topics
          (politics, drugs, violence). It does not include explicit sexual content.
        </p>

        <div className="mt-4">
          <label htmlFor="age-select" className="block text-sm font-medium text-foreground">
            Your age bracket
          </label>
          <select
            id="age-select"
            value={selectedAge ?? ''}
            onChange={(e) => setSelectedAge(e.target.value === '' ? null : Number(e.target.value))}
            className={cn(
              'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          >
            <option value="">Select age bracket...</option>
            {AGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {selectedAge === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Choosing &quot;Rather not say&quot; means you will only see Safe content.
          </p>
        )}

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
            disabled={confirming || selectedAge === null}
            className={cn(
              'rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {confirming ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
