/**
 * Notifications page.
 * URL: /notifications
 * Lists user notifications with mark-read functionality.
 * @see specs/prd-web.md Section M10
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChatCircle, Heart, At, ShieldCheck, CheckCircle } from '@phosphor-icons/react'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ErrorAlert } from '@/components/error-alert'
import { getNotifications, markNotificationsRead } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

const NOTIFICATION_ICONS: Record<NotificationType, typeof ChatCircle> = {
  reply: ChatCircle,
  reaction: Heart,
  mention: At,
  moderation: ShieldCheck,
}

export default function NotificationsPage() {
  const { getAccessToken } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoadError(null)
    try {
      const response = await getNotifications(getAccessToken() ?? '')
      setNotifications(response.notifications)
    } catch {
      setLoadError('Failed to load notifications. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAllRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return

    setActionError(null)
    try {
      await markNotificationsRead(getAccessToken() ?? '', unreadIds)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      setActionError('Failed to mark notifications as read. Please try again.')
    }
  }, [notifications, getAccessToken])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const hasUnread = notifications.some((n) => !n.read)

  return (
    <ForumLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Notifications' }]} />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          {hasUnread && (
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <CheckCircle size={16} aria-hidden="true" />
              Mark all read
            </button>
          )}
        </div>

        {loadError && (
          <ErrorAlert
            message={loadError}
            variant="page"
            onRetry={() => void fetchNotifications()}
          />
        )}

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

        {loading && (
          <div className="animate-pulse space-y-3">
            <div className="h-16 rounded bg-muted" />
            <div className="h-16 rounded bg-muted" />
            <div className="h-16 rounded bg-muted" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No notifications yet. You&rsquo;ll be notified when someone replies, reacts, or mentions
            you.
          </p>
        )}

        {!loading && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type]
              return (
                <article
                  key={notification.id}
                  className={cn(
                    'rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card-hover',
                    !notification.read && 'border-l-2 border-l-primary'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon size={16} className="text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{notification.message}</p>
                      {notification.subjectTitle && (
                        <Link
                          href={`/t/-/${notification.subjectUri.split('/').pop()}`}
                          className="mt-1 block text-xs text-primary hover:underline"
                        >
                          {notification.subjectTitle}
                        </Link>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
                        aria-label="Unread"
                      />
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </ForumLayout>
  )
}
