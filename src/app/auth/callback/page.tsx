/**
 * OAuth callback page -- completes auth after API redirect.
 * URL: /auth/callback?success=true (redirected from API after PDS OAuth)
 * On success: refreshes session via cookie, stores token in memory, redirects to returnTo or /.
 * On failure: shows error with retry link.
 * @see specs/prd-web.md Section M3 (Auth Flow)
 */

'use client'

import { Suspense, useEffect, useMemo, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { refreshSession } from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'

function CallbackContent() {
  const searchParams = useSearchParams()
  const { setSessionFromCallback } = useAuth()
  const processedRef = useRef(false)

  const success = searchParams.get('success')
  const errorParam = searchParams.get('error')

  // Derive missing-params error synchronously (not in effect)
  const missingParamsError = useMemo(() => {
    if (errorParam) return errorParam
    if (success) return null
    return 'Missing authorization parameters'
  }, [errorParam, success])

  const [error, setError] = useState<string | null>(missingParamsError)

  useEffect(() => {
    if (missingParamsError || processedRef.current) return
    processedRef.current = true

    async function processCallback() {
      try {
        // API already set the HTTP-only refresh cookie during redirect.
        // Call refresh to get the access token from the cookie.
        const session = await refreshSession()
        setSessionFromCallback(session)

        const returnTo = sessionStorage.getItem('auth_returnTo') ?? '/'
        sessionStorage.removeItem('auth_returnTo')
        window.location.href = returnTo
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    void processCallback()
  }, [missingParamsError, setSessionFromCallback])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Login failed</h1>
          <p
            className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
          <Link
            href="/login"
            className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Try again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Completing login...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Completing login...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
