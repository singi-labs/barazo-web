/**
 * ProfileHeader - Displays user profile card with banner, avatar, bio, stats, and actions.
 * Hides block/mute buttons when viewing own profile.
 * @see specs/prd-web.md Section M8
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User, CalendarBlank, ChatCircle, ArrowUp, PencilSimple } from '@phosphor-icons/react'
import { ReputationBadge } from '@/components/reputation-badge'
import { BlockMuteButton } from '@/components/block-mute-button'
import { ProfileStats } from '@/components/profile/profile-stats'
import { formatBio } from '@/lib/format-bio'
import type { UserProfile } from '@/lib/api/types'

interface ProfileHeaderProps {
  profile: UserProfile
  handle: string
  reputationScore: number
  postCount: number
  joinDate: string
  isBlocked: boolean
  isMuted: boolean
  onBlockToggle: (blocked: boolean) => void
  onMuteToggle: (muted: boolean) => void
  /** DID of the currently authenticated viewer (null if logged out) */
  viewerDid: string | null
}

export function ProfileHeader({
  profile,
  handle,
  reputationScore,
  postCount,
  joinDate,
  isBlocked,
  isMuted,
  onBlockToggle,
  onMuteToggle,
  viewerDid,
}: ProfileHeaderProps) {
  const isOwnProfile = viewerDid !== null && viewerDid === profile.did

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Banner */}
      {profile.bannerUrl && (
        <div className="relative h-48 overflow-hidden">
          <Image src={profile.bannerUrl} alt="" fill className="object-cover" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={`${profile.displayName ?? profile.handle}'s avatar`}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <User size={32} className="text-muted-foreground" aria-hidden="true" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {profile.displayName ?? handle}
              </h1>
              {isOwnProfile && (
                <Link
                  href={`/u/${handle}/edit`}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <PencilSimple size={16} aria-hidden="true" />
                  Edit profile
                </Link>
              )}
            </div>
            {profile.displayName && <p className="text-lg text-muted-foreground">@{handle}</p>}

            {/* Bio */}
            {profile.bio && (
              <div
                className="mt-2 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: formatBio(profile.bio) }}
              />
            )}

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <ReputationBadge score={reputationScore} />
              <span className="flex items-center gap-1">
                <ChatCircle size={16} aria-hidden="true" />
                {postCount} {postCount === 1 ? 'post' : 'posts'}
              </span>
              <span className="flex items-center gap-1">
                <ArrowUp size={16} aria-hidden="true" />
                {profile.activity.votesReceived}{' '}
                {profile.activity.votesReceived === 1 ? 'vote' : 'votes'}
              </span>
              <span className="flex items-center gap-1">
                <CalendarBlank size={16} aria-hidden="true" />
                Joined {joinDate}
              </span>
            </div>

            <ProfileStats profile={profile} handle={handle} />

            {/* Block/Mute actions (hidden on own profile) */}
            {!isOwnProfile && (
              <div className="mt-3 flex gap-2">
                <BlockMuteButton
                  targetDid={profile.did}
                  action="block"
                  isActive={isBlocked}
                  onToggle={onBlockToggle}
                />
                <BlockMuteButton
                  targetDid={profile.did}
                  action="mute"
                  isActive={isMuted}
                  onToggle={onMuteToggle}
                />
              </div>
            )}

            {profile.globalActivity && (
              <div className="mt-4 rounded-md bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Activity across all communities
                </p>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>{profile.globalActivity.topicCount} topics</span>
                  <span>{profile.globalActivity.replyCount} replies</span>
                  <span>{profile.globalActivity.reactionsReceived} reactions</span>
                  <span>{profile.globalActivity.votesReceived} votes</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
