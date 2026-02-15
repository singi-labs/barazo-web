/**
 * Onboarding modal for community-configured onboarding fields.
 * Shown when a user attempts a write action without completing onboarding.
 * Renders fields dynamically based on field type configuration.
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { OnboardingField } from '@/lib/api/types'

interface OnboardingModalProps {
  open: boolean
  fields: OnboardingField[]
  onSubmit: (responses: Array<{ fieldId: string; response: unknown }>) => Promise<boolean>
  onCancel: () => void
}

/** Valid age bracket options for age_confirmation fields */
const AGE_OPTIONS = [
  { value: 0, label: 'Rather not say' },
  { value: 13, label: '13+' },
  { value: 14, label: '14+' },
  { value: 15, label: '15+' },
  { value: 16, label: '16+' },
  { value: 18, label: '18+' },
] as const

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

/** Render the appropriate input for a field type */
function OnboardingFieldInput({
  field,
  value,
  onChange,
}: {
  field: OnboardingField
  value: unknown
  onChange: (value: unknown) => void
}) {
  const labelId = `onboarding-${field.id}`
  const required = field.isMandatory

  switch (field.fieldType) {
    case 'age_confirmation':
      return (
        <div>
          <label htmlFor={labelId} className="block text-sm font-medium text-foreground">
            {field.label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
          {field.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
          )}
          <select
            id={labelId}
            value={value !== undefined ? String(value) : ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Select age bracket...</option>
            {AGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )

    case 'tos_acceptance':
      return (
        <div className="flex items-start gap-2">
          <input
            id={labelId}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border"
          />
          <div>
            <label htmlFor={labelId} className="text-sm font-medium text-foreground">
              {field.label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </label>
            {field.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        </div>
      )

    case 'newsletter_email':
      return (
        <div>
          <label htmlFor={labelId} className="block text-sm font-medium text-foreground">
            {field.label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
          {field.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
          )}
          <input
            id={labelId}
            type="email"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder="your@email.com"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
      )

    case 'custom_text':
      return (
        <div>
          <label htmlFor={labelId} className="block text-sm font-medium text-foreground">
            {field.label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
          {field.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
          )}
          <textarea
            id={labelId}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            rows={3}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
      )

    case 'custom_select': {
      const options = (field.config?.options ?? []) as string[]
      return (
        <div>
          <label htmlFor={labelId} className="block text-sm font-medium text-foreground">
            {field.label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
          {field.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
          )}
          <select
            id={labelId}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )
    }

    case 'custom_checkbox':
      return (
        <div className="flex items-start gap-2">
          <input
            id={labelId}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border"
          />
          <div>
            <label htmlFor={labelId} className="text-sm font-medium text-foreground">
              {field.label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </label>
            {field.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        </div>
      )

    default:
      return null
  }
}
