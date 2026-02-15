/**
 * Admin user management page.
 * URL: /admin/users
 * User list with ban controls and cross-community ban warnings.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Prohibit, WarningCircle } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { getAdminUsers, banUser, unbanUser } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { AdminUser } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

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

export default function AdminUsersPage() {
  const { getAccessToken } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const response = await getAdminUsers(getAccessToken() ?? '')
      setUsers(response.users)
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const handleBan = async (did: string) => {
    try {
      await banUser(did, 'Banned by admin', getAccessToken() ?? '')
      setUsers((prev) =>
        prev.map((u) =>
          u.did === did
            ? {
                ...u,
                isBanned: true,
                bannedAt: new Date().toISOString(),
                banReason: 'Banned by admin',
              }
            : u
        )
      )
    } catch {
      // Silently handle
    }
  }

  const handleUnban = async (did: string) => {
    try {
      await unbanUser(did, getAccessToken() ?? '')
      setUsers((prev) =>
        prev.map((u) =>
          u.did === did ? { ...u, isBanned: false, bannedAt: null, banReason: null } : u
        )
      )
    } catch {
      // Silently handle
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>

        {loading && <p className="text-sm text-muted-foreground">Loading users...</p>}

        {!loading && users.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No users found.</p>
        )}

        {!loading && users.length > 0 && (
          <div className="space-y-2">
            {users.map((user) => (
              <article
                key={user.did}
                className={cn(
                  'rounded-lg border border-border bg-card p-4',
                  user.isBanned && 'border-l-4 border-l-destructive opacity-75'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {user.displayName ?? user.handle}
                      </p>
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
                      <p className="mt-1 text-xs text-muted-foreground italic">
                        Reason: {user.banReason}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {user.isBanned ? (
                      <button
                        type="button"
                        onClick={() => void handleUnban(user.did)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                        aria-label={`Unban ${user.displayName ?? user.handle}`}
                      >
                        Unban
                      </button>
                    ) : (
                      user.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => void handleBan(user.did)}
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
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
