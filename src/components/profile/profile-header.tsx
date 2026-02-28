/**
 * ProfileHeader - Displays user profile card with banner, avatar, bio, stats, and actions.
 * Hides block/mute buttons when viewing own profile.
 * @see specs/prd-web.md Section M8
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  CalendarBlank,
  ChatCircle,
  ArrowUp,
  PencilSimple,
  HouseSimple,
  At,
  Globe,
  Heart,
} from '@phosphor-icons/react'
import { ReputationBadge } from '@/components/reputation-badge'
import { BlockMuteButton } from '@/components/block-mute-button'
import { ProfileStats } from '@/components/profile/profile-stats'
import { formatBio } from '@/lib/format-bio'
import { ProfileLabels } from '@/components/profile/profile-labels'
import { formatCount } from '@/lib/format-count'
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
            {/* Display name + handle inline + edit button */}
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h1 className="text-2xl font-bold text-foreground">
                {profile.displayName ?? handle}
              </h1>
              {profile.displayName && (
                <span className="text-lg text-muted-foreground">@{handle}</span>
              )}
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

            {/* AT Protocol labels */}
            {profile.labels.length > 0 && <ProfileLabels labels={profile.labels} />}

            {/* Bio */}
            {profile.bio && (
              <div
                className="prose-barazo mt-2 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: formatBio(profile.bio) }}
              />
            )}

            <hr className="mt-4 border-border/50" />

            {/* Labeled stats sections */}
            <div className="mt-4 flex flex-wrap gap-6">
              {/* This forum */}
              <div className="min-w-[140px] flex-1">
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <HouseSimple size={14} aria-hidden="true" />
                  This forum
                </p>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ChatCircle size={16} aria-hidden="true" />
                    <span title={postCount.toLocaleString()}>
                      {formatCount(postCount)} {postCount === 1 ? 'post' : 'posts'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={16} aria-hidden="true" />
                    <span title={profile.activity.reactionsReceived.toLocaleString()}>
                      {formatCount(profile.activity.reactionsReceived)}{' '}
                      {profile.activity.reactionsReceived === 1 ? 'reaction' : 'reactions'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowUp size={16} aria-hidden="true" />
                    <span title={profile.activity.votesReceived.toLocaleString()}>
                      {formatCount(profile.activity.votesReceived)}{' '}
                      {profile.activity.votesReceived === 1 ? 'vote' : 'votes'}
                    </span>
                  </span>
                  <ReputationBadge score={reputationScore} />
                  <span className="flex items-center gap-1">
                    <CalendarBlank size={16} aria-hidden="true" />
                    Joined {joinDate}
                  </span>
                </div>
              </div>

              {/* AT Protocol */}
              <div className="min-w-[140px] flex-1">
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <At size={14} aria-hidden="true" />
                  AT Protocol
                </p>
                <ProfileStats profile={profile} handle={handle} />
              </div>

              {/* Barazo-wide (conditional) */}
              {profile.globalActivity && (
                <div className="min-w-[140px] flex-1">
                  <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Globe size={14} aria-hidden="true" />
                    Barazo-wide
                  </p>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span title={profile.globalActivity.topicCount.toLocaleString()}>
                      {formatCount(profile.globalActivity.topicCount)} topics
                    </span>
                    <span title={profile.globalActivity.replyCount.toLocaleString()}>
                      {formatCount(profile.globalActivity.replyCount)} replies
                    </span>
                    <span title={profile.globalActivity.reactionsReceived.toLocaleString()}>
                      {formatCount(profile.globalActivity.reactionsReceived)} reactions
                    </span>
                    <span title={profile.globalActivity.votesReceived.toLocaleString()}>
                      {formatCount(profile.globalActivity.votesReceived)} votes
                    </span>
                  </div>
                </div>
              )}
            </div>

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
          </div>
        </div>
      </div>
    </div>
  )
}
