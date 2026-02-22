/**
 * User settings page.
 * URL: /settings
 * Content safety, cross-posting defaults, notification preferences,
 * per-community overrides.
 * Client component (form state).
 * @see specs/prd-web.md Section M8 (Settings page)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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
import {
  getPreferences,
  updatePreferences,
  getCommunityPreferences,
  updateCommunityPreference,
} from '@/lib/api/client'
import type { CommunityPreferenceOverride } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

type MaturityLevel = 'sfw' | 'sfw-mature'

interface SettingsValues {
  maturityLevel: MaturityLevel
  mutedWords: string
  crossPostBluesky: boolean
  crossPostFrontpage: boolean
  notifyReplies: boolean
  notifyMentions: boolean
  notifyReactions: boolean
}

interface CommunityOverrideValues {
  communityDid: string
  communityName: string
  maturityLevel: 'inherit' | 'sfw' | 'mature'
  mutedWords: string
  blockedDids: string
}

export default function SettingsPage() {
  const { getAccessToken, crossPostScopesGranted, requestCrossPostAuth } = useAuth()
  const [showCrossPostAuthDialog, setShowCrossPostAuthDialog] = useState(false)
  const [values, setValues] = useState<SettingsValues>({
    maturityLevel: 'sfw',
    mutedWords: '',
    crossPostBluesky: true,
    crossPostFrontpage: false,
    notifyReplies: true,
    notifyMentions: true,
    notifyReactions: false,
  })
  const [communityOverrides, setCommunityOverrides] = useState<CommunityOverrideValues[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [declaredAge, setDeclaredAge] = useState<number | null>(null)
  const [showAgeGate, setShowAgeGate] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }

    Promise.all([getPreferences(token), getCommunityPreferences(token)])
      .then(([prefs, communityPrefs]) => {
        setValues({
          maturityLevel: prefs.maturityLevel === 'mature' ? 'sfw-mature' : 'sfw',
          mutedWords: prefs.mutedWords.join(', '),
          crossPostBluesky: prefs.crossPostBluesky,
          crossPostFrontpage: prefs.crossPostFrontpage,
          notifyReplies: true,
          notifyMentions: true,
          notifyReactions: false,
        })
        setDeclaredAge(prefs.declaredAge)
        setCommunityOverrides(
          communityPrefs.communities.map(
            (c: CommunityPreferenceOverride): CommunityOverrideValues => ({
              communityDid: c.communityDid,
              communityName: c.communityName,
              maturityLevel: c.maturityLevel,
              mutedWords: c.mutedWords.join(', '),
              blockedDids: c.blockedDids.join(', '),
            })
          )
        )
      })
      .catch(() => setError('Failed to load preferences'))
      .finally(() => setLoading(false))
  }, [getAccessToken])

  const handleCommunityChange = useCallback(
    (communityDid: string, field: keyof CommunityOverrideValues, value: string) => {
      setCommunityOverrides((prev) =>
        prev.map((c) => (c.communityDid === communityDid ? { ...c, [field]: value } : c))
      )
    },
    []
  )

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSaving(true)
      setError(null)
      setSuccess(false)

      const token = getAccessToken()
      if (!token) {
        setError('Not authenticated')
        setSaving(false)
        return
      }

      if (values.maturityLevel === 'sfw-mature' && !declaredAge) {
        setShowAgeGate(true)
        setSaving(false)
        return
      }

      try {
        const mutedWords = values.mutedWords
          .split(',')
          .map((w) => w.trim())
          .filter(Boolean)

        await updatePreferences(
          {
            maturityLevel: values.maturityLevel === 'sfw-mature' ? 'mature' : 'sfw',
            mutedWords,
            crossPostBluesky: values.crossPostBluesky,
            crossPostFrontpage: values.crossPostFrontpage,
          },
          token
        )

        await Promise.all(
          communityOverrides.map((c) =>
            updateCommunityPreference(
              c.communityDid,
              {
                maturityLevel: c.maturityLevel,
                mutedWords: c.mutedWords
                  .split(',')
                  .map((w) => w.trim())
                  .filter(Boolean),
                blockedDids: c.blockedDids
                  .split(',')
                  .map((d) => d.trim())
                  .filter(Boolean),
              },
              token
            )
          )
        )

        setSuccess(true)
      } catch {
        setError('Failed to save preferences')
      } finally {
        setSaving(false)
      }
    },
    [values, communityOverrides, declaredAge, getAccessToken]
  )

  return (
    <ForumLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Settings' }]} />

        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

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
              maturityLevel={values.maturityLevel}
              mutedWords={values.mutedWords}
              onMaturityChange={(level) => setValues({ ...values, maturityLevel: level })}
              onMutedWordsChange={(words) => setValues({ ...values, mutedWords: words })}
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
        onAuthorize={() => {
          setShowCrossPostAuthDialog(false)
          void requestCrossPostAuth()
        }}
        onCancel={() => setShowCrossPostAuthDialog(false)}
      />

      <AgeGateDialog
        open={showAgeGate}
        onConfirm={(age) => {
          setDeclaredAge(age)
          setShowAgeGate(false)
          void handleSave({ preventDefault: () => {} } as React.FormEvent)
        }}
        onCancel={() => {
          setShowAgeGate(false)
          setValues((prev) => ({ ...prev, maturityLevel: 'sfw' }))
        }}
      />
    </ForumLayout>
  )
}
