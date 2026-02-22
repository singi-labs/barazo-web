/**
 * Auth error boundary -- catches OAuth and authentication flow errors.
 * Common triggers: expired tokens, revoked access, PDS unavailable.
 * Next.js requires a default export for error boundaries.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { WarningCircle, ArrowClockwise, SignIn } from '@phosphor-icons/react'
import { reportError } from '@/lib/error-reporting'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error, { boundary: 'auth' })
  }, [error])

  const message =
    process.env.NODE_ENV === 'development'
      ? error.message
      : 'There was a problem with authentication. This can happen when a session expires or the identity provider is unavailable.'

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div role="alert" aria-live="assertive" className="w-full max-w-md text-center">
        <WarningCircle size={48} className="mx-auto mb-4 text-destructive" aria-hidden="true" />
        <h1 className="mb-2 text-xl font-bold text-foreground">Authentication error</h1>
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
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <SignIn size={16} aria-hidden="true" />
            Log in again
          </Link>
        </div>
      </div>
    </div>
  )
}
