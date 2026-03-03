/**
 * ReplyThread - Displays a paginated list of replies with depth indicators.
 * Post numbers start at 2 (post #1 is the topic itself).
 * @see specs/prd-web.md Section 4 (Topic Components)
 */

import type { Reply } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { ReplyCard } from './reply-card'

interface ReplyThreadProps {
  replies: Reply[]
  onReply?: (target: { uri: string; cid: string; authorHandle: string; snippet: string }) => void
  currentUserDid?: string
  className?: string
}

export function ReplyThread({ replies, onReply, currentUserDid, className }: ReplyThreadProps) {
  const replyCount = replies.length
  const heading =
    replyCount === 0 ? 'Replies' : replyCount === 1 ? '1 Reply' : `${replyCount} Replies`

  return (
    <section className={cn('space-y-4', className)} aria-label="Replies">
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>

      {replyCount === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {replies.map((reply, index) => (
            <ReplyCard
              key={reply.uri}
              reply={reply}
              postNumber={index + 2}
              onReply={onReply}
              canEdit={currentUserDid ? reply.authorDid === currentUserDid : false}
            />
          ))}
        </div>
      )}
    </section>
  )
}
