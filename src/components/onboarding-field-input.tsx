/**
 * OnboardingFieldInput - Dynamic field renderer for onboarding modal.
 * Renders the appropriate input based on field type configuration.
 */

import type { OnboardingField } from '@/lib/api/types'
import { AGE_OPTIONS } from '@/lib/constants'

const INPUT_CLASS =
  'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground'

function FieldLabel({
  htmlFor,
  label,
  required,
  description,
  block = true,
}: {
  htmlFor: string
  label: string
  required: boolean
  description?: string | null
  block?: boolean
}) {
  return (
    <>
      <label
        htmlFor={htmlFor}
        className={`${block ? 'block ' : ''}text-sm font-medium text-foreground`}
      >
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </>
  )
}

interface OnboardingFieldInputProps {
  field: OnboardingField
  value: unknown
  onChange: (value: unknown) => void
}

export function OnboardingFieldInput({ field, value, onChange }: OnboardingFieldInputProps) {
  const labelId = `onboarding-${field.id}`
  const required = field.isMandatory

  switch (field.fieldType) {
    case 'age_confirmation':
      return (
        <div>
          <FieldLabel
            htmlFor={labelId}
            label={field.label}
            required={required}
            description={field.description}
          />
          <select
            id={labelId}
            value={value !== undefined ? String(value) : ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            className={INPUT_CLASS}
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
            <FieldLabel
              htmlFor={labelId}
              label={field.label}
              required={required}
              description={field.description}
              block={false}
            />
          </div>
        </div>
      )

    case 'newsletter_email':
      return (
        <div>
          <FieldLabel
            htmlFor={labelId}
            label={field.label}
            required={required}
            description={field.description}
          />
          <input
            id={labelId}
            type="email"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder="your@email.com"
            className={INPUT_CLASS}
          />
        </div>
      )

    case 'custom_text':
      return (
        <div>
          <FieldLabel
            htmlFor={labelId}
            label={field.label}
            required={required}
            description={field.description}
          />
          <textarea
            id={labelId}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            rows={3}
            className={INPUT_CLASS}
          />
        </div>
      )

    case 'custom_select': {
      const options = (field.config?.options ?? []) as string[]
      return (
        <div>
          <FieldLabel
            htmlFor={labelId}
            label={field.label}
            required={required}
            description={field.description}
          />
          <select
            id={labelId}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={INPUT_CLASS}
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

    default:
      return null
  }
}
