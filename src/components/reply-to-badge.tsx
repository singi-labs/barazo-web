/**
 * ReplyToBadge - Shows "Replying to @username" with a link to the parent post.
 * Displayed when visual depth is capped or for fall-through replies.
 */

import { ArrowBendDownRight } from '@phosphor-icons/react/dist/ssr'

interface ReplyToBadgeProps {
  authorHandle: string
  parentPostNumber: number
}

export function ReplyToBadge({ authorHandle, parentPostNumber }: ReplyToBadgeProps) {
  return (
    <a
      href={`#post-${parentPostNumber}`}
      className="mb-1 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      aria-label={`In reply to ${authorHandle}'s post`}
    >
      <ArrowBendDownRight className="h-3 w-3" weight="regular" aria-hidden="true" />
      <span>@{authorHandle}</span>
    </a>
  )
}
