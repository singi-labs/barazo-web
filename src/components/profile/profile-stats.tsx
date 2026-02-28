/**
 * ProfileStats - Renders AT Protocol stats (followers, following, posts) and Bluesky link.
 * Extracted from ProfileHeader to keep components under ~150 lines.
 * @see specs/prd-web.md Section M8
 */

import { Users, ArrowSquareOut } from '@phosphor-icons/react'
import type { UserProfile } from '@/lib/api/types'

interface ProfileStatsProps {
  profile: UserProfile
  handle: string
}

export function ProfileStats({ profile, handle }: ProfileStatsProps) {
  return (
    <>
      {/* AT Protocol stats */}
      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users size={16} aria-hidden="true" />
          {profile.followersCount} {profile.followersCount === 1 ? 'follower' : 'followers'}
        </span>
        <span>{profile.followsCount} following</span>
        <span>{profile.atprotoPostsCount} AT Proto posts</span>
      </div>

      {/* Bluesky link */}
      {profile.hasBlueskyProfile && (
        <a
          href={`https://bsky.app/profile/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View on Bluesky
          <ArrowSquareOut size={14} aria-hidden="true" />
        </a>
      )}
    </>
  )
}
