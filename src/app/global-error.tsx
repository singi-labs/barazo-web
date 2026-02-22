/**
 * Global error boundary -- last-resort fallback.
 * Catches errors in the root layout itself. Must render its own <html>/<body>
 * since the root layout is unavailable when this boundary triggers.
 * Next.js requires a default export for error boundaries.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */

'use client'

import { useEffect } from 'react'
import { reportError } from '@/lib/error-reporting'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error, { boundary: 'global' })
  }, [error])

  return (
    <html lang="en">
      <head>
        <title>Error | Barazo</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, -apple-system, sans-serif",
          backgroundColor: '#111113',
          color: '#edeef0',
        }}
      >
        <main
          style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '32rem',
          }}
        >
          <div role="alert" aria-live="assertive">
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: '#9ba1a6',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              An unexpected error occurred. Please try again.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '0.375rem',
              border: '1px solid #3a3f42',
              backgroundColor: 'transparent',
              color: '#edeef0',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
