/**
 * ThreadLine - Clickable vertical line for collapsing thread branches.
 * Visual width: 2px. Tap target: 44px minimum for accessibility.
 */

interface ThreadLineProps {
  expanded: boolean
  onToggle: () => void
  authorName: string
}

export function ThreadLine({ expanded, onToggle, authorName }: ThreadLineProps) {
  const label = expanded ? `Collapse thread by ${authorName}` : `Expand thread by ${authorName}`

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={label}
      title={expanded ? 'Collapse this thread' : 'Expand this thread'}
      className="group relative min-w-[44px] shrink-0 cursor-pointer border-none bg-transparent p-0"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-border transition-colors group-hover:bg-accent-foreground"
      />
    </button>
  )
}
