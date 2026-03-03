/**
 * ReplyCard - Displays a single reply with depth indication.
 * Includes reactions, report button, and inline editing for authors.
 * Depth is shown via left margin indentation.
 * Deleted replies render as tombstone placeholders.
 * @see specs/prd-web.md Section 4 (Topic Components)
 */

'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Link as LinkIcon, ChatCircle, PencilSimple } from '@phosphor-icons/react'
import type { Reply } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { formatRelativeTime, isEdited } from '@/lib/format'
import { updateReply } from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { MarkdownContent } from './markdown-content'
import { MarkdownEditor } from './markdown-editor'
import { LikeButton } from './like-button'
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
  onReply?: (target: { uri: string; cid: string; authorHandle: string; snippet: string }) => void
  canEdit?: boolean
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
  onReply,
  canEdit,
  canReport,
  onReport,
  selfLabels,
  className,
}: ReplyCardProps) {
  const [isEditingReply, setIsEditingReply] = useState(false)
  const [editContent, setEditContent] = useState(reply.content)
  const [displayContent, setDisplayContent] = useState(reply.content)
  const [saving, setSaving] = useState(false)
  const { getAccessToken } = useAuth()
  const { toast } = useToast()

  const handleSaveEdit = useCallback(async () => {
    const trimmed = editContent.trim()
    if (!trimmed) return

    setSaving(true)
    try {
      const accessToken = getAccessToken() ?? ''
      await updateReply(reply.uri, { content: trimmed }, accessToken)
      setDisplayContent(trimmed)
      setIsEditingReply(false)
      toast({ title: 'Reply updated' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update reply'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }, [editContent, reply.uri, getAccessToken, toast])

  const headingId = `reply-heading-${reply.rkey}`
  const indent = DEPTH_INDENT[Math.min(reply.depth, 3)] ?? DEPTH_INDENT[3]
  const isDeleted = reply.isAuthorDeleted || reply.isModDeleted

  if (isDeleted) {
    const tombstoneText = reply.isModDeleted
      ? 'This post was removed by a moderator.'
      : 'This post was removed by the author.'

    return (
      <div className={cn(indent, className)}>
        <article
          id={`post-${postNumber}`}
          className="rounded-lg border border-border bg-muted/50"
          aria-labelledby={headingId}
        >
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2 text-sm">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
                aria-hidden="true"
              >
                ?
              </span>
              <h3 id={headingId} className="font-medium text-muted-foreground">
                [deleted]
              </h3>
            </div>
            <a
              href={`#post-${postNumber}`}
              className="text-xs text-muted-foreground hover:text-foreground"
              aria-label={`Link to post #${postNumber}`}
            >
              #{postNumber}
            </a>
          </div>
          <div className="px-4 pb-3">
            <p className="text-sm italic text-muted-foreground">{tombstoneText}</p>
          </div>
        </article>
      </div>
    )
  }

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
            {isEdited(reply.createdAt, reply.indexedAt) && (
              <span
                className="text-muted-foreground"
                title={`Edited ${new Date(reply.indexedAt).toLocaleString()}`}
              >
                (edited)
              </span>
            )}
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
        <div className="p-4" data-reply-content>
          {isEditingReply ? (
            <div className="space-y-2">
              <MarkdownEditor
                value={editContent}
                onChange={setEditContent}
                id={`edit-reply-${reply.rkey}`}
                label="Edit reply"
                placeholder="Edit your reply..."
                className="[&_label]:sr-only [&_textarea]:min-h-[100px] [&_textarea]:max-h-[40vh]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingReply(false)}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : selfLabels && selfLabels.length > 0 ? (
            <SelfLabelIndicator labels={selfLabels}>
              <MarkdownContent content={displayContent} />
            </SelfLabelIndicator>
          ) : (
            <MarkdownContent content={displayContent} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {reactions && onReactionToggle && (
            <ReactionBar reactions={reactions} onToggle={onReactionToggle} />
          )}
          <LikeButton
            subjectUri={reply.uri}
            subjectCid={reply.cid}
            initialCount={reply.reactionCount}
            size="sm"
          />
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

          {canEdit && !isEditingReply && (
            <button
              type="button"
              onClick={() => {
                setIsEditingReply(true)
                setEditContent(displayContent)
              }}
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`Edit reply by ${reply.author?.handle ?? reply.authorDid}`}
            >
              <PencilSimple className="h-3.5 w-3.5" weight="regular" aria-hidden="true" />
              Edit
            </button>
          )}

          {onReply && (
            <button
              type="button"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              aria-label={`Reply to ${reply.author?.displayName ?? reply.author?.handle ?? reply.authorDid}`}
              onClick={() =>
                onReply({
                  uri: reply.uri,
                  cid: reply.cid,
                  authorHandle: reply.author?.handle ?? reply.authorDid,
                  snippet: reply.content.slice(0, 100),
                })
              }
            >
              <ChatCircle className="h-3.5 w-3.5" weight="regular" aria-hidden="true" />
              Reply
            </button>
          )}

          {canReport && onReport && <ReportDialog subjectUri={reply.uri} onSubmit={onReport} />}
        </div>
      </article>
    </div>
  )
}
