/**
 * Admin dashboard page.
 * URL: /admin
 * Shows community statistics and recent activity.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChatCircle, Users, FolderSimple, WarningCircle, TrendUp } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { getCommunityStats } from '@/lib/api/client'
import type { CommunityStats } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

interface StatCardProps {
  label: string
  value: number
  recentValue: number
  icon: typeof ChatCircle
}

function StatCard({ label, value, recentValue, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
          <Icon size={20} className="text-muted-foreground" aria-hidden="true" />
        </div>
        {recentValue > 0 && (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <TrendUp size={12} aria-hidden="true" />
            {recentValue} new
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { getAccessToken } = useAuth()
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setError(null)
    try {
      const data = await getCommunityStats(getAccessToken() ?? '')
      setStats(data)
    } catch {
      setError('Failed to load dashboard statistics. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

        {loading && <p className="text-sm text-muted-foreground">Loading statistics...</p>}

        {error && <ErrorAlert message={error} variant="page" onRetry={() => void fetchStats()} />}

        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Topics"
              value={stats.topicCount}
              recentValue={stats.recentTopics}
              icon={FolderSimple}
            />
            <StatCard
              label="Replies"
              value={stats.replyCount}
              recentValue={stats.recentReplies}
              icon={ChatCircle}
            />
            <StatCard
              label="Users"
              value={stats.userCount}
              recentValue={stats.recentUsers}
              icon={Users}
            />
            <StatCard
              label="Pending Reports"
              value={stats.reportCount}
              recentValue={0}
              icon={WarningCircle}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
