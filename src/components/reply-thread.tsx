/**
 * ReplyThread - Displays a threaded tree of replies.
 * Reconstructs tree from flat API response, assigns depth-first post numbers.
 * Post numbers start at 2 (post #1 is the topic itself).
 * @see specs/prd-web.md Section 4 (Topic Components)
 */

import { useMemo } from 'react'
import type { Reply } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { buildReplyTree, flattenReplyTree } from '@/lib/build-reply-tree'
import { ReplyBranch } from './reply-branch'

interface ReplyThreadProps {
  replies: Reply[]
  topicUri: string
  onReply?: (target: { uri: string; cid: string; authorHandle: string; snippet: string }) => void
  currentUserDid?: string
  className?: string
}

export function ReplyThread({
  replies,
  topicUri,
  onReply,
  currentUserDid,
  className,
}: ReplyThreadProps) {
  const replyCount = replies.length
  const heading =
    replyCount === 0 ? 'Replies' : replyCount === 1 ? '1 Reply' : `${replyCount} Replies`

  const { tree, postNumberMap, allReplies } = useMemo(() => {
    const builtTree = buildReplyTree(replies, topicUri)
    const flat = flattenReplyTree(builtTree)
    const map = new Map<string, number>()
    flat.forEach((reply, index) => {
      map.set(reply.uri, index + 2)
    })
    const replyMap = new Map(replies.map((r) => [r.uri, r]))
    return { tree: builtTree, postNumberMap: map, allReplies: replyMap }
  }, [replies, topicUri])

  return (
    <section className={cn('space-y-4', className)} aria-label="Replies">
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>

      {replyCount === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
        </div>
      ) : (
        <ReplyBranch
          nodes={tree}
          postNumberMap={postNumberMap}
          topicUri={topicUri}
          allReplies={allReplies}
          onReply={onReply}
          currentUserDid={currentUserDid}
        />
      )}
    </section>
  )
}
