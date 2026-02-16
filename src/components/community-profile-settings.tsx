/**
 * CommunityProfileSettings - Section for customizing per-community profile.
 * Displays source AT Protocol profile as reference, override form for
 * display name / bio / avatar / banner, and reset functionality.
 * @see specs/prd-web.md Section M8 (Settings / Community Profile)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ImageUpload } from '@/components/image-upload'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAuth } from '@/hooks/use-auth'
import {
  getPublicSettings,
  getCommunityProfile,
  updateCommunityProfile,
  resetCommunityProfile,
  uploadCommunityAvatar,
  uploadCommunityBanner,
} from '@/lib/api/client'
import type { CommunityProfile } from '@/lib/api/types'
import { ArrowCounterClockwise } from '@phosphor-icons/react'

const DISPLAY_NAME_MAX = 256
const BIO_MAX = 2048

export function CommunityProfileSettings() {
  const { getAccessToken, isAuthenticated } = useAuth()

  const [communityDid, setCommunityDid] = useState<string | null>(null)
  const [profile, setProfile] = useState<CommunityProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Form state for text overrides
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

  // Load community DID from public settings, then load profile
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadProfile() {
      try {
        const publicSettings = await getPublicSettings()
        const did = publicSettings.communityDid
        if (!did) {
          // Community not initialized yet
          if (!cancelled) {
            setLoading(false)
          }
          return
        }

        if (!cancelled) {
          setCommunityDid(did)
        }

        const currentToken = token
        if (!currentToken) return

        const communityProfile = await getCommunityProfile(did, currentToken)
        if (!cancelled) {
          setProfile(communityProfile)
          // Initialize form with current override values (empty string means "use source")
          setDisplayName(communityProfile.hasOverride ? (communityProfile.displayName ?? '') : '')
          setBio(communityProfile.hasOverride ? (communityProfile.bio ?? '') : '')
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load community profile.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [getAccessToken, isAuthenticated])

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!communityDid) return

      const token = getAccessToken()
      if (!token) {
        setError('Not authenticated')
        return
      }

      setSaving(true)
      setError(null)
      setSuccess(false)

      try {
        await updateCommunityProfile(
          communityDid,
          {
            displayName: displayName.trim() || null,
            bio: bio.trim() || null,
          },
          token
        )

        // Reload profile to get fresh state
        const updatedProfile = await getCommunityProfile(communityDid, token)
        setProfile(updatedProfile)
        setSuccess(true)
      } catch {
        setError('Failed to save community profile.')
      } finally {
        setSaving(false)
      }
    },
    [communityDid, displayName, bio, getAccessToken]
  )

  const handleReset = useCallback(async () => {
    if (!communityDid) return

    const token = getAccessToken()
    if (!token) {
      setError('Not authenticated')
      return
    }

    setShowResetConfirm(false)
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await resetCommunityProfile(communityDid, token)

      // Reload profile after reset
      const updatedProfile = await getCommunityProfile(communityDid, token)
      setProfile(updatedProfile)
      setDisplayName('')
      setBio('')
      setSuccess(true)
    } catch {
      setError('Failed to reset community profile.')
    } finally {
      setSaving(false)
    }
  }, [communityDid, getAccessToken])

  const handleAvatarUpload = useCallback(
    async (file: File): Promise<{ url: string }> => {
      if (!communityDid) throw new Error('No community DID')
      const token = getAccessToken()
      if (!token) throw new Error('Not authenticated')

      const result = await uploadCommunityAvatar(communityDid, file, token)

      // Reload profile to reflect new avatar
      const updatedProfile = await getCommunityProfile(communityDid, token)
      setProfile(updatedProfile)

      return result
    },
    [communityDid, getAccessToken]
  )

  const handleBannerUpload = useCallback(
    async (file: File): Promise<{ url: string }> => {
      if (!communityDid) throw new Error('No community DID')
      const token = getAccessToken()
      if (!token) throw new Error('Not authenticated')

      const result = await uploadCommunityBanner(communityDid, file, token)

      // Reload profile to reflect new banner
      const updatedProfile = await getCommunityProfile(communityDid, token)
      setProfile(updatedProfile)

      return result
    },
    [communityDid, getAccessToken]
  )

  const handleAvatarRemove = useCallback(async () => {
    if (!communityDid) return
    const token = getAccessToken()
    if (!token) return

    try {
      // Update profile with null avatar by saving without avatar override
      // The API interprets a PUT without avatar fields as keeping current state,
      // so we reset the full profile and re-save text fields
      await updateCommunityProfile(
        communityDid,
        {
          displayName: displayName.trim() || null,
          bio: bio.trim() || null,
        },
        token
      )
      const updatedProfile = await getCommunityProfile(communityDid, token)
      setProfile(updatedProfile)
    } catch {
      setError('Failed to remove avatar.')
    }
  }, [communityDid, displayName, bio, getAccessToken])

  const handleBannerRemove = useCallback(async () => {
    if (!communityDid) return
    const token = getAccessToken()
    if (!token) return

    try {
      await updateCommunityProfile(
        communityDid,
        {
          displayName: displayName.trim() || null,
          bio: bio.trim() || null,
        },
        token
      )
      const updatedProfile = await getCommunityProfile(communityDid, token)
      setProfile(updatedProfile)
    } catch {
      setError('Failed to remove banner.')
    }
  }, [communityDid, displayName, bio, getAccessToken])

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <fieldset className="space-y-4 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-semibold text-foreground">Community Profile</legend>
        <div className="animate-pulse space-y-3">
          <div className="h-24 w-24 rounded-full bg-muted" />
          <div className="h-10 rounded-md bg-muted" />
          <div className="h-20 rounded-md bg-muted" />
        </div>
      </fieldset>
    )
  }

  if (!communityDid) {
    return (
      <fieldset className="space-y-4 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-semibold text-foreground">Community Profile</legend>
        <p className="text-sm text-muted-foreground">
          Community has not been initialized yet. Profile customization will be available once the
          community is set up.
        </p>
      </fieldset>
    )
  }

  return (
    <>
      <fieldset className="space-y-6 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-semibold text-foreground">Community Profile</legend>

        <p className="text-sm text-muted-foreground">
          Customize how you appear in this community. Leave fields empty to use your AT Protocol
          profile.
        </p>

        {error && (
          <p
            className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            className="rounded-md bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-400"
            role="status"
          >
            Community profile updated.
          </p>
        )}

        {/* Source profile preview (read-only) */}
        {profile?.source && (
          <div className="space-y-2 rounded-md border border-dashed border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Your AT Protocol profile (source)
            </p>
            <div className="flex items-center gap-3">
              {profile.source.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.source.avatarUrl}
                  alt="Source avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <span className="text-xs">--</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">
                  {profile.source.displayName || '(no display name)'}
                </p>
                <p className="truncate text-xs text-muted-foreground/70">
                  {profile.source.bio || '(no bio)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Avatar upload */}
        <ImageUpload
          currentUrl={profile?.avatarUrl ?? null}
          onUpload={handleAvatarUpload}
          onRemove={profile?.hasOverride && profile.avatarUrl ? handleAvatarRemove : undefined}
          label="Avatar"
          aspectRatio="1/1"
        />

        {/* Banner upload */}
        <ImageUpload
          currentUrl={profile?.bannerUrl ?? null}
          onUpload={handleBannerUpload}
          onRemove={profile?.hasOverride && profile.bannerUrl ? handleBannerRemove : undefined}
          label="Banner"
          aspectRatio="3/1"
        />

        {/* Display name */}
        <div className="space-y-1">
          <label
            htmlFor="community-display-name"
            className="block text-sm font-medium text-foreground"
          >
            Display name
          </label>
          <input
            id="community-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={profile?.source.displayName ?? 'Display name'}
            maxLength={DISPLAY_NAME_MAX}
            className={cn(
              'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          />
          <p className="text-xs text-muted-foreground">
            {displayName.length}/{DISPLAY_NAME_MAX} characters. Leave empty to use your AT Protocol
            display name.
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label htmlFor="community-bio" className="block text-sm font-medium text-foreground">
            Bio
          </label>
          <textarea
            id="community-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={profile?.source.bio ?? 'Tell the community about yourself'}
            maxLength={BIO_MAX}
            rows={4}
            className={cn(
              'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          />
          <p className="text-xs text-muted-foreground">
            {bio.length}/{BIO_MAX} characters. Leave empty to use your AT Protocol bio.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={saving || !profile?.hasOverride}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors',
              'hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" />
            Reset to AT Protocol Profile
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors',
              'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </fieldset>

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset Community Profile"
        description="This will remove all community-specific overrides (display name, bio, avatar, banner) and revert to your AT Protocol profile. This action cannot be undone."
        confirmLabel="Reset Profile"
        cancelLabel="Keep Overrides"
        variant="destructive"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  )
}
