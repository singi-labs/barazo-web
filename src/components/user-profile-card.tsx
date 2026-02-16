/**
 * UserProfileCard - Hover/focus card showing user info, reputation, and stats.
 * Keyboard-triggerable via focus, Escape-dismissible.
 * @see specs/prd-web.md Section M8 (UserProfileCard)
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { User, CalendarBlank, ChatCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ReputationBadge } from './reputation-badge'

interface UserProfileData {
  did: string
  handle: string
  displayName?: string
  avatarUrl?: string | null
  reputation: number
  postCount: number
  joinedAt: string
}

interface UserProfileCardProps {
  user: UserProfileData
  className?: string
}

const SHOW_DELAY = 200

export function UserProfileCard({ user, className }: UserProfileCardProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLSpanElement>(null)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), SHOW_DELAY)
  }, [])

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hide()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visible, hide])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const joinDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  })

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span
      ref={containerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <Link
        href={`/u/${user.handle}`}
        className="font-medium text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm"
      >
        {user.handle}
      </Link>

      {visible && (
        <div
          className="absolute left-0 top-full z-40 mt-1 w-64 rounded-lg border border-border bg-card p-4 shadow-lg"
          role="tooltip"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User size={20} className="text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {user.displayName && (
                <p className="truncate font-semibold text-foreground">{user.displayName}</p>
              )}
              <p className="truncate text-sm text-muted-foreground">@{user.handle}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <ReputationBadge score={user.reputation} />
            <span className="flex items-center gap-1">
              <ChatCircle size={12} aria-hidden="true" />
              {user.postCount} posts
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarBlank size={12} aria-hidden="true" />
            Joined {joinDate}
          </div>
        </div>
      )}
    </span>
  )
}
