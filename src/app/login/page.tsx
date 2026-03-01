/**
 * Login page -- AT Protocol OAuth via handle input.
 * URL: /login?returnTo=/some/path
 * Redirects to PDS OAuth flow on submit.
 * @see specs/prd-web.md Section M3 (Auth Flow)
 */

'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

function LoginContent() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/'

  const [handle, setHandle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      window.location.href = returnTo
    }
  }, [isAuthenticated, isLoading, returnTo])

  if (isAuthenticated && !isLoading) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = handle
      .trim()
      .replace(/^https?:\/\/bsky\.app\/profile\//i, '')
      .replace(/^@/, '')
      .replace(/\.$/, '')
      .toLowerCase()
    if (!trimmed) {
      setError('Please enter your handle')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      // Store returnTo so callback can redirect back
      sessionStorage.setItem('auth_returnTo', returnTo)
      await login(trimmed)
    } catch (err) {
      if (err instanceof ApiError && err.status === 502) {
        setError(
          `We couldn't find an account for "${trimmed}". Please check for typos and try again.`
        )
      } else {
        setError(err instanceof Error ? err.message : 'Failed to start login')
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/">
            <Image
              src="/barazo-logo-light.svg"
              alt="Barazo"
              width={160}
              height={42}
              className="h-10 dark:hidden"
              style={{ width: 'auto' }}
              priority
            />
            <Image
              src="/barazo-logo-dark.svg"
              alt="Barazo"
              width={160}
              height={42}
              className="hidden h-10 dark:block"
              style={{ width: 'auto' }}
              priority
            />
          </Link>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">Log in</h1>
          <p className="text-sm text-muted-foreground">Sign in with your AT Protocol identity</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
          {error && (
            <p
              className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="handle" className="block text-sm font-medium text-foreground">
              Handle
            </label>
            <input
              id="handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="alice.bsky.social"
              autoComplete="username"
              disabled={submitting}
              className={cn(
                'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
            <p className="text-xs text-muted-foreground">
              Your Bluesky or AT Protocol handle (e.g. alice.bsky.social)
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className={cn(
              'w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors',
              'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {submitting ? 'Redirecting...' : 'Continue'}
          </button>
        </form>

        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Don&rsquo;t have an account? Create one at
          </p>
          <div className="flex items-center justify-center gap-3 text-sm">
            <a
              href="https://bsky.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary underline decoration-primary/50 hover:text-primary-hover hover:decoration-primary"
            >
              <svg
                viewBox="0 0 568 501"
                className="h-3.5 w-3.5 shrink-0"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M123.121 33.664C188.241 82.553 258.281 181.681 284 234.873c25.719-53.192 95.759-152.32 160.879-201.209C491.866-1.612 568-28.906 568 57.947c0 17.345-9.945 131.876-14.624 151.903C537.322 275.855 478.267 293.601 425.672 282.587c-78.544-17.106-101.047 21.172-101.047 21.172s0 37.277 81.625 20.452c78-17.451 106.625 30.5 106.625 30.5s-61.25 111.25-173.625 67.375C298.125 406.711 284 364.711 284 334.211s-14.125 72.5-55.25 87.875c-112.375 43.875-173.625-67.375-173.625-67.375s28.625-47.951 106.625-30.5c81.625 16.825 81.625-20.452 81.625-20.452s-22.503-38.278-101.047-21.172c-52.595 11.014-111.65-6.732-127.704-72.738C9.945 189.823 0 75.292 0 57.947 0-28.906 76.134-1.612 123.121 33.664Z" />
              </svg>
              Bluesky
            </a>
            <span className="text-muted-foreground/50" aria-hidden="true">
              &middot;
            </span>
            <a
              href="https://blacksky.community"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline decoration-primary/50 hover:text-primary-hover hover:decoration-primary"
            >
              Blacksky
            </a>
            <span className="text-muted-foreground/50" aria-hidden="true">
              &middot;
            </span>
            <a
              href="https://www.eurosky.tech/register"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline decoration-primary/50 hover:text-primary-hover hover:decoration-primary"
            >
              Eurosky
            </a>
          </div>
          <p className="text-xs text-muted-foreground">or any other AT Protocol PDS host</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
