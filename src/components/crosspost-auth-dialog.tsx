'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface CrossPostAuthDialogProps {
  open: boolean
  onAuthorize: () => void
  onCancel: () => void
}

export function CrossPostAuthDialog({ open, onAuthorize, onCancel }: CrossPostAuthDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
      cancelRef.current?.focus()
    } else {
      dialog.close()
    }
  }, [open])

  if (!open) return null

  return (
    // Native <dialog> handles Escape key via onClose; no extra keyboard handler needed.
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      aria-labelledby="crosspost-auth-title"
      aria-describedby="crosspost-auth-description"
      className={cn(
        'm-auto w-full max-w-md rounded-lg border border-border bg-background p-0 shadow-lg',
        'backdrop:bg-black/50'
      )}
    >
      <div className="space-y-4 p-6">
        <h2 id="crosspost-auth-title" className="text-lg font-semibold text-foreground">
          Cross-posting permissions
        </h2>

        <p id="crosspost-auth-description" className="text-sm text-muted-foreground">
          To share topics on Bluesky and Frontpage, Barazo needs permission to create posts on your
          behalf. You will be redirected to your AT Protocol identity provider to approve these
          permissions.
        </p>

        <ul className="space-y-1 text-sm text-foreground" aria-label="Requested permissions">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-muted-foreground" aria-hidden="true">
              -
            </span>
            <span>
              Create posts on Bluesky (<code className="text-xs">app.bsky.feed.post</code>)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-muted-foreground" aria-hidden="true">
              -
            </span>
            <span>
              Create posts on Frontpage (<code className="text-xs">fyi.frontpage.post</code>)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-muted-foreground" aria-hidden="true">
              -
            </span>
            <span>Upload images for post thumbnails</span>
          </li>
        </ul>

        <p className="text-xs text-muted-foreground">
          Barazo will only use these permissions when you explicitly choose to cross-post a topic.
          You can revoke access at any time from your identity provider.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className={cn(
              'rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors',
              'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAuthorize}
            className={cn(
              'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors',
              'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            Authorize
          </button>
        </div>
      </div>
    </dialog>
  )
}
