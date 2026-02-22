/**
 * Admin error boundary -- catches errors within admin routes.
 * Logs the failing admin page for debugging context.
 * Next.js requires a default export for error boundaries.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WarningCircle, ArrowClockwise, ChartBar } from '@phosphor-icons/react'
import { reportError } from '@/lib/error-reporting'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname()

  useEffect(() => {
    reportError(error, { boundary: 'admin', page: pathname })
  }, [error, pathname])

  const message =
    process.env.NODE_ENV === 'development'
      ? error.message
      : 'Something went wrong in the admin panel.'

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div role="alert" aria-live="assertive" className="w-full max-w-md text-center">
        <WarningCircle size={48} className="mx-auto mb-4 text-destructive" aria-hidden="true" />
        <h1 className="mb-2 text-xl font-bold text-foreground">Admin error</h1>
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
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <ChartBar size={16} aria-hidden="true" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
