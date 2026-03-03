/**
 * TopicDetailClient - Client-side wrapper for topic detail page.
 * Manages reply state, select-to-quote, and auth gating.
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import type { Reply, Topic } from '@/lib/api/types'
import { ReplyThread } from '@/components/reply-thread'
import { ReplyComposer, type ReplyTarget } from '@/components/reply-composer'
import { AuthGate } from '@/components/auth-gate'

interface TopicDetailClientProps {
  topic: Topic
  replies: Reply[]
  isLocked?: boolean
}

export function TopicDetailClient({ topic, replies, isLocked = false }: TopicDetailClientProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)
  const [composerContent, setComposerContent] = useState('')

  const handleReply = useCallback(
    (target: { uri: string; cid: string; authorHandle: string; snippet: string }) => {
      // Check for selected text (select-to-quote)
      const selection = window.getSelection()
      let quotedText = ''
      if (selection && selection.toString().trim()) {
        const range = selection.getRangeAt(0)
        const replyContent = range.commonAncestorContainer.parentElement?.closest(
          '[data-reply-content]'
        )
        if (replyContent) {
          quotedText = selection.toString().trim()
        }
      }

      setReplyTarget(target)

      if (quotedText) {
        const blockquote = quotedText
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n')
        setComposerContent(`${blockquote}\n\n`)
      } else {
        setComposerContent('')
      }
    },
    []
  )

  const handleClearReplyTarget = useCallback(() => {
    setReplyTarget(null)
  }, [])

  const handleReplyCreated = useCallback(() => {
    setReplyTarget(null)
    setComposerContent('')
    router.refresh()
  }, [router])

  return (
    <>
      {/* Reply thread with reply buttons */}
      <div className="mt-8 pb-16">
        <ReplyThread replies={replies} onReply={isLocked ? undefined : handleReply} />
      </div>

      {/* Composer or auth gate */}
      {isLoading ? null : isAuthenticated ? (
        <ReplyComposer
          topicUri={topic.uri}
          topicCid={topic.cid}
          communityDid={topic.communityDid}
          onReplyCreated={handleReplyCreated}
          replyTarget={replyTarget}
          onClearReplyTarget={handleClearReplyTarget}
          initialContent={composerContent}
          isLocked={isLocked}
        />
      ) : (
        <AuthGate message="Sign in to join the discussion" />
      )}
    </>
  )
}
