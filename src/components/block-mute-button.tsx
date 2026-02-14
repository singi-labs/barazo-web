/**
 * Block/mute toggle button for user actions.
 * Used in user profiles and post context menus.
 * @see specs/prd-web.md Section M8
 */

'use client'

import { useState } from 'react'
import { Prohibit, SpeakerSimpleSlash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { blockUser, unblockUser, muteUser, unmuteUser } from '@/lib/api/client'

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
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)

    const token = localStorage.getItem('accessToken')
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
      // Silently fail - the UI state won't change
    } finally {
      setLoading(false)
    }
  }

  const Icon = action === 'block' ? Prohibit : SpeakerSimpleSlash
  const label = action === 'block' ? (isActive ? 'Unblock' : 'Block') : isActive ? 'Unmute' : 'Mute'

  return (
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
        className
      )}
      aria-label={`${label} this user`}
    >
      <Icon size={14} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
      {loading ? `${label.slice(0, -1)}ing...` : label}
    </button>
  )
}
