/**
 * TopicView - Displays a full topic post with content and metadata.
 * Includes reactions, moderation controls, report button, edit button, and self-labels.
 * Used on the topic detail page.
 * @see specs/prd-web.md Section 4 (Topic Components)
 */

import Link from 'next/link'
import Image from 'next/image'
import {
  ChatCircle,
  Clock,
  Tag,
  PencilSimple,
  Link as LinkIcon,
  Eye,
} from '@phosphor-icons/react/dist/ssr'
import type { Topic } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { formatRelativeTime, formatCompactNumber, isEdited } from '@/lib/format'
import { MarkdownContent } from './markdown-content'
import { LikeButton } from './like-button'
import { ReactionBar } from './reaction-bar'
import {
  ModerationControls,
  type ModerationAction,
  type ModerationActionOptions,
} from './moderation-controls'
import { ReportDialog, type ReportSubmission } from './report-dialog'
import { SelfLabelIndicator } from './self-label-indicator'

interface ReactionData {
  type: string
  count: number
  reacted: boolean
}

interface TopicViewProps {
  topic: Topic
  reactions?: ReactionData[]
  onReactionToggle?: (type: string) => void
  isModerator?: boolean
  isAdmin?: boolean
  isLocked?: boolean
  isPinned?: boolean
  onModerationAction?: (action: ModerationAction, options?: ModerationActionOptions) => void
  canEdit?: boolean
  onEdit?: () => void
  onReply?: () => void
  canReport?: boolean
  onReport?: (report: ReportSubmission) => void
  isOwnContent?: boolean
  selfLabels?: string[]
  className?: string
}

export function TopicView({
  topic,
  reactions,
  onReactionToggle,
  isModerator,
  isAdmin,
  isLocked,
  isPinned,
  onModerationAction,
  canEdit,
  onEdit,
  onReply,
  canReport,
  onReport,
  isOwnContent,
  selfLabels,
  className,
}: TopicViewProps) {
  const headingId = `topic-heading-${topic.rkey}`
  const isDeleted = topic.isAuthorDeleted || topic.isModDeleted

  if (isDeleted) {
    const tombstoneText = topic.isModDeleted
      ? 'This topic was removed by a moderator.'
      : 'This topic was removed by the author.'

    return (
      <article
        id="post-1"
        className={cn('rounded-lg border border-border bg-muted/50', className)}
        aria-labelledby={headingId}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 text-sm">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
              aria-hidden="true"
            >
              ?
            </span>
            <h2 id={headingId} className="font-medium text-muted-foreground">
              [deleted]
            </h2>
          </div>
          <p className="mt-4 text-sm italic text-muted-foreground">{tombstoneText}</p>
        </div>
      </article>
    )
  }

  return (
    <article
      id="post-1"
      className={cn('rounded-lg border border-border bg-card', className)}
      aria-labelledby={headingId}
    >
      {/* Header */}
      <div className="border-b border-border p-4 sm:p-6">
        <h2 id={headingId} className="text-xl font-bold text-foreground sm:text-2xl">
          {topic.title}
        </h2>

        {/* Author + timestamp */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <Link
            href={`/profile/${topic.author?.handle ?? topic.authorDid}`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            {topic.author?.avatarUrl ? (
              <Image
                src={topic.author.avatarUrl}
                alt=""
                width={24}
                height={24}
                className="rounded-full object-cover"
              />
            ) : (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium"
                aria-hidden="true"
              >
                {(topic.author?.displayName ?? topic.author?.handle ?? '?')[0]?.toUpperCase()}
              </span>
            )}
            <span>{topic.author?.displayName ?? topic.author?.handle ?? topic.authorDid}</span>
          </Link>
          <span aria-hidden="true">·</span>
          <time dateTime={topic.publishedAt}>{formatRelativeTime(topic.publishedAt)}</time>
          {isEdited(topic.publishedAt, topic.indexedAt) && (
            <span
              className="text-muted-foreground"
              title={`Edited ${new Date(topic.indexedAt).toLocaleString()}`}
            >
              (edited)
            </span>
          )}
        </div>

        {/* Category + Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            href={`/c/${topic.category}`}
            className="rounded-full bg-primary-muted px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {topic.category}
          </Link>
          {topic.tags?.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag}`}
              className="inline-flex items-center gap-1 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Tag className="h-3 w-3" weight="regular" aria-hidden="true" />#{tag}
            </Link>
          ))}
        </div>

        {/* Moderation controls */}
        {isModerator && onModerationAction && (
          <div className="mt-3">
            <ModerationControls
              isModerator={true}
              isAdmin={isAdmin}
              isLocked={isLocked}
              isPinned={isPinned}
              onAction={onModerationAction}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {selfLabels && selfLabels.length > 0 ? (
          <SelfLabelIndicator labels={selfLabels}>
            <MarkdownContent content={topic.content} />
          </SelfLabelIndicator>
        ) : (
          <MarkdownContent content={topic.content} />
        )}
      </div>

      {/* Footer: read signals left, actions right */}
      <div className="flex items-center gap-4 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:px-6">
        {reactions && onReactionToggle && (
          <ReactionBar reactions={reactions} onToggle={onReactionToggle} disabled={isOwnContent} />
        )}
        <LikeButton
          subjectUri={topic.uri}
          subjectCid={topic.cid}
          initialCount={topic.reactionCount}
          disabled={isOwnContent}
        />
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" weight="regular" aria-hidden="true" />
          Last activity {formatRelativeTime(topic.lastActivityAt)}
        </span>

        <a
          href="#post-1"
          className="ml-auto flex items-center gap-1.5 hover:text-foreground"
          aria-label="Permalink to original post"
        >
          <LinkIcon className="h-4 w-4" weight="regular" aria-hidden="true" />
        </a>

        {canEdit && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <PencilSimple className="h-3.5 w-3.5" weight="regular" aria-hidden="true" />
            Edit
          </button>
        )}

        {onReply ? (
          <button
            type="button"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Reply to this topic (${formatCompactNumber(topic.replyCount)} replies)`}
            onClick={onReply}
          >
            <ChatCircle className="h-4 w-4" weight="regular" aria-hidden="true" />
            {formatCompactNumber(topic.replyCount)}
          </button>
        ) : (
          <span
            className="flex items-center gap-1.5"
            aria-label={`${formatCompactNumber(topic.replyCount)} replies`}
          >
            <ChatCircle className="h-4 w-4" weight="regular" aria-hidden="true" />
            {formatCompactNumber(topic.replyCount)}
          </span>
        )}

        <span className="flex items-center gap-1.5" aria-label={`${topic.viewCount} views`}>
          <Eye className="h-4 w-4" weight="regular" aria-hidden="true" />
          {formatCompactNumber(topic.viewCount)}
        </span>

        {canReport && onReport && <ReportDialog subjectUri={topic.uri} onSubmit={onReport} />}
      </div>
    </article>
  )
}
