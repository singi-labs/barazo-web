/**
 * Admin onboarding fields configuration page.
 * URL: /admin/onboarding
 * CRUD for community onboarding fields that users must complete before posting.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import {
  OnboardingFieldForm,
  EMPTY_FIELD,
} from '@/components/admin/onboarding/onboarding-field-form'
import { OnboardingFieldItem } from '@/components/admin/onboarding/onboarding-field-item'
import {
  getOnboardingFields,
  createOnboardingField,
  updateOnboardingField,
  deleteOnboardingField,
  reorderOnboardingFields,
} from '@/lib/api/client'
import type { OnboardingField, CreateOnboardingFieldInput } from '@/lib/api/types'
import type { EditingField } from '@/components/admin/onboarding/onboarding-field-form'
import { useAuth } from '@/hooks/use-auth'

export default function AdminOnboardingPage() {
  const { getAccessToken } = useAuth()
  const [fields, setFields] = useState<OnboardingField[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EditingField | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchFields = useCallback(async () => {
    setLoadError(null)
    try {
      const response = await getOnboardingFields(getAccessToken() ?? '')
      setFields(response.fields)
    } catch {
      setLoadError('Failed to load onboarding fields. The API may be unreachable.')
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
    setActionError(null)
    try {
      await deleteOnboardingField(id, getAccessToken() ?? '')
      void fetchFields()
    } catch {
      setActionError('Failed to delete field. Please try again.')
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

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

        {editing && (
          <OnboardingFieldForm
            editing={editing}
            saving={saving}
            error={error}
            onChange={setEditing}
            onSave={() => void handleSave()}
            onCancel={() => setEditing(null)}
          />
        )}

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchFields()} />
        )}

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
              <OnboardingFieldItem
                key={field.id}
                field={field}
                index={index}
                totalCount={fields.length}
                onMoveUp={(i) => void handleMoveUp(i)}
                onMoveDown={(i) => void handleMoveDown(i)}
                onEdit={handleEdit}
                onDelete={(id) => void handleDelete(id)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
