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
    const trimmed = handle.trim()
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
      setError(err instanceof Error ? err.message : 'Failed to start login')
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

        <p className="text-center text-sm text-muted-foreground">
          Don&rsquo;t have an account?{' '}
          <a
            href="https://bsky.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline decoration-primary/50 hover:text-primary-hover hover:decoration-primary"
          >
            Create one on Bluesky
          </a>
        </p>
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
