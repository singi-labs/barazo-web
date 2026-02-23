/**
 * UserCard - Displays a single user row in the admin user management list.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { Prohibit, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { AdminUser } from '@/lib/api/types'

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  moderator: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-muted text-muted-foreground',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface UserCardProps {
  user: AdminUser
  onBan: (did: string) => void
  onUnban: (did: string) => void
}

export function UserCard({ user, onBan, onUnban }: UserCardProps) {
  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-card p-4',
        user.isBanned && 'border-l-4 border-l-destructive opacity-75'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{user.displayName ?? user.handle}</p>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                ROLE_COLORS[user.role] ?? ROLE_COLORS.member
              )}
            >
              {user.role}
            </span>
            {user.isBanned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                <Prohibit size={10} aria-hidden="true" />
                Banned
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">@{user.handle}</p>
          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
            <span>{user.topicCount} topics</span>
            <span>{user.replyCount} replies</span>
            <span>{user.reportCount} reports</span>
            <span>Joined {formatDate(user.firstSeenAt)}</span>
          </div>
          {user.bannedFromOtherCommunities > 0 && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-destructive">
              <WarningCircle size={12} aria-hidden="true" />
              Banned from {user.bannedFromOtherCommunities} other communities
            </p>
          )}
          {user.isBanned && user.banReason && (
            <p className="mt-1 text-xs text-muted-foreground italic">Reason: {user.banReason}</p>
          )}
        </div>
        <div className="shrink-0">
          {user.isBanned ? (
            <button
              type="button"
              onClick={() => onUnban(user.did)}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              aria-label={`Unban ${user.displayName ?? user.handle}`}
            >
              Unban
            </button>
          ) : (
            user.role !== 'admin' && (
              <button
                type="button"
                onClick={() => onBan(user.did)}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                aria-label={`Ban ${user.displayName ?? user.handle}`}
              >
                Ban
              </button>
            )
          )}
        </div>
      </div>
    </article>
  )
}
