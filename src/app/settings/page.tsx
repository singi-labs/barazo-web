/**
 * User settings page.
 * URL: /settings
 * Content safety, cross-posting defaults, notification preferences,
 * per-community overrides.
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
import { CommunityOverridesSection } from '@/components/settings/community-overrides-section'
import { CrossPostingSection } from '@/components/settings/cross-posting-section'
import { NotificationsSection } from '@/components/settings/notifications-section'
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
    communityOverrides,
    saving,
    loading,
    error,
    success,
    showAgeGate,
    showCrossPostAuthDialog,
    setShowCrossPostAuthDialog,
    crossPostScopesGranted,
    handleCommunityChange,
    handleSave,
    handleAgeConfirm,
    handleAgeCancel,
    handleCrossPostAuthorize,
  } = useSettingsForm()

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
          <form onSubmit={handleSave} className="max-w-2xl space-y-8" noValidate>
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
                Settings saved successfully.
              </p>
            )}

            <CommunityProfileSettings />

            <ContentSafetySection
              communityName={communityName}
              maturityLevel={values.maturityLevel}
              mutedWords={values.mutedWords}
              blockedDids={values.blockedDids}
              onMaturityChange={(level) => setValues({ ...values, maturityLevel: level })}
              onMutedWordsChange={(words) => setValues({ ...values, mutedWords: words })}
              onBlockedDidsChange={(dids) => setValues({ ...values, blockedDids: dids })}
            />

            <CommunityOverridesSection
              overrides={communityOverrides}
              onChange={handleCommunityChange}
            />

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

            {/* My Reports link */}
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className={cn(
                  'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors',
                  'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
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
