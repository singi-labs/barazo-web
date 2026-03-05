/**
 * Edit Profile page -- per-community profile overrides.
 * URL: /u/[handle]/edit
 * Auth-gated. Only accessible for own profile.
 * @see specs/prd-web.md Section M8
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getPublicSettings } from '@/lib/api/client'
import type { PublicSettings } from '@/lib/api/types'
import { ArrowCounterClockwise } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { useAuth } from '@/hooks/use-auth'
import { useCommunityProfile } from '@/hooks/use-community-profile'

const DISPLAY_NAME_MAX = 256
const BIO_MAX = 2048

interface EditProfilePageProps {
  params: Promise<{ handle: string }> | { handle: string }
}

export function EditProfilePage({ params }: EditProfilePageProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    profile,
    loading,
    saving,
    error,
    success,
    displayName,
    bio,
    setDisplayName,
    setBio,
    handleSave,
  } = useCommunityProfile()

  const [publicSettings, setPublicSettings] = useState<PublicSettings | null>(null)
  const [handle, setHandle] = useState<string | null>(null)

  // Resolve Next.js async params
  useEffect(() => {
    async function resolveParams() {
      const resolved = params instanceof Promise ? await params : params
      setHandle(resolved.handle)
    }
    void resolveParams()
  }, [params])

  useEffect(() => {
    getPublicSettings()
      .then((settings) => setPublicSettings(settings))
      .catch(() => {})
  }, [])

  // Auth gate: redirect unauthenticated users
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || !user) {
      router.replace('/')
    }
  }, [authLoading, isAuthenticated, user, router])

  // Own-profile gate: redirect if viewing someone else's profile
  useEffect(() => {
    if (!handle || !user) return
    if (user.handle !== handle) {
      router.replace(`/profile/${handle}`)
    }
  }, [handle, user, router])

  // Don't render until we know the user is authenticated and it's their profile
  if (authLoading || !user || !handle) {
    return (
      <ForumLayout publicSettings={publicSettings}>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </ForumLayout>
    )
  }

  if (user.handle !== handle) {
    return null
  }

  if (loading) {
    return (
      <ForumLayout publicSettings={publicSettings}>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </ForumLayout>
    )
  }

  if (error) {
    return (
      <ForumLayout publicSettings={publicSettings}>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </ForumLayout>
    )
  }

  const hasOverride = profile?.hasOverride ?? false
  const sourceDisplayName = profile?.source.displayName ?? ''
  const sourceBio = profile?.source.bio ?? ''

  const displayNameOverridden = hasOverride && displayName.trim() !== ''
  const bioOverridden = hasOverride && bio.trim() !== ''

  const inputClasses = cn(
    'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  )

  return (
    <ForumLayout publicSettings={publicSettings}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: handle, href: `/profile/${handle}` },
            { label: 'Edit profile' },
          ]}
        />

        <h1 className="text-2xl font-bold text-foreground">Edit profile</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Display name */}
          <div className="space-y-1">
            <label
              htmlFor="edit-display-name"
              className="block text-sm font-medium text-foreground"
            >
              Display name
            </label>
            <input
              id="edit-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={sourceDisplayName || 'Display name'}
              maxLength={DISPLAY_NAME_MAX}
              className={inputClasses}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {displayNameOverridden ? 'Custom for this community' : 'Synced from AT Protocol'}
              </p>
              {displayNameOverridden && (
                <button
                  type="button"
                  onClick={() => setDisplayName('')}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowCounterClockwise size={12} aria-hidden="true" />
                  Reset to AT Protocol
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label htmlFor="edit-bio" className="block text-sm font-medium text-foreground">
              Bio
            </label>
            <textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={sourceBio || 'Tell the community about yourself'}
              maxLength={BIO_MAX}
              rows={4}
              className={inputClasses}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {bioOverridden ? 'Custom for this community' : 'Synced from AT Protocol'}
              </p>
              {bioOverridden && (
                <button
                  type="button"
                  onClick={() => setBio('')}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowCounterClockwise size={12} aria-hidden="true" />
                  Reset to AT Protocol
                </button>
              )}
            </div>
          </div>

          {/* Success message */}
          {success && <p className="text-sm text-green-600">Profile updated.</p>}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <Link
              href={`/profile/${handle}`}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </ForumLayout>
  )
}

export default EditProfilePage
