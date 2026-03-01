/**
 * User profile page.
 * URL: /u/[handle]
 * Displays user info, reputation, recent posts.
 * Client component (needs param resolution + dynamic data).
 * @see specs/prd-web.md Section M8
 */

'use client'

import { useState, useEffect } from 'react'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileSkeleton } from '@/components/profile/profile-skeleton'
import { getUserProfile, getPublicSettings } from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'
import { formatDateLong } from '@/lib/format'
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
  const { user } = useAuth()

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
        const publicSettings = await getPublicSettings({
          signal: controller.signal,
        }).catch(() => null)
        const communityDid = publicSettings?.communityDid ?? undefined
        const data = await getUserProfile(handle!, communityDid, {
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
        <ProfileSkeleton />
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

  const joinDate = formatDateLong(profile.firstSeenAt)

  return (
    <ForumLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: handle }]} />

        <ProfileHeader
          profile={profile}
          handle={handle}
          reputationScore={reputationScore}
          postCount={postCount}
          joinDate={joinDate}
          isBlocked={isBlocked}
          isMuted={isMuted}
          onBlockToggle={setIsBlocked}
          onMuteToggle={setIsMuted}
          viewerDid={user?.did ?? null}
        />

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
