/**
 * Hook for managing admin onboarding fields CRUD and reordering.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getOnboardingFields,
  createOnboardingField,
  updateOnboardingField,
  deleteOnboardingField,
  reorderOnboardingFields,
} from '@/lib/api/client'
import type { OnboardingField, CreateOnboardingFieldInput } from '@/lib/api/types'
import { EMPTY_FIELD } from '@/components/admin/onboarding/onboarding-field-form'
import type { EditingField } from '@/components/admin/onboarding/onboarding-field-form'
import { useAuth } from '@/hooks/use-auth'

export function useOnboardingFields() {
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
      const fields = await getOnboardingFields(getAccessToken() ?? '')
      setFields(fields)
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

  return {
    fields,
    loading,
    editing,
    setEditing,
    saving,
    error,
    loadError,
    actionError,
    setActionError,
    fetchFields,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSave,
    handleMoveUp,
    handleMoveDown,
  }
}
