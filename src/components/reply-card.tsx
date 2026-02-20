/**
 * ReplyCard - Displays a single reply with depth indication.
 * Includes reactions and report button.
 * Depth is shown via left margin indentation.
 * @see specs/prd-web.md Section 4 (Topic Components)
 */

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Clock, Link as LinkIcon } from '@phosphor-icons/react/dist/ssr'
import type { Reply } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { formatRelativeTime, formatCompactNumber } from '@/lib/format'
import { MarkdownContent } from './markdown-content'
import { ReactionBar } from './reaction-bar'
import { ReportDialog, type ReportSubmission } from './report-dialog'
import { SelfLabelIndicator } from './self-label-indicator'

interface ReactionData {
  type: string
  count: number
  reacted: boolean
}

interface ReplyCardProps {
  reply: Reply
  postNumber: number
  reactions?: ReactionData[]
  onReactionToggle?: (type: string) => void
  canReport?: boolean
  onReport?: (report: ReportSubmission) => void
  selfLabels?: string[]
  className?: string
}

const DEPTH_INDENT: Record<number, string> = {
  0: '',
  1: 'ml-6 sm:ml-8',
  2: 'ml-12 sm:ml-16',
  3: 'ml-16 sm:ml-20',
}

export function ReplyCard({
  reply,
  postNumber,
  reactions,
  onReactionToggle,
  canReport,
  onReport,
  selfLabels,
  className,
}: ReplyCardProps) {
  const headingId = `reply-heading-${reply.rkey}`
  const indent = DEPTH_INDENT[Math.min(reply.depth, 3)] ?? DEPTH_INDENT[3]

  return (
    <div className={cn(indent, className)}>
      <article
        id={`post-${postNumber}`}
        className="rounded-lg border border-border bg-card"
        aria-labelledby={headingId}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/u/${reply.author?.handle ?? reply.authorDid}`}
              className="flex items-center gap-2 hover:text-foreground"
            >
              {reply.author?.avatarUrl ? (
                <Image
                  src={reply.author.avatarUrl}
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
                  {(reply.author?.displayName ?? reply.author?.handle ?? '?')[0]?.toUpperCase()}
                </span>
              )}
              <h3 id={headingId} className="font-medium text-foreground">
                {reply.author?.displayName ?? reply.author?.handle ?? reply.authorDid}
              </h3>
            </Link>
            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>
            <time className="text-muted-foreground" dateTime={reply.createdAt}>
              {formatRelativeTime(reply.createdAt)}
            </time>
          </div>
          <a
            href={`#post-${postNumber}`}
            className="text-xs text-muted-foreground hover:text-foreground"
            aria-label={`Link to post #${postNumber}`}
          >
            #{postNumber}
          </a>
        </div>

        {/* Content */}
        <div className="p-4">
          {selfLabels && selfLabels.length > 0 ? (
            <SelfLabelIndicator labels={selfLabels}>
              <MarkdownContent content={reply.content} />
            </SelfLabelIndicator>
          ) : (
            <MarkdownContent content={reply.content} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {reactions && onReactionToggle && (
            <ReactionBar reactions={reactions} onToggle={onReactionToggle} />
          )}
          <span
            className="flex items-center gap-1"
            aria-label={`${formatCompactNumber(reply.reactionCount)} reactions`}
          >
            <Heart className="h-3.5 w-3.5" weight="regular" aria-hidden="true" />
            {formatCompactNumber(reply.reactionCount)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" weight="regular" aria-hidden="true" />
            {formatRelativeTime(reply.createdAt)}
          </span>
          <a
            href={`#post-${postNumber}`}
            className="ml-auto flex items-center gap-1 hover:text-foreground"
            aria-label={`Permalink to post #${postNumber}`}
          >
            <LinkIcon className="h-3.5 w-3.5" weight="regular" aria-hidden="true" />
          </a>

          {canReport && onReport && <ReportDialog subjectUri={reply.uri} onSubmit={onReport} />}
        </div>
      </article>
    </div>
  )
}
