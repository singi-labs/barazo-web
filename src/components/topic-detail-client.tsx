/**
 * TopicDetailClient - Client-side wrapper for topic detail page.
 * Manages reply state, select-to-quote, auth gating, and keyboard shortcuts.
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import type { Reply, Topic } from '@/lib/api/types'
import { getTopicUrl } from '@/lib/format'
import { TopicView } from '@/components/topic-view'
import { ReplyThread } from '@/components/reply-thread'
import {
  ReplyComposer,
  type ReplyTarget,
  type ReplyComposerHandle,
} from '@/components/reply-composer'
import { AuthGate } from '@/components/auth-gate'

interface TopicDetailClientProps {
  topic: Topic
  replies: Reply[]
  isLocked?: boolean
}

export function TopicDetailClient({ topic, replies, isLocked = false }: TopicDetailClientProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const canEdit = isAuthenticated && user?.did === topic.authorDid
  const handleEdit = useCallback(() => {
    router.push(
      getTopicUrl({
        authorHandle: topic.author?.handle ?? topic.authorDid,
        rkey: topic.rkey,
      }) + '/edit'
    )
  }, [router, topic])
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)
  const [composerContent, setComposerContent] = useState('')
  const composerRef = useRef<ReplyComposerHandle>(null)

  // `r` keyboard shortcut opens the composer
  useEffect(() => {
    if (!isAuthenticated || isLocked) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        composerRef.current?.expand()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isAuthenticated, isLocked])

  const handleReply = useCallback(
    (target: { uri: string; cid: string; authorHandle: string; snippet: string }) => {
      // Check for selected text (select-to-quote)
      const selection = window.getSelection()
      let quotedText = ''
      if (selection && selection.toString().trim()) {
        const range = selection.getRangeAt(0)
        const replyContent =
          range.commonAncestorContainer.parentElement?.closest('[data-reply-content]')
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

  const handleDeleteReply = useCallback(() => {
    router.refresh()
  }, [router])

  const handleReplyCreated = useCallback(() => {
    setReplyTarget(null)
    setComposerContent('')
    router.refresh()
  }, [router])

  return (
    <>
      {/* Topic with edit button for author */}
      <div className="mt-4">
        <TopicView
          topic={topic}
          canEdit={canEdit}
          onEdit={handleEdit}
          onReply={
            isAuthenticated && !isLocked
              ? () =>
                  handleReply({
                    uri: topic.uri,
                    cid: topic.cid,
                    authorHandle: topic.author?.handle ?? topic.authorDid,
                    snippet: topic.content.slice(0, 100),
                  })
              : undefined
          }
        />
      </div>

      {/* Reply thread with reply buttons */}
      <div className="mt-8 pb-16">
        <ReplyThread
          replies={replies}
          topicUri={topic.uri}
          onReply={isLocked ? undefined : handleReply}
          onDeleteReply={handleDeleteReply}
          currentUserDid={user?.did}
        />
      </div>

      {/* Composer or auth gate */}
      {isLoading ? null : isAuthenticated ? (
        <ReplyComposer
          ref={composerRef}
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
