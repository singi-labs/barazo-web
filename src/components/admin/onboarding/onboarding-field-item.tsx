/**
 * OnboardingFieldItem - Single onboarding field row with reorder/edit/delete controls.
 * @see specs/prd-web.md Section M11
 */

import { PencilSimple, TrashSimple, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { OnboardingField, OnboardingFieldType } from '@/lib/api/types'

const FIELD_TYPE_LABELS: Record<OnboardingFieldType, string> = {
  age_confirmation: 'Age Confirmation',
  tos_acceptance: 'ToS Acceptance',
  newsletter_email: 'Newsletter Email',
  custom_text: 'Text Input',
  custom_select: 'Dropdown Select',
  custom_checkbox: 'Checkbox',
}

interface OnboardingFieldItemProps {
  field: OnboardingField
  index: number
  totalCount: number
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onEdit: (field: OnboardingField) => void
  onDelete: (id: string) => void
}

export function OnboardingFieldItem({
  field,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: OnboardingFieldItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card p-3">
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
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          aria-label={`Move ${field.label} up`}
        >
          <ArrowUp size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={index === totalCount - 1}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          aria-label={`Move ${field.label} down`}
        >
          <ArrowDown size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(field)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Edit ${field.label}`}
        >
          <PencilSimple size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(field.id)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${field.label}`}
        >
          <TrashSimple size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
