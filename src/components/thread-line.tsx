/**
 * ThreadLine - Clickable vertical line with chevron for collapsing thread branches.
 * Chevron: CaretDown (expanded) / CaretRight (collapsed). Hidden on mobile.
 * Opacity: controlled by parent to create depth-fade effect for ancestor lines.
 * Hover: coordinated via ThreadHoverContext so all segments of the same
 * ancestor line highlight together across the full thread height.
 */

import { CaretDown, CaretRight } from '@phosphor-icons/react'
import { useThreadHover } from '@/context/thread-hover-context'

interface ThreadLineProps {
  expanded: boolean
  onToggle: () => void
  authorName: string
  replyCount: number
  /** URI identifying which ancestor this line belongs to. Used for coordinated hover. */
  ancestorUri: string
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
  ancestorUri,
  opacity = 1,
  showChevron = true,
  width = 22,
}: ThreadLineProps) {
  const { hoveredUri, setHovered } = useThreadHover()
  const isHighlighted = hoveredUri === ancestorUri

  const label = expanded
    ? `Collapse thread by ${authorName}, ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
    : `Expand thread by ${authorName}, ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`

  const chevronColor = isHighlighted ? 'text-accent-foreground' : 'text-muted-foreground'
  const lineColor = isHighlighted ? 'bg-accent-foreground' : 'bg-border'

  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setHovered(ancestorUri)}
      onMouseLeave={() => setHovered(null)}
      aria-expanded={expanded}
      aria-label={label}
      title={expanded ? 'Collapse thread' : 'Expand thread'}
      className="group relative shrink-0 cursor-pointer border-none bg-transparent p-0"
      style={{ width }}
    >
      {showChevron && (
        <span
          className={`absolute left-1/2 top-1 -translate-x-1/2 transition-colors ${chevronColor}`}
        >
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
          className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full transition-colors ${lineColor}`}
          style={{ opacity, top: showChevron ? '1.25rem' : 0 }}
        />
      )}
    </button>
  )
}
