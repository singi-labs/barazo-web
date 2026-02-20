/**
 * ModerationControls - Lock, pin, delete actions for moderators/admins.
 * Only renders when user has moderator privileges.
 * Uses ConfirmDialog for destructive actions.
 * @see specs/prd-web.md Section M7 (Moderation controls)
 */

'use client'

import { useState } from 'react'
import { Lock, LockOpen, PushPin, Trash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from './confirm-dialog'

export type ModerationAction = 'lock' | 'unlock' | 'pin' | 'unpin' | 'delete'

interface ModerationControlsProps {
  isModerator: boolean
  isLocked?: boolean
  isPinned?: boolean
  onAction: (action: ModerationAction) => void
  className?: string
}

const ACTION_CONFIRMATIONS: Record<ModerationAction, { title: string; description: string }> = {
  delete: {
    title: 'Delete Topic',
    description:
      'This will permanently delete this topic and all its replies. This action cannot be undone.',
  },
  lock: {
    title: 'Lock Topic',
    description: 'Locking this topic will prevent new replies from being posted.',
  },
  unlock: {
    title: 'Unlock Topic',
    description: 'Unlocking this topic will allow new replies again.',
  },
  pin: {
    title: 'Pin Topic',
    description: 'This topic will be pinned to the top of the category.',
  },
  unpin: {
    title: 'Unpin Topic',
    description: 'This topic will no longer be pinned to the top.',
  },
}

export function ModerationControls({
  isModerator,
  isLocked = false,
  isPinned = false,
  onAction,
  className,
}: ModerationControlsProps) {
  const [pendingAction, setPendingAction] = useState<ModerationAction | null>(null)

  if (!isModerator) return null

  const handleAction = (action: ModerationAction) => {
    setPendingAction(action)
  }

  const handleConfirm = () => {
    if (pendingAction) {
      onAction(pendingAction)
      setPendingAction(null)
    }
  }

  const handleCancel = () => {
    setPendingAction(null)
  }

  const lockAction = isLocked ? 'unlock' : 'lock'
  const pinAction = isPinned ? 'unpin' : 'pin'

  return (
    <>
      <div role="group" aria-label="Moderation actions" className={cn('flex gap-1', className)}>
        <button
          type="button"
          onClick={() => handleAction(lockAction)}
          aria-label={isLocked ? 'Unlock topic' : 'Lock topic'}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
            'text-muted-foreground hover:bg-accent hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          {isLocked ? <LockOpen size={14} /> : <Lock size={14} />}
          {isLocked ? 'Unlock' : 'Lock'}
        </button>

        <button
          type="button"
          onClick={() => handleAction(pinAction)}
          aria-label={isPinned ? 'Unpin topic' : 'Pin topic'}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
            'text-muted-foreground hover:bg-accent hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <PushPin size={14} />
          {isPinned ? 'Unpin' : 'Pin'}
        </button>

        <button
          type="button"
          onClick={() => handleAction('delete')}
          aria-label="Delete topic"
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
            'text-destructive hover:bg-destructive/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <Trash size={14} />
          Delete
        </button>
      </div>

      {pendingAction && (
        <ConfirmDialog
          open={true}
          title={ACTION_CONFIRMATIONS[pendingAction].title}
          description={ACTION_CONFIRMATIONS[pendingAction].description}
          confirmLabel="Confirm"
          variant={pendingAction === 'delete' ? 'destructive' : 'default'}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
