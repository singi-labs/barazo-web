/**
 * TopicCrossPostSection - Cross-posting options for topic creation.
 * Shows authorized checkboxes or authorization prompt.
 * @see specs/prd-web.md Section 4 (Editor Components)
 */

import { cn } from '@/lib/utils'

interface TopicCrossPostSectionProps {
  crossPostScopesGranted: boolean
  crossPostBluesky: boolean
  crossPostFrontpage: boolean
  onCrossPostBlueskyChange: (checked: boolean) => void
  onCrossPostFrontpageChange: (checked: boolean) => void
  onAuthorizeClick: () => void
}

export function TopicCrossPostSection({
  crossPostScopesGranted,
  crossPostBluesky,
  crossPostFrontpage,
  onCrossPostBlueskyChange,
  onCrossPostFrontpageChange,
  onAuthorizeClick,
}: TopicCrossPostSectionProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-foreground">Cross-post</legend>
      {crossPostScopesGranted ? (
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={crossPostBluesky}
              onChange={(e) => onCrossPostBlueskyChange(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-sm text-foreground">Share on Bluesky</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={crossPostFrontpage}
              onChange={(e) => onCrossPostFrontpageChange(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-sm text-foreground">Share on Frontpage</span>
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Cross-posting requires additional permissions.
          </p>
          <button
            type="button"
            onClick={onAuthorizeClick}
            className={cn(
              'text-sm font-medium text-primary transition-colors',
              'hover:text-primary-hover underline underline-offset-4',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            Authorize cross-posting
          </button>
        </div>
      )}
    </fieldset>
  )
}
