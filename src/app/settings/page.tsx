/**
 * User settings page.
 * URL: /settings
 * Two scope-grouped sections: community-specific and global.
 * Client component (form state).
 * @see specs/prd-web.md Section M8 (Settings page)
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getPublicSettings } from '@/lib/api/client'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { AgeGateDialog } from '@/components/age-gate-dialog'
import { CrossPostAuthDialog } from '@/components/crosspost-auth-dialog'
import { CommunityProfileSettings } from '@/components/community-profile-settings'
import { ContentSafetySection } from '@/components/settings/content-safety-section'
import { CrossPostingSection } from '@/components/settings/cross-posting-section'
import { NotificationsSection } from '@/components/settings/notifications-section'
import { AGE_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useSettingsForm } from '@/hooks/use-settings-form'

export default function SettingsPage() {
  const [communityName, setCommunityName] = useState('')

  useEffect(() => {
    getPublicSettings()
      .then((settings) => setCommunityName(settings.communityName))
      .catch(() => {})
  }, [])

  const {
    values,
    setValues,
    loading,
    declaredAge,
    savingCommunity,
    communityError,
    communitySuccess,
    savingGlobal,
    globalError,
    globalSuccess,
    showAgeGate,
    showCrossPostAuthDialog,
    setShowCrossPostAuthDialog,
    crossPostScopesGranted,
    handleBlockUser,
    handleUnblockUser,
    handleAgeChange,
    handleSaveCommunitySettings,
    handleSaveGlobalSettings,
    handleAgeConfirm,
    handleAgeCancel,
    handleCrossPostAuthorize,
  } = useSettingsForm()

  const displayName = communityName || 'This Community'

  return (
    <ForumLayout communityName={communityName}>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Account Settings' }]} />

        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>

        {loading ? (
          <div className="max-w-2xl animate-pulse space-y-4">
            <div className="h-32 rounded-lg bg-muted" />
            <div className="h-24 rounded-lg bg-muted" />
            <div className="h-24 rounded-lg bg-muted" />
          </div>
        ) : (
          <div className="max-w-2xl space-y-12">
            {/* Section 1: Community-scoped settings */}
            <section aria-labelledby="community-settings-heading">
              <h2 id="community-settings-heading" className="text-lg font-semibold text-foreground">
                Your {displayName} Settings
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These settings only affect this community.
              </p>

              {communityError && (
                <p
                  className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {communityError}
                </p>
              )}

              {communitySuccess && (
                <p
                  className="mt-4 rounded-md bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-400"
                  role="status"
                >
                  Community settings saved successfully.
                </p>
              )}

              <div className="mt-6">
                <CommunityProfileSettings />
              </div>

              <form onSubmit={handleSaveCommunitySettings} className="mt-8 space-y-8" noValidate>
                <fieldset className="space-y-4 rounded-lg border border-border p-4">
                  <legend className="px-2 text-sm font-semibold text-foreground">
                    Age Declaration
                  </legend>

                  <div className="space-y-1">
                    <label
                      htmlFor="age-bracket"
                      className="block text-sm font-medium text-foreground"
                    >
                      Age bracket
                    </label>
                    <select
                      id="age-bracket"
                      value={declaredAge ?? ''}
                      onChange={(e) => handleAgeChange(Number(e.target.value))}
                      className={cn(
                        'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                      )}
                    >
                      <option value="" disabled>
                        Select your age bracket
                      </option>
                      {AGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Your age bracket determines which content is available. Selecting &quot;Rather
                      not say&quot; restricts you to safe content only.
                    </p>
                  </div>
                </fieldset>

                <CrossPostingSection
                  authorized={crossPostScopesGranted}
                  crossPostBluesky={values.crossPostBluesky}
                  crossPostFrontpage={values.crossPostFrontpage}
                  onBlueskyChange={(v) => setValues({ ...values, crossPostBluesky: v })}
                  onFrontpageChange={(v) => setValues({ ...values, crossPostFrontpage: v })}
                  onAuthorize={() => setShowCrossPostAuthDialog(true)}
                />

                <NotificationsSection
                  notifyReplies={values.notifyReplies}
                  notifyMentions={values.notifyMentions}
                  notifyReactions={values.notifyReactions}
                  onRepliesChange={(v) => setValues({ ...values, notifyReplies: v })}
                  onMentionsChange={(v) => setValues({ ...values, notifyMentions: v })}
                  onReactionsChange={(v) => setValues({ ...values, notifyReactions: v })}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingCommunity}
                    className={cn(
                      'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors',
                      'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  >
                    {savingCommunity ? 'Saving...' : 'Save Community Settings'}
                  </button>
                </div>
              </form>
            </section>

            {/* Visual separator */}
            <div className="border-t border-border" />

            {/* Section 2: Global settings */}
            <section aria-labelledby="global-settings-heading">
              <h2 id="global-settings-heading" className="text-lg font-semibold text-foreground">
                Your Settings Across All Barazo Forums
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {displayName} is built with{' '}
                <a
                  href="https://barazo.forum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-primary-hover"
                >
                  Barazo
                </a>
                , forum software built on the{' '}
                <a
                  href="https://atproto.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-primary-hover"
                >
                  AT Protocol
                </a>
                , allowing you to use the same identity and login across all Barazo forums. The
                settings below apply everywhere.
              </p>

              {globalError && (
                <p
                  className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {globalError}
                </p>
              )}

              {globalSuccess && (
                <p
                  className="mt-4 rounded-md bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-400"
                  role="status"
                >
                  Global settings saved successfully.
                </p>
              )}

              <form onSubmit={handleSaveGlobalSettings} className="mt-6 space-y-8" noValidate>
                <ContentSafetySection
                  maturityLevel={values.maturityLevel}
                  mutedWords={values.mutedWords}
                  blockedUsers={values.blockedUsers}
                  onMaturityChange={(level) => setValues({ ...values, maturityLevel: level })}
                  onMutedWordsChange={(words) => setValues({ ...values, mutedWords: words })}
                  onBlockUser={handleBlockUser}
                  onUnblockUser={handleUnblockUser}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingGlobal}
                    className={cn(
                      'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors',
                      'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  >
                    {savingGlobal ? 'Saving...' : 'Save Global Settings'}
                  </button>
                </div>
              </form>
            </section>

            {/* Reports link below both sections */}
            <div className="rounded-lg border border-border p-4">
              <Link
                href="/settings/reports"
                className={cn(
                  'text-sm font-medium text-primary transition-colors',
                  'hover:text-primary-hover underline underline-offset-4',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
              >
                View my reports and appeals
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                Track the status of reports you have submitted and appeal dismissed reports.
              </p>
            </div>
          </div>
        )}
      </div>

      <CrossPostAuthDialog
        open={showCrossPostAuthDialog}
        onAuthorize={handleCrossPostAuthorize}
        onCancel={() => setShowCrossPostAuthDialog(false)}
      />

      <AgeGateDialog open={showAgeGate} onConfirm={handleAgeConfirm} onCancel={handleAgeCancel} />
    </ForumLayout>
  )
}
