/**
 * OnboardingFieldForm - Edit/create form for an onboarding field.
 * @see specs/prd-web.md Section M11
 */

import type { OnboardingFieldType } from '@/lib/api/types'

const FIELD_TYPE_LABELS: Record<OnboardingFieldType, string> = {
  age_confirmation: 'Age Confirmation',
  tos_acceptance: 'ToS Acceptance',
  newsletter_email: 'Newsletter Email',
  custom_text: 'Text Input',
  custom_select: 'Dropdown Select',
  custom_checkbox: 'Checkbox',
}

export interface EditingField {
  id: string | null
  fieldType: OnboardingFieldType
  label: string
  description: string
  isMandatory: boolean
  config: Record<string, unknown> | null
}

export const EMPTY_FIELD: EditingField = {
  id: null,
  fieldType: 'custom_text',
  label: '',
  description: '',
  isMandatory: true,
  config: null,
}

interface OnboardingFieldFormProps {
  editing: EditingField
  saving: boolean
  error: string | null
  onChange: (field: EditingField) => void
  onSave: () => void
  onCancel: () => void
}

export function OnboardingFieldForm({
  editing,
  saving,
  error,
  onChange,
  onSave,
  onCancel,
}: OnboardingFieldFormProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        {editing.id ? 'Edit Field' : 'New Onboarding Field'}
      </h2>
      <div className="space-y-4">
        {!editing.id && (
          <div>
            <label htmlFor="field-type" className="block text-sm font-medium text-foreground">
              Field Type
            </label>
            <select
              id="field-type"
              value={editing.fieldType}
              onChange={(e) =>
                onChange({ ...editing, fieldType: e.target.value as OnboardingFieldType })
              }
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="field-label" className="block text-sm font-medium text-foreground">
            Label
          </label>
          <input
            id="field-label"
            type="text"
            value={editing.label}
            onChange={(e) => onChange({ ...editing, label: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            placeholder="e.g., Accept our community rules"
          />
        </div>
        <div>
          <label htmlFor="field-description" className="block text-sm font-medium text-foreground">
            Description (optional)
          </label>
          <textarea
            id="field-description"
            value={editing.description}
            onChange={(e) => onChange({ ...editing, description: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            placeholder="Additional context or instructions for users"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="field-mandatory"
            type="checkbox"
            checked={editing.isMandatory}
            onChange={(e) => onChange({ ...editing, isMandatory: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor="field-mandatory" className="text-sm text-foreground">
            Required (users must complete this field before posting)
          </label>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
