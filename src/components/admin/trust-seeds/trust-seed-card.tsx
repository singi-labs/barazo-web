/**
 * TrustSeedCard - Card display for a single trust seed with remove control.
 * @see specs/prd-web.md Section P2.10
 */

import { cn } from '@/lib/utils'
import { formatDateShort } from '@/lib/format'
import type { TrustSeed } from '@/lib/api/types'

function TypeBadge({ implicit }: { implicit: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
        implicit ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
      )}
    >
      {implicit ? 'Automatic' : 'Manual'}
    </span>
  )
}

interface TrustSeedCardProps {
  seed: TrustSeed
  onRemove: (seed: TrustSeed) => void
}

export function TrustSeedCard({ seed, onRemove }: TrustSeedCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{seed.handle}</span>
            <TypeBadge implicit={seed.implicit} />
            {seed.communityId ? (
              <span className="text-xs text-muted-foreground">Scoped</span>
            ) : (
              <span className="text-xs text-muted-foreground">Global</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {seed.displayName}
            {seed.reason && <> &middot; {seed.reason}</>}
            {' &middot; Added '}
            {formatDateShort(seed.createdAt)}
          </p>
        </div>
        {!seed.implicit && (
          <button
            type="button"
            onClick={() => onRemove(seed)}
            aria-label="Remove"
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            Remove
          </button>
        )}
      </div>
    </article>
  )
}
