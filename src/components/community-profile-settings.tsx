/**
 * CommunityProfileSettings - Per-community profile customization section.
 * @see specs/prd-web.md Section M8 (Settings / Community Profile)
 */

'use client'

import { cn } from '@/lib/utils'
import { ImageUpload } from '@/components/image-upload'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { SourceProfilePreview } from '@/components/source-profile-preview'
import { CommunityProfileFormFields } from '@/components/community-profile-form-fields'
import { useAuth } from '@/hooks/use-auth'
import { useCommunityProfile } from '@/hooks/use-community-profile'
import { ArrowCounterClockwise } from '@phosphor-icons/react'

export function CommunityProfileSettings() {
  const { isAuthenticated } = useAuth()
  const {
    communityDid,
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
    handleReset,
    handleAvatarUpload,
    handleBannerUpload,
    handleAvatarRemove,
    handleBannerRemove,
    showResetConfirm,
    setShowResetConfirm,
  } = useCommunityProfile()

  if (!isAuthenticated) return null

  if (loading || !communityDid) {
    return (
      <fieldset className="space-y-4 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-semibold text-foreground">Community Profile</legend>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-24 w-24 rounded-full bg-muted" />
            <div className="h-10 rounded-md bg-muted" />
            <div className="h-20 rounded-md bg-muted" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Community has not been initialized yet. Profile customization will be available once the
            community is set up.
          </p>
        )}
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

        {profile?.source && (
          <SourceProfilePreview
            avatarUrl={profile.source.avatarUrl}
            displayName={profile.source.displayName}
            bio={profile.source.bio}
          />
        )}

        <ImageUpload
          currentUrl={profile?.avatarUrl ?? null}
          onUpload={handleAvatarUpload}
          onRemove={profile?.hasOverride && profile.avatarUrl ? handleAvatarRemove : undefined}
          label="Avatar"
          aspectRatio="1/1"
        />

        <ImageUpload
          currentUrl={profile?.bannerUrl ?? null}
          onUpload={handleBannerUpload}
          onRemove={profile?.hasOverride && profile.bannerUrl ? handleBannerRemove : undefined}
          label="Banner"
          aspectRatio="3/1"
        />

        <CommunityProfileFormFields
          displayName={displayName}
          bio={bio}
          placeholderDisplayName={profile?.source.displayName ?? undefined}
          placeholderBio={profile?.source.bio ?? undefined}
          onDisplayNameChange={setDisplayName}
          onBioChange={setBio}
        />

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
