/**
 * TopicCard - Displays a single topic in a list view.
 * Shows title, author, category, reply/reaction counts, last activity.
 * @see specs/prd-web.md Section 4 (Topic Components)
 */

import Link from 'next/link'
import Image from 'next/image'
import { ChatCircle, Heart, Clock } from '@phosphor-icons/react/dist/ssr'
import type { Topic } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { formatRelativeTime, getTopicUrl } from '@/lib/format'

interface TopicCardProps {
  topic: Topic
  className?: string
}

export function TopicCard({ topic, className }: TopicCardProps) {
  const topicUrl = getTopicUrl(topic)

  return (
    <article
      className={cn(
        'flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card-hover',
        className
      )}
      aria-labelledby={`topic-title-${topic.rkey}`}
    >
      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <h3 id={`topic-title-${topic.rkey}`} className="mb-1">
          <Link
            href={topicUrl}
            className="text-base font-semibold text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          >
            {topic.title}
          </Link>
        </h3>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {/* Author */}
          <Link
            href={`/u/${topic.author?.handle ?? topic.authorDid}`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            {topic.author?.avatarUrl ? (
              <Image
                src={topic.author.avatarUrl}
                alt=""
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
            ) : (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium"
                aria-hidden="true"
              >
                {(topic.author?.displayName ?? topic.author?.handle ?? '?')[0]?.toUpperCase()}
              </span>
            )}
            <span>{topic.author?.displayName ?? topic.author?.handle ?? topic.authorDid}</span>
          </Link>

          {/* Category */}
          <Link
            href={`/c/${topic.category}`}
            className="rounded-full bg-primary-muted px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {topic.category}
          </Link>

          {/* Tags */}
          {topic.tags?.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag}`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex shrink-0 items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1" aria-label={`${topic.replyCount} replies`}>
          <ChatCircle className="h-4 w-4" weight="regular" aria-hidden="true" />
          {topic.replyCount}
        </span>
        <span className="flex items-center gap-1" aria-label={`${topic.reactionCount} reactions`}>
          <Heart className="h-4 w-4" weight="regular" aria-hidden="true" />
          {topic.reactionCount}
        </span>
        <span
          className="hidden items-center gap-1 sm:flex"
          aria-label={`Last activity ${formatRelativeTime(topic.lastActivityAt)}`}
        >
          <Clock className="h-4 w-4" weight="regular" aria-hidden="true" />
          {formatRelativeTime(topic.lastActivityAt)}
        </span>
      </div>
    </article>
  )
}
