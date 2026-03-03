/**
 * Block/mute toggle button for user actions.
 * Used in user profiles and post context menus.
 * Shows a login prompt toast for unauthenticated users.
 * On first use, displays a confirmation dialog explaining the action.
 * @see specs/prd-web.md Section M8
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { Prohibit, SpeakerSimpleSlash, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { blockUser, unblockUser, muteUser, unmuteUser } from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'
import { useRequireAuth } from '@/hooks/use-require-auth'

interface BlockMuteButtonProps {
  targetDid: string
  action: 'block' | 'mute'
  isActive: boolean
  onToggle: (newState: boolean) => void
  className?: string
}

const STORAGE_KEYS = {
  block: 'barazo_block_explained',
  mute: 'barazo_mute_explained',
} as const

export function BlockMuteButton({
  targetDid,
  action,
  isActive,
  onToggle,
  className,
}: BlockMuteButtonProps) {
  const { getAccessToken } = useAuth()
  const { requireAuth } = useRequireAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (dialogOpen) {
      dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [dialogOpen])

  const executeAction = () => {
    requireAuth(async () => {
      setLoading(true)
      setError(false)

      const token = getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        if (action === 'block') {
          if (isActive) {
            await unblockUser(targetDid, token)
          } else {
            await blockUser(targetDid, token)
          }
        } else {
          if (isActive) {
            await unmuteUser(targetDid, token)
          } else {
            await muteUser(targetDid, token)
          }
        }
        onToggle(!isActive)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    })
  }

  const handleClick = () => {
    if (isActive) {
      executeAction()
      return
    }

    const storageKey = STORAGE_KEYS[action]
    if (!localStorage.getItem(storageKey)) {
      setDialogOpen(true)
      return
    }

    executeAction()
  }

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEYS[action], '1')
    setDialogOpen(false)
    executeAction()
  }

  const handleCancel = () => {
    setDialogOpen(false)
  }

  const Icon = action === 'block' ? Prohibit : SpeakerSimpleSlash
  const label = action === 'block' ? (isActive ? 'Unblock' : 'Block') : isActive ? 'Unmute' : 'Mute'

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isActive
            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
          error && 'ring-1 ring-destructive',
          className
        )}
        aria-label={`${label} this user`}
      >
        <Icon size={14} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
        {loading ? `${label.slice(0, -1)}ing...` : label}
      </button>
      {error && (
        <span role="alert" className="inline-flex items-center gap-1 text-xs text-destructive">
          <WarningCircle size={12} aria-hidden="true" />
          Action failed
        </span>
      )}

      {dialogOpen && (
        <dialog
          ref={dialogRef}
          onClose={handleCancel}
          aria-labelledby="block-mute-dialog-title"
          aria-describedby="block-mute-dialog-description"
          className={cn(
            'm-auto w-full max-w-md rounded-lg border border-border bg-background p-0 shadow-lg',
            'backdrop:bg-black/50'
          )}
        >
          <div className="space-y-4 p-6">
            {action === 'block' ? (
              <>
                <h2 id="block-mute-dialog-title" className="text-lg font-semibold text-foreground">
                  Block this user?
                </h2>
                <div id="block-mute-dialog-description" className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Blocking completely removes someone from your experience on this forum:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5" aria-hidden="true">
                        -
                      </span>
                      <span>Their posts and replies are hidden from your feed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5" aria-hidden="true">
                        -
                      </span>
                      <span>They won&apos;t appear in search results</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    You can unblock them anytime from their profile or your settings.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 id="block-mute-dialog-title" className="text-lg font-semibold text-foreground">
                  Mute this user?
                </h2>
                <div id="block-mute-dialog-description" className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Muting reduces someone&apos;s visibility without fully removing them:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5" aria-hidden="true">
                        -
                      </span>
                      <span>Their posts are collapsed but you can expand them to read</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5" aria-hidden="true">
                        -
                      </span>
                      <span>They won&apos;t know they&apos;ve been muted</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    You can unmute them anytime from their profile or your settings.
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className={cn(
                  'rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors',
                  'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={cn(
                  'rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors',
                  'hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
              >
                {label}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}
