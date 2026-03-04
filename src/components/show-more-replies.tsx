/**
 * ShowMoreReplies - Button to reveal auto-collapsed sibling replies.
 * Used when 5+ siblings exist at depth 2+ and only the first 3 are shown.
 */

interface ShowMoreRepliesProps {
  count: number
  onShow: () => void
}

export function ShowMoreReplies({ count, onShow }: ShowMoreRepliesProps) {
  return (
    <div aria-live="polite">
      <button
        type="button"
        onClick={onShow}
        className="mt-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Show {count} more {count === 1 ? 'reply' : 'replies'}
      </button>
    </div>
  )
}
