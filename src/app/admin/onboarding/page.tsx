/**
 * Admin onboarding fields configuration page.
 * URL: /admin/onboarding
 * CRUD for community onboarding fields that users must complete before posting.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, PencilSimple, TrashSimple, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import {
  getOnboardingFields,
  createOnboardingField,
  updateOnboardingField,
  deleteOnboardingField,
  reorderOnboardingFields,
} from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type {
  OnboardingField,
  OnboardingFieldType,
  CreateOnboardingFieldInput,
} from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

const FIELD_TYPE_LABELS: Record<OnboardingFieldType, string> = {
  age_confirmation: 'Age Confirmation',
  tos_acceptance: 'ToS Acceptance',
  newsletter_email: 'Newsletter Email',
  custom_text: 'Text Input',
  custom_select: 'Dropdown Select',
  custom_checkbox: 'Checkbox',
}

interface EditingField {
  id: string | null
  fieldType: OnboardingFieldType
  label: string
  description: string
  isMandatory: boolean
  config: Record<string, unknown> | null
}

const EMPTY_FIELD: EditingField = {
  id: null,
  fieldType: 'custom_text',
  label: '',
  description: '',
  isMandatory: true,
  config: null,
}

export default function AdminOnboardingPage() {
  const { getAccessToken } = useAuth()
  const [fields, setFields] = useState<OnboardingField[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EditingField | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFields = useCallback(async () => {
    try {
      const response = await getOnboardingFields(getAccessToken() ?? '')
      setFields(response.fields)
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchFields()
  }, [fetchFields])

  const handleAdd = () => {
    setEditing({ ...EMPTY_FIELD })
    setError(null)
  }

  const handleEdit = (field: OnboardingField) => {
    setEditing({
      id: field.id,
      fieldType: field.fieldType,
      label: field.label,
      description: field.description ?? '',
      isMandatory: field.isMandatory,
      config: field.config,
    })
    setError(null)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteOnboardingField(id, getAccessToken() ?? '')
      void fetchFields()
    } catch {
      // Silently handle
    }
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.label.trim()) {
      setError('Label is required')
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (editing.id) {
        await updateOnboardingField(
          editing.id,
          {
            label: editing.label,
            description: editing.description || null,
            isMandatory: editing.isMandatory,
            config: editing.config,
          },
          getAccessToken() ?? ''
        )
      } else {
        const input: CreateOnboardingFieldInput = {
          fieldType: editing.fieldType,
          label: editing.label,
          description: editing.description || undefined,
          isMandatory: editing.isMandatory,
          sortOrder: fields.length,
          config: editing.config ?? undefined,
        }
        await createOnboardingField(input, getAccessToken() ?? '')
      }
      setEditing(null)
      void fetchFields()
    } catch {
      setError('Failed to save field')
    } finally {
      setSaving(false)
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const newFields = [...fields]
    const temp = newFields[index - 1]!
    newFields[index - 1] = newFields[index]!
    newFields[index] = temp
    setFields(newFields)
    await reorderOnboardingFields(
      newFields.map((f, i) => ({ id: f.id, sortOrder: i })),
      getAccessToken() ?? ''
    )
  }

  const handleMoveDown = async (index: number) => {
    if (index >= fields.length - 1) return
    const newFields = [...fields]
    const temp = newFields[index + 1]!
    newFields[index + 1] = newFields[index]!
    newFields[index] = temp
    setFields(newFields)
    await reorderOnboardingFields(
      newFields.map((f, i) => ({ id: f.id, sortOrder: i })),
      getAccessToken() ?? ''
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Onboarding Fields</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure fields that users must complete before they can post in this community.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} aria-hidden="true" />
            Add Field
          </button>
        </div>

        {/* Edit/Create form */}
        {editing && (
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
                      setEditing({ ...editing, fieldType: e.target.value as OnboardingFieldType })
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
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="e.g., Accept our community rules"
                />
              </div>
              <div>
                <label
                  htmlFor="field-description"
                  className="block text-sm font-medium text-foreground"
                >
                  Description (optional)
                </label>
                <textarea
                  id="field-description"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
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
                  onChange={(e) => setEditing({ ...editing, isMandatory: e.target.checked })}
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
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Field list */}
        {loading && <p className="text-sm text-muted-foreground">Loading onboarding fields...</p>}

        {!loading && fields.length === 0 && !editing && (
          <p className="py-8 text-center text-muted-foreground">
            No onboarding fields configured. Users can post immediately without any onboarding
            steps.
          </p>
        )}

        {!loading && fields.length > 0 && (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center justify-between rounded-md border border-border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{field.label}</p>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      )}
                    >
                      {FIELD_TYPE_LABELS[field.fieldType]}
                    </span>
                    {field.isMandatory && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Required
                      </span>
                    )}
                  </div>
                  {field.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void handleMoveUp(index)}
                    disabled={index === 0}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                    aria-label={`Move ${field.label} up`}
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleMoveDown(index)}
                    disabled={index === fields.length - 1}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                    aria-label={`Move ${field.label} down`}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(field)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Edit ${field.label}`}
                  >
                    <PencilSimple size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(field.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Delete ${field.label}`}
                  >
                    <TrashSimple size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
