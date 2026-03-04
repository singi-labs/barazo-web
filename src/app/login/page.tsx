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
              name="handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="jay.bsky.team"
              autoComplete="username"
              disabled={submitting}
              className={cn(
                'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
            <p className="text-xs text-muted-foreground">
              Your Bluesky or AT Protocol handle (e.g. jay.bsky.team)
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
              className="inline-flex items-center gap-1.5 text-primary underline decoration-primary/50 hover:text-primary-hover hover:decoration-primary"
            >
              <svg
                viewBox="0 0 285 243"
                className="h-3.5 w-3.5 shrink-0"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M148.846 144.562C148.846 159.75 161.158 172.062 176.346 172.062H207.012V185.865H176.346C161.158 185.865 148.846 198.177 148.846 213.365V243.045H136.029V213.365C136.029 198.177 123.717 185.865 108.529 185.865H77.8633V172.062H108.529C123.717 172.062 136.029 159.75 136.029 144.562V113.896H148.846V144.562Z" />
                <path d="M170.946 31.8766C160.207 42.616 160.207 60.0281 170.946 70.7675L192.631 92.4516L182.871 102.212L161.186 80.5275C150.447 69.7881 133.035 69.7881 122.296 80.5275L101.309 101.514L92.2456 92.4509L113.232 71.4642C123.972 60.7248 123.972 43.3128 113.232 32.5733L91.5488 10.8899L101.309 1.12988L122.993 22.814C133.732 33.5533 151.144 33.5534 161.884 22.814L183.568 1.12988L192.631 10.1925L170.946 31.8766Z" />
                <path d="M79.0525 75.3259C75.1216 89.9962 83.8276 105.076 98.498 109.006L128.119 116.943L124.547 130.275L94.9267 122.338C80.2564 118.407 65.1772 127.113 61.2463 141.784L53.5643 170.453L41.1837 167.136L48.8654 138.467C52.7963 123.797 44.0902 108.718 29.4199 104.787L-0.201172 96.8497L3.37124 83.5173L32.9923 91.4542C47.6626 95.3851 62.7419 86.679 66.6728 72.0088L74.6098 42.3877L86.9895 45.7048L79.0525 75.3259Z" />
                <path d="M218.413 71.4229C222.344 86.093 237.423 94.7992 252.094 90.8683L281.715 82.9313L285.287 96.2628L255.666 104.2C240.995 108.131 232.29 123.21 236.22 137.88L243.902 166.55L231.522 169.867L223.841 141.198C219.91 126.528 204.831 117.822 190.16 121.753L160.539 129.69L156.967 116.357L186.588 108.42C201.258 104.49 209.964 89.4103 206.033 74.74L198.096 45.1189L210.476 41.8018L218.413 71.4229Z" />
              </svg>
              Blacksky
            </a>
            <span className="text-muted-foreground/50" aria-hidden="true">
              &middot;
            </span>
            <a
              href="https://www.eurosky.tech/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary underline decoration-primary/50 hover:text-primary-hover hover:decoration-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/eurosky-logo.png"
                alt=""
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
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
