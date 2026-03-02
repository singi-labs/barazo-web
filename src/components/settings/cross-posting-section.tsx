/**
 * CrossPostingSection - Cross-posting authorization and toggle controls.
 * @see specs/prd-web.md Section M8
 */

'use client'

import { cn } from '@/lib/utils'

interface CrossPostingSectionProps {
  authorized: boolean
  crossPostBluesky: boolean
  crossPostFrontpage: boolean
  onBlueskyChange: (enabled: boolean) => void
  onFrontpageChange: (enabled: boolean) => void
  onAuthorize: () => void
}

export function CrossPostingSection({
  authorized,
  crossPostBluesky,
  crossPostFrontpage,
  onBlueskyChange,
  onFrontpageChange,
  onAuthorize,
}: CrossPostingSectionProps) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-semibold text-foreground">Cross-posting</legend>
      {authorized ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Cross-posting authorized. You can share topics on Bluesky and Frontpage.
          </p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={crossPostBluesky}
              onChange={(e) => onBlueskyChange(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-sm text-foreground">Share new topics on Bluesky by default</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={crossPostFrontpage}
              onChange={(e) => onFrontpageChange(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-sm text-foreground">
              Share new topics on Frontpage by default
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            To share topics on Bluesky and Frontpage, Barazo needs permission to create posts on
            your behalf.
          </p>
          <button
            type="button"
            onClick={onAuthorize}
            className={cn(
              'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors',
              'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            Authorize cross-posting
          </button>
        </div>
      )}
    </fieldset>
  )
}
