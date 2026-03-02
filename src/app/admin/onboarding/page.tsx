/**
 * Admin onboarding fields configuration page.
 * URL: /admin/onboarding
 * CRUD for community onboarding fields that users must complete before posting.
 */

'use client'

import { Plus } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { OnboardingFieldForm } from '@/components/admin/onboarding/onboarding-field-form'
import { OnboardingFieldItem } from '@/components/admin/onboarding/onboarding-field-item'
import { useOnboardingFields } from '@/hooks/admin/use-onboarding-fields'

export default function AdminOnboardingPage() {
  const {
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
  } = useOnboardingFields()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Onboarding fields</h1>
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
            Add field
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
