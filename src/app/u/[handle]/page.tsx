/**
 * User profile page.
 * URL: /u/[handle]
 * Displays user info, reputation, recent posts.
 * Client component (needs param resolution + dynamic data).
 * @see specs/prd-web.md Section M8
 */

'use client'

import { useState, useEffect } from 'react'
import { User, CalendarBlank, ChatCircle } from '@phosphor-icons/react'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ReputationBadge } from '@/components/reputation-badge'
import { BlockMuteButton } from '@/components/block-mute-button'
import { getUserProfile } from '@/lib/api/client'
import type { UserProfile } from '@/lib/api/types'

interface UserProfilePageProps {
  params: Promise<{ handle: string }> | { handle: string }
}

/** Compute reputation from activity counts using the backend formula. */
function computeReputation(activity: UserProfile['activity']): number {
  return activity.topicCount * 5 + activity.replyCount * 2 + activity.reactionsReceived * 1
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const [handle, setHandle] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Resolve Next.js async params
  useEffect(() => {
    async function resolveParams() {
      const resolved = params instanceof Promise ? await params : params
      setHandle(resolved.handle)
    }
    void resolveParams()
  }, [params])

  // Fetch profile when handle is available
  useEffect(() => {
    if (!handle) return

    let cancelled = false
    const controller = new AbortController()

    async function fetchProfile() {
      setLoading(true)
      setError(null)
      try {
        const data = await getUserProfile(handle!, undefined, {
          signal: controller.signal,
        })
        if (!cancelled) {
          setProfile(data)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load profile'
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchProfile()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [handle])

  // Loading state: show skeleton while params resolve or data loads
  if (!handle || loading) {
    return (
      <ForumLayout>
        <div className="animate-pulse space-y-4 py-8">
          <div className="h-48 rounded-t-lg bg-muted" />
          <div className="flex items-start gap-4 p-6">
            <div className="h-16 w-16 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-32 rounded bg-muted" />
              <div className="h-4 w-48 rounded bg-muted" />
            </div>
          </div>
        </div>
      </ForumLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <ForumLayout>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </ForumLayout>
    )
  }

  // No profile loaded (shouldn't happen if no error, but guard)
  if (!profile) {
    return (
      <ForumLayout>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">Profile not found.</p>
        </div>
      </ForumLayout>
    )
  }

  const reputationScore = computeReputation(profile.activity)
  const postCount = profile.activity.topicCount + profile.activity.replyCount

  const joinDate = new Date(profile.firstSeenAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <ForumLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: handle }]} />

        {/* Profile header */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Banner */}
          {profile.bannerUrl && (
            <div className="relative h-48 overflow-hidden">
              <img src={profile.bannerUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.displayName ?? profile.handle}'s avatar`}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <User size={32} className="text-muted-foreground" aria-hidden="true" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.displayName ?? handle}
                </h1>
                {profile.displayName && <p className="text-lg text-muted-foreground">@{handle}</p>}

                {/* Bio */}
                {profile.bio && <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <ReputationBadge score={reputationScore} />
                  <span className="flex items-center gap-1">
                    <ChatCircle size={16} aria-hidden="true" />
                    {postCount} {postCount === 1 ? 'post' : 'posts'}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarBlank size={16} aria-hidden="true" />
                    Joined {joinDate}
                  </span>
                </div>

                {/* Block/Mute actions */}
                <div className="mt-3 flex gap-2">
                  <BlockMuteButton
                    targetDid={profile.did}
                    action="block"
                    isActive={isBlocked}
                    onToggle={setIsBlocked}
                  />
                  <BlockMuteButton
                    targetDid={profile.did}
                    action="mute"
                    isActive={isMuted}
                    onToggle={setIsMuted}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <section>
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Recent posts and replies will appear here once the activity feed is implemented.
          </p>
        </section>
      </div>
    </ForumLayout>
  )
}
