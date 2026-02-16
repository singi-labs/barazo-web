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
import { CommunityProfileSettings } from '@/components/community-profile-settings'
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
  const { getAccessToken } = useAuth()
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

  // Load preferences on mount
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

      // If switching to mature and no age declaration, show age gate
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

        // Save global preferences
        await updatePreferences(
          {
            maturityLevel: values.maturityLevel === 'sfw-mature' ? 'mature' : 'sfw',
            mutedWords,
            crossPostBluesky: values.crossPostBluesky,
            crossPostFrontpage: values.crossPostFrontpage,
          },
          token
        )

        // Save per-community overrides
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

            {/* Community Profile (separate save, independent section) */}
            <CommunityProfileSettings />

            {/* Content Safety */}
            <fieldset className="space-y-4 rounded-lg border border-border p-4">
              <legend className="px-2 text-sm font-semibold text-foreground">Content Safety</legend>

              <div className="space-y-1">
                <label
                  htmlFor="maturity-level"
                  className="block text-sm font-medium text-foreground"
                >
                  Maturity level
                </label>
                <select
                  id="maturity-level"
                  value={values.maturityLevel}
                  onChange={(e) =>
                    setValues({ ...values, maturityLevel: e.target.value as MaturityLevel })
                  }
                  className={cn(
                    'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  <option value="sfw">SFW only</option>
                  <option value="sfw-mature">SFW + Mature</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Controls which content you can see. Mature content requires age confirmation.
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="muted-words" className="block text-sm font-medium text-foreground">
                  Muted words
                </label>
                <textarea
                  id="muted-words"
                  value={values.mutedWords}
                  onChange={(e) => setValues({ ...values, mutedWords: e.target.value })}
                  placeholder="Enter words separated by commas"
                  rows={3}
                  className={cn(
                    'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Posts containing these words will be collapsed. Comma-separated.
                </p>
              </div>
            </fieldset>

            {/* Per-Community Overrides */}
            <fieldset className="space-y-4 rounded-lg border border-border p-4">
              <legend className="px-2 text-sm font-semibold text-foreground">
                Per-Community Overrides
              </legend>

              {communityOverrides.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No community memberships found. Join a community to configure per-community
                  settings.
                </p>
              ) : (
                <div className="space-y-3">
                  {communityOverrides.map((community) => (
                    <details
                      key={community.communityDid}
                      className="rounded-md border border-border"
                    >
                      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
                        {community.communityName}
                      </summary>

                      <div className="space-y-3 border-t border-border px-3 py-3">
                        <div className="space-y-1">
                          <label
                            htmlFor={`maturity-${community.communityDid}`}
                            className="block text-xs font-medium text-foreground"
                          >
                            Maturity override
                          </label>
                          <select
                            id={`maturity-${community.communityDid}`}
                            value={community.maturityLevel}
                            onChange={(e) =>
                              handleCommunityChange(
                                community.communityDid,
                                'maturityLevel',
                                e.target.value
                              )
                            }
                            className={cn(
                              'block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            )}
                          >
                            <option value="inherit">Inherit global setting</option>
                            <option value="sfw">SFW only</option>
                            <option value="mature">SFW + Mature</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor={`muted-words-${community.communityDid}`}
                            className="block text-xs font-medium text-foreground"
                          >
                            Community muted words
                          </label>
                          <textarea
                            id={`muted-words-${community.communityDid}`}
                            value={community.mutedWords}
                            onChange={(e) =>
                              handleCommunityChange(
                                community.communityDid,
                                'mutedWords',
                                e.target.value
                              )
                            }
                            placeholder="Additional muted words for this community"
                            rows={2}
                            className={cn(
                              'block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            )}
                          />
                          <p className="text-xs text-muted-foreground">
                            These are in addition to your global muted words. Comma-separated.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor={`blocked-${community.communityDid}`}
                            className="block text-xs font-medium text-foreground"
                          >
                            Community blocked users
                          </label>
                          <textarea
                            id={`blocked-${community.communityDid}`}
                            value={community.blockedDids}
                            onChange={(e) =>
                              handleCommunityChange(
                                community.communityDid,
                                'blockedDids',
                                e.target.value
                              )
                            }
                            placeholder="DIDs of users to block in this community"
                            rows={2}
                            className={cn(
                              'block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            )}
                          />
                          <p className="text-xs text-muted-foreground">
                            Block specific users only in this community. Comma-separated DIDs.
                          </p>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </fieldset>

            {/* Cross-Posting */}
            <fieldset className="space-y-4 rounded-lg border border-border p-4">
              <legend className="px-2 text-sm font-semibold text-foreground">Cross-Posting</legend>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values.crossPostBluesky}
                    onChange={(e) => setValues({ ...values, crossPostBluesky: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-foreground">
                    Share new topics on Bluesky by default
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values.crossPostFrontpage}
                    onChange={(e) => setValues({ ...values, crossPostFrontpage: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-foreground">
                    Share new topics on Frontpage by default
                  </span>
                </label>
              </div>
            </fieldset>

            {/* Notifications */}
            <fieldset className="space-y-4 rounded-lg border border-border p-4">
              <legend className="px-2 text-sm font-semibold text-foreground">Notifications</legend>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values.notifyReplies}
                    onChange={(e) => setValues({ ...values, notifyReplies: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-foreground">Replies to my posts</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values.notifyMentions}
                    onChange={(e) => setValues({ ...values, notifyMentions: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-foreground">Mentions of my handle</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values.notifyReactions}
                    onChange={(e) => setValues({ ...values, notifyReactions: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-foreground">Reactions on my posts</span>
                </label>
              </div>
            </fieldset>

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

            {/* Save */}
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

      <AgeGateDialog
        open={showAgeGate}
        onConfirm={(age) => {
          setDeclaredAge(age)
          setShowAgeGate(false)
          // Re-trigger save now that age is declared
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
