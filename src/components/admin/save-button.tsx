/**
 * SaveButton - Button with state-driven text/icon for save operations.
 * Cycles through idle, saving (disabled), and saved (with CheckCircle icon).
 */

import { CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { SaveStatus } from '@/hooks/use-save-state'

interface SaveButtonProps {
  status: SaveStatus
  onClick: () => void
  label?: string
  savingLabel?: string
  savedLabel?: string
  className?: string
}

export function SaveButton({
  status,
  onClick,
  label = 'Save',
  savingLabel = 'Saving...',
  savedLabel = 'Saved',
  className,
}: SaveButtonProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={status === 'saving'}
        className={cn(
          'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50',
          className
        )}
      >
        {status === 'idle' && label}
        {status === 'saving' && savingLabel}
        {status === 'saved' && (
          <span className="flex items-center gap-1.5">
            <CheckCircle size={16} aria-hidden="true" />
            {savedLabel}
          </span>
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === 'saved' ? `${savedLabel}.` : ''}
      </span>
    </>
  )
}
