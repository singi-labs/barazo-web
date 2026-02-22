/**
 * Root error boundary -- catch-all for all routes.
 * Catches unhandled errors from any page that doesn't have its own error.tsx.
 * Reports to GlitchTip when available, falls back to console logging.
 * Next.js requires a default export for error boundaries.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { WarningCircle, ArrowClockwise, House } from '@phosphor-icons/react'
import { reportError } from '@/lib/error-reporting'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error, { boundary: 'root' })
  }, [error])

  const message =
    process.env.NODE_ENV === 'development'
      ? error.message
      : 'An unexpected error occurred. Please try again.'

  return (
    <>
      <title>Error | Barazo</title>
      <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
        <main className="w-full max-w-md text-center">
          <div role="alert" aria-live="assertive">
            <WarningCircle size={48} className="mx-auto mb-4 text-destructive" aria-hidden="true" />
            <h1 className="mb-2 text-xl font-bold text-foreground">Something went wrong</h1>
            <p className="mb-6 text-sm text-muted-foreground">{message}</p>
          </div>
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
              Go home
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
