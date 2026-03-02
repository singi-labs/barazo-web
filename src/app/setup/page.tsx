'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { getSetupStatus, initializeCommunity } from '@/lib/api/client'

export default function SetupPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, getAccessToken } = useAuth()

  const [communityName, setCommunityName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkStatus() {
      try {
        const status = await getSetupStatus()
        if (status.initialized) {
          router.replace('/')
          return
        }
      } catch {
        // Community not initialized -- continue showing form
      } finally {
        setLoading(false)
      }
    }
    void checkStatus()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const token = getAccessToken()
    if (!token) {
      setError('Not authenticated')
      setSubmitting(false)
      return
    }

    try {
      await initializeCommunity({ communityName: communityName.trim() || undefined }, token)
      router.replace('/')
    } catch {
      setError('Failed to initialize community. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="mx-auto h-8 w-48 rounded bg-muted" />
          <div className="mx-auto h-4 w-64 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Community setup</h1>
          <p className="text-muted-foreground">
            This community hasn&apos;t been set up yet. Log in to initialize it.
          </p>
          <a
            href={`/login?returnTo=${encodeURIComponent('/setup')}`}
            className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Log in
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Set up your community</h1>
          <p className="text-muted-foreground">You&apos;ll become the admin of this community.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="community-name" className="text-sm font-medium">
            Community name
          </label>
          <input
            id="community-name"
            type="text"
            value={communityName}
            onChange={(e) => setCommunityName(e.target.value)}
            placeholder="My Community"
            maxLength={255}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Optional. Defaults to &quot;Barazo Community&quot; if left empty.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? 'Initializing...' : 'Initialize community'}
        </button>
      </form>
    </div>
  )
}
