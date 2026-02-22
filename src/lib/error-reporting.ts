/**
 * Error reporting utility.
 * Logs errors with structured context. Integrates with GlitchTip/@sentry/nextjs
 * when available (see .env.example NEXT_PUBLIC_SENTRY_DSN).
 */

interface ErrorContext {
  /** Which boundary caught the error (e.g. 'root', 'admin', 'thread') */
  boundary: string
  /** Additional metadata */
  [key: string]: string
}

export function reportError(error: Error, context: ErrorContext): void {
  // Structured console logging (always, even when Sentry is available)
  console.error('[Barazo]', context.boundary, error.message, context)

  // Attempt GlitchTip/Sentry reporting via dynamic import.
  // The module specifier is constructed at runtime to prevent Vite from
  // statically analyzing and failing when @sentry/nextjs is not installed.
  const sentryPkg = ['@sentry', 'nextjs'].join('/')
  import(/* @vite-ignore */ sentryPkg)
    .then((sentry: { captureException?: (error: Error, context?: unknown) => void }) => {
      sentry.captureException?.(error, { tags: context })
    })
    .catch(() => {
      // @sentry/nextjs not installed -- already logged to console above
    })
}
