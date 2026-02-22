/**
 * Profile error boundary -- catches errors loading user profiles.
 * Common triggers: user not found, profile loading failure, PDS unreachable.
 * Next.js requires a default export for error boundaries.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WarningCircle, ArrowClockwise, House } from '@phosphor-icons/react'
import { reportError } from '@/lib/error-reporting'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname()

  useEffect(() => {
    reportError(error, { boundary: 'profile', path: pathname })
  }, [error, pathname])

  const message =
    process.env.NODE_ENV === 'development'
      ? error.message
      : 'This profile could not be loaded. The user may not exist or their identity server may be unavailable.'

  return (
    <>
      <title>Error | Barazo</title>
      <div className="flex min-h-[40vh] items-center justify-center bg-background px-4">
        <div role="alert" aria-live="assertive" className="w-full max-w-md text-center">
          <WarningCircle size={48} className="mx-auto mb-4 text-destructive" aria-hidden="true" />
          <h1 className="mb-2 text-xl font-bold text-foreground">Could not load profile</h1>
          <p className="mb-6 text-sm text-muted-foreground">{message}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowClockwise size={16} aria-hidden="true" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <House size={16} aria-hidden="true" />
              Return to forum
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
