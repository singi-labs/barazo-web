/**
 * ThreadLine - Clickable vertical line with chevron for collapsing thread branches.
 * Visual width: 2px. Tap target: 44px minimum for accessibility.
 * Chevron: CaretDown (expanded) / CaretRight (collapsed). Hidden on mobile.
 * Opacity: controlled by parent to create depth-fade effect for ancestor lines.
 */

import { CaretDown, CaretRight } from '@phosphor-icons/react'

interface ThreadLineProps {
  expanded: boolean
  onToggle: () => void
  authorName: string
  replyCount: number
  opacity?: number
  showChevron?: boolean
  /** Width in pixels. Matches the indent step so lines ARE the indentation. */
  width?: number
}

export function ThreadLine({
  expanded,
  onToggle,
  authorName,
  replyCount,
  opacity = 1,
  showChevron = true,
  width = 22,
}: ThreadLineProps) {
  const label = expanded
    ? `Collapse thread by ${authorName}, ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
    : `Expand thread by ${authorName}, ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={label}
      title={expanded ? 'Collapse thread' : 'Expand thread'}
      className="group relative shrink-0 cursor-pointer border-none bg-transparent p-0"
      style={{ width }}
    >
      {showChevron && (
        <span className="absolute left-1/2 top-1 -translate-x-1/2 text-border transition-colors group-hover:text-accent-foreground">
          {expanded ? (
            <CaretDown className="h-3 w-3" weight="bold" />
          ) : (
            <CaretRight className="h-3 w-3" weight="bold" />
          )}
        </span>
      )}
      {expanded && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-border transition-colors group-hover:bg-accent-foreground"
          style={{ opacity, top: showChevron ? '1.25rem' : 0 }}
        />
      )}
    </button>
  )
}
