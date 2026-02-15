/**
 * Block/mute toggle button for user actions.
 * Used in user profiles and post context menus.
 * @see specs/prd-web.md Section M8
 */

'use client'

import { useState } from 'react'
import { Prohibit, SpeakerSimpleSlash, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { blockUser, unblockUser, muteUser, unmuteUser } from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'

interface BlockMuteButtonProps {
  targetDid: string
  action: 'block' | 'mute'
  isActive: boolean
  onToggle: (newState: boolean) => void
  className?: string
}

export function BlockMuteButton({
  targetDid,
  action,
  isActive,
  onToggle,
  className,
}: BlockMuteButtonProps) {
  const { getAccessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleClick = async () => {
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
    </div>
  )
}
