/**
 * SourceProfilePreview - Read-only display of the user's AT Protocol source profile.
 * @see specs/prd-web.md Section M8 (Settings / Community Profile)
 */

interface SourceProfilePreviewProps {
  avatarUrl?: string | null
  displayName?: string | null
  bio?: string | null
}

export function SourceProfilePreview({ avatarUrl, displayName, bio }: SourceProfilePreviewProps) {
  return (
    <div className="space-y-2 rounded-md border border-dashed border-border bg-muted/30 p-3">
      <p className="text-xs font-medium text-muted-foreground">Your AT Protocol profile (source)</p>
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Source avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <span className="text-xs">--</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">
            {displayName || '(no display name)'}
          </p>
          <p className="truncate text-xs text-muted-foreground/70">{bio || '(no bio)'}</p>
        </div>
      </div>
    </div>
  )
}
