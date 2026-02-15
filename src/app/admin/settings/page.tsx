/**
 * Admin community settings page.
 * URL: /admin/settings
 * Community name, description, branding, reaction config, maturity rating.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { getCommunitySettings, updateCommunitySettings } from '@/lib/api/client'
import type { CommunitySettings, MaturityRating } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

export default function AdminSettingsPage() {
  const { getAccessToken } = useAuth()
  const [settings, setSettings] = useState<CommunitySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getCommunitySettings()
      setSettings(data)
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const updated = await updateCommunitySettings(
        {
          communityName: settings.communityName,
          communityDescription: settings.communityDescription,
          maturityRating: settings.maturityRating,
          reactionSet: settings.reactionSet,
          primaryColor: settings.primaryColor,
          accentColor: settings.accentColor,
        },
        getAccessToken() ?? ''
      )
      setSettings(updated)
    } catch {
      // Silently handle
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Community Settings</h1>

        {loading && <p className="text-sm text-muted-foreground">Loading settings...</p>}

        {settings && (
          <div className="max-w-lg space-y-6">
            <div>
              <label htmlFor="settings-name" className="block text-sm font-medium text-foreground">
                Community Name
              </label>
              <input
                id="settings-name"
                type="text"
                value={settings.communityName}
                onChange={(e) => setSettings({ ...settings, communityName: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <label htmlFor="settings-desc" className="block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="settings-desc"
                value={settings.communityDescription ?? ''}
                onChange={(e) =>
                  setSettings({ ...settings, communityDescription: e.target.value || null })
                }
                rows={3}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="settings-maturity"
                className="block text-sm font-medium text-foreground"
              >
                Community Maturity Rating
              </label>
              <select
                id="settings-maturity"
                value={settings.maturityRating}
                onChange={(e) =>
                  setSettings({ ...settings, maturityRating: e.target.value as MaturityRating })
                }
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="safe">Safe (default)</option>
                <option value="mature">Mature</option>
                <option value="adult">Adult</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Changing to Mature or Adult affects global aggregator visibility.
              </p>
            </div>

            <div>
              <label
                htmlFor="settings-reactions"
                className="block text-sm font-medium text-foreground"
              >
                Reaction Set
              </label>
              <input
                id="settings-reactions"
                type="text"
                value={settings.reactionSet.join(', ')}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reactionSet: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Comma-separated list of reaction types available in your community.
              </p>
            </div>

            <fieldset className="space-y-4">
              <legend className="text-sm font-medium text-foreground">Branding</legend>
              <div>
                <label
                  htmlFor="settings-primary-color"
                  className="block text-sm text-muted-foreground"
                >
                  Primary Color
                </label>
                <input
                  id="settings-primary-color"
                  type="text"
                  value={settings.primaryColor ?? ''}
                  onChange={(e) =>
                    setSettings({ ...settings, primaryColor: e.target.value || null })
                  }
                  placeholder="#31748f"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label
                  htmlFor="settings-accent-color"
                  className="block text-sm text-muted-foreground"
                >
                  Accent Color
                </label>
                <input
                  id="settings-accent-color"
                  type="text"
                  value={settings.accentColor ?? ''}
                  onChange={(e) =>
                    setSettings({ ...settings, accentColor: e.target.value || null })
                  }
                  placeholder="#c4a7e7"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
