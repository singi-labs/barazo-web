/**
 * Error reporting utility.
 * Logs errors with structured context. When GlitchTip/@sentry/nextjs is
 * installed, add `import * as Sentry from '@sentry/nextjs'` and call
 * `Sentry.captureException(error, { tags: context })` here.
 */

interface ErrorContext {
  /** Which boundary caught the error (e.g. 'root', 'admin', 'thread') */
  boundary: string
  /** Additional metadata */
  [key: string]: string
}

export function reportError(error: Error, context: ErrorContext): void {
  console.error('[Barazo]', context.boundary, error.message, context)

  // TODO: Add GlitchTip/Sentry integration when @sentry/nextjs is installed.
  // See .env.example NEXT_PUBLIC_SENTRY_DSN.
}
