/**
 * ProfileStats - Renders AT Protocol stats (followers, following, posts) and Bluesky link.
 * Used as a sub-component within the "AT Protocol" stats section of ProfileHeader.
 * @see specs/prd-web.md Section M8
 */

import { Users, ArrowSquareOut, CalendarBlank } from '@phosphor-icons/react'
import { formatCount } from '@/lib/format-count'
import { formatDateLong } from '@/lib/format'
import type { UserProfile } from '@/lib/api/types'

interface ProfileStatsProps {
  profile: UserProfile
  handle: string
}

export function ProfileStats({ profile, handle }: ProfileStatsProps) {
  const accountCreatedDate = profile.accountCreatedAt
    ? formatDateLong(profile.accountCreatedAt)
    : null

  return (
    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
      <span className="flex items-center gap-1">
        <Users size={16} aria-hidden="true" />
        <span title={profile.followersCount.toLocaleString()}>
          {formatCount(profile.followersCount)}{' '}
          {profile.followersCount === 1 ? 'follower' : 'followers'}
        </span>
      </span>
      <span title={profile.followsCount.toLocaleString()}>
        {formatCount(profile.followsCount)} following
      </span>
      <span title={profile.atprotoPostsCount.toLocaleString()}>
        {formatCount(profile.atprotoPostsCount)} AT Proto posts
      </span>

      {/* Account creation date from PLC directory */}
      {accountCreatedDate && (
        <span className="flex items-center gap-1">
          <CalendarBlank size={16} aria-hidden="true" />
          Since <time dateTime={profile.accountCreatedAt!}>{accountCreatedDate}</time>
        </span>
      )}

      {/* Bluesky link */}
      {profile.hasBlueskyProfile && (
        <a
          href={`https://bsky.app/profile/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          bsky.app/profile/{handle}
          <ArrowSquareOut size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  )
}
