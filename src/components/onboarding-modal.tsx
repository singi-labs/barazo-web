/**
 * Onboarding modal for community-configured onboarding fields.
 * Shown when a user attempts a write action without completing onboarding.
 * Renders fields dynamically based on field type configuration.
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { OnboardingFieldInput } from '@/components/onboarding-field-input'
import type { OnboardingField } from '@/lib/api/types'

interface OnboardingModalProps {
  open: boolean
  fields: OnboardingField[]
  onSubmit: (responses: Array<{ fieldId: string; response: unknown }>) => Promise<boolean>
  onCancel: () => void
}

export function OnboardingModal({ open, fields, onSubmit, onCancel }: OnboardingModalProps) {
  const [responses, setResponses] = useState<Record<string, unknown>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const setFieldValue = (fieldId: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
  }

  const mandatoryFields = fields.filter((f) => f.isMandatory)
  const allMandatoryFilled = mandatoryFields.every((f) => {
    const val = responses[f.id]
    if (val === undefined || val === null || val === '') return false
    if (f.fieldType === 'tos_acceptance' && val !== true) return false
    return true
  })

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    const responseArray = fields
      .filter((f) => responses[f.id] !== undefined)
      .map((f) => ({ fieldId: f.id, response: responses[f.id] }))

    const success = await onSubmit(responseArray)
    if (!success) {
      setError('Failed to submit onboarding responses')
    }
    setSubmitting(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="mx-4 w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
        <h2 id="onboarding-title" className="text-lg font-semibold text-foreground">
          Complete Community Onboarding
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please complete the following before you can post in this community.
        </p>

        <div className="mt-4 space-y-4">
          {fields.map((field) => (
            <OnboardingFieldInput
              key={field.id}
              field={field}
              value={responses[field.id]}
              onChange={(val) => setFieldValue(field.id, val)}
            />
          ))}
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
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
            onClick={() => void handleSubmit()}
            disabled={submitting || !allMandatoryFilled}
            className={cn(
              'rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {submitting ? 'Submitting...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
