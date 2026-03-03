/**
 * ReplyComposer - Fixed bottom bar for replying to topics and replies.
 * Collapse/expand states, reply targeting with quote banner.
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { PaperPlaneRight, X, Lock } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { createReply } from '@/lib/api/client'
import { MarkdownEditor } from '@/components/markdown-editor'
import { cn } from '@/lib/utils'

export interface ReplyTarget {
  uri: string
  cid: string
  authorHandle: string
  snippet: string
}

interface ReplyComposerProps {
  topicUri: string
  topicCid: string
  communityDid: string
  onReplyCreated: () => void
  replyTarget?: ReplyTarget | null
  onClearReplyTarget?: () => void
  initialContent?: string
  isLocked?: boolean
  className?: string
}

export function ReplyComposer({
  topicUri,
  topicCid,
  communityDid,
  onReplyCreated,
  replyTarget,
  onClearReplyTarget,
  initialContent = '',
  isLocked = false,
  className,
}: ReplyComposerProps) {
  const { getAccessToken } = useAuth()
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [submitting, setSubmitting] = useState(false)
  const composerRef = useRef<HTMLDivElement>(null)

  // Sync initialContent when it changes (e.g., select-to-quote)
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent)
      setIsExpanded(true)
    }
  }, [initialContent])

  // Focus textarea when expanding
  useEffect(() => {
    if (isExpanded) {
      requestAnimationFrame(() => {
        const textarea = composerRef.current?.querySelector('textarea')
        textarea?.focus()
      })
    }
  }, [isExpanded])

  // Auto-expand when reply target is set
  useEffect(() => {
    if (replyTarget) {
      setIsExpanded(true)
    }
  }, [replyTarget])

  const handleExpand = useCallback(() => {
    setIsExpanded(true)
  }, [])

  const handleCollapse = useCallback(() => {
    setIsExpanded(false)
  }, [])

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim()
    if (!trimmed) return

    setSubmitting(true)
    try {
      const accessToken = getAccessToken() ?? ''
      await createReply(
        topicUri,
        {
          content: trimmed,
          parentUri: replyTarget?.uri,
        },
        accessToken
      )
      setContent('')
      setIsExpanded(false)
      onReplyCreated()
      toast({ title: 'Reply posted' })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to post reply'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }, [content, topicUri, replyTarget, getAccessToken, onReplyCreated, toast])

  if (isLocked) {
    return (
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-muted/80 backdrop-blur',
          className
        )}
      >
        <div className="container flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" weight="bold" aria-hidden="true" />
          This topic is locked. New replies are not accepted.
        </div>
      </div>
    )
  }

  if (!isExpanded) {
    return (
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
      >
        <div className="container">
          <button
            type="button"
            onClick={handleExpand}
            className="flex w-full items-center justify-between py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>Write a reply...</span>
            <PaperPlaneRight
              className="h-4 w-4"
              weight="bold"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={composerRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background shadow-lg',
        className
      )}
    >
      <div className="container space-y-2 py-3">
        {/* Reply target banner */}
        {replyTarget && (
          <div className="flex items-start justify-between rounded-md bg-muted px-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-foreground">
                Replying to @{replyTarget.authorHandle}
              </p>
              <p className="truncate text-muted-foreground">
                {replyTarget.snippet}
              </p>
            </div>
            <button
              type="button"
              onClick={onClearReplyTarget}
              aria-label="Dismiss reply target"
              className="ml-2 shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" weight="bold" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Editor */}
        <MarkdownEditor
          value={content}
          onChange={setContent}
          id="reply-content"
          label="Reply"
          placeholder="Write your reply..."
          className="[&_label]:sr-only [&_textarea]:min-h-[120px] [&_textarea]:max-h-[40vh]"
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCollapse}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className={cn(
              'rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors',
              'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {submitting ? 'Posting...' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}
