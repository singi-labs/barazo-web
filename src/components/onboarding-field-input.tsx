/**
 * OnboardingFieldInput - Dynamic field renderer for onboarding modal.
 * Renders the appropriate input based on field type configuration.
 */

import type { OnboardingField } from '@/lib/api/types'
import { AGE_OPTIONS } from '@/lib/constants'
import { FormLabel } from '@/components/ui/form-label'

const INPUT_CLASS =
  'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground'

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
          <FormLabel htmlFor={labelId} required={required} optional={!required}>
            {field.label}
          </FormLabel>
          {field.description && <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>}
          <select
            id={labelId}
            value={value !== undefined ? String(value) : ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            required={required}
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

    case 'tos_acceptance': {
      const tosUrl = typeof field.config?.tosUrl === 'string' ? field.config.tosUrl : null
      return (
        <div className="flex items-start gap-2">
          <input
            id={labelId}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            required={required}
            className="mt-1 h-4 w-4 rounded border-border"
          />
          <div>
            <FormLabel htmlFor={labelId} required={required} optional={!required} block={false}>
              {field.label}
            </FormLabel>
            {field.description && <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>}
            {tosUrl && (
              <a
                href={tosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 block text-xs text-primary hover:underline"
              >
                Read full Terms of Service
              </a>
            )}
          </div>
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
            required={required}
            className="mt-1 h-4 w-4 rounded border-border"
          />
          <div>
            <FormLabel htmlFor={labelId} required={required} optional={!required} block={false}>
              {field.label}
            </FormLabel>
            {field.description && <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>}
          </div>
        </div>
      )

    case 'newsletter_email':
      return (
        <div>
          <FormLabel htmlFor={labelId} required={required} optional={!required}>
            {field.label}
          </FormLabel>
          {field.description && <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>}
          <input
            id={labelId}
            type="email"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder="your@email.com"
            required={required}
            className={INPUT_CLASS}
          />
        </div>
      )

    case 'custom_text':
      return (
        <div>
          <FormLabel htmlFor={labelId} required={required} optional={!required}>
            {field.label}
          </FormLabel>
          {field.description && <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>}
          <textarea
            id={labelId}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            rows={3}
            required={required}
            className={INPUT_CLASS}
          />
        </div>
      )

    case 'custom_select': {
      const options = (field.config?.options ?? []) as string[]
      return (
        <div>
          <FormLabel htmlFor={labelId} required={required} optional={!required}>
            {field.label}
          </FormLabel>
          {field.description && <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>}
          <select
            id={labelId}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            required={required}
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
