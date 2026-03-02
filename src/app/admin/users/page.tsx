/**
 * Admin user management page.
 * URL: /admin/users
 * User list with ban controls and cross-community ban warnings.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { UserCard } from '@/components/admin/users/user-card'
import { getAdminUsers, banUser, unbanUser } from '@/lib/api/client'
import type { AdminUser } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

export default function AdminUsersPage() {
  const { getAccessToken } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoadError(null)
    try {
      const response = await getAdminUsers(getAccessToken() ?? '')
      setUsers(response.users)
    } catch {
      setLoadError('Failed to load users. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const handleBan = async (did: string) => {
    setActionError(null)
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
      setActionError('Failed to ban user. Please try again.')
    }
  }

  const handleUnban = async (did: string) => {
    setActionError(null)
    try {
      await unbanUser(did, getAccessToken() ?? '')
      setUsers((prev) =>
        prev.map((u) =>
          u.did === did ? { ...u, isBanned: false, bannedAt: null, banReason: null } : u
        )
      )
    } catch {
      setActionError('Failed to unban user. Please try again.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">User management</h1>

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchUsers()} />
        )}

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

        {loading && <p className="text-sm text-muted-foreground">Loading users...</p>}

        {!loading && users.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No users found.</p>
        )}

        {!loading && users.length > 0 && (
          <div className="space-y-2">
            {users.map((user) => (
              <UserCard
                key={user.did}
                user={user}
                onBan={(did) => void handleBan(did)}
                onUnban={(did) => void handleUnban(did)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
