/**
 * Admin design page.
 * URL: /admin/design
 * Logo upload, favicon upload, primary/accent color configuration.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { DesignImagesSection } from '@/components/admin/design/design-images-section'
import { DesignColorsSection } from '@/components/admin/design/design-colors-section'
import {
  getCommunitySettings,
  updateCommunitySettings,
  uploadCommunityLogo,
  uploadCommunityFavicon,
} from '@/lib/api/client'
import type { CommunitySettings } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

export default function AdminDesignPage() {
  const { getAccessToken } = useAuth()
  const [settings, setSettings] = useState<CommunitySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoadError(null)
    try {
      const data = await getCommunitySettings(getAccessToken() ?? '')
      setSettings(data)
    } catch {
      setLoadError('Failed to load design settings. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const handleLogoUpload = useCallback(
    async (file: File) => {
      const result = await uploadCommunityLogo(file, getAccessToken() ?? '')
      setSettings((prev) => (prev ? { ...prev, communityLogoUrl: result.url } : prev))
      return result
    },
    [getAccessToken]
  )

  const handleLogoRemove = useCallback(async () => {
    try {
      const updated = await updateCommunitySettings(
        { communityLogoUrl: null },
        getAccessToken() ?? ''
      )
      setSettings(updated)
    } catch {
      setSaveError('Failed to remove logo.')
    }
  }, [getAccessToken])

  const handleFaviconUpload = useCallback(
    async (file: File) => {
      const result = await uploadCommunityFavicon(file, getAccessToken() ?? '')
      setSettings((prev) => (prev ? { ...prev, faviconUrl: result.url } : prev))
      return result
    },
    [getAccessToken]
  )

  const handleFaviconRemove = useCallback(async () => {
    try {
      const updated = await updateCommunitySettings({ faviconUrl: null }, getAccessToken() ?? '')
      setSettings(updated)
    } catch {
      setSaveError('Failed to remove favicon.')
    }
  }, [getAccessToken])

  const handleColorsSave = async () => {
    if (!settings) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await updateCommunitySettings(
        {
          primaryColor: settings.primaryColor,
          accentColor: settings.accentColor,
        },
        getAccessToken() ?? ''
      )
      setSettings(updated)
    } catch {
      setSaveError('Failed to save colors. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Design</h1>

        {loading && <p className="text-sm text-muted-foreground">Loading design settings...</p>}

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchSettings()} />
        )}

        {settings && (
          <div className="max-w-lg space-y-8">
            <DesignImagesSection
              settings={settings}
              onLogoUpload={handleLogoUpload}
              onLogoRemove={() => void handleLogoRemove()}
              onFaviconUpload={handleFaviconUpload}
              onFaviconRemove={() => void handleFaviconRemove()}
            />

            <hr className="border-border" />

            <DesignColorsSection settings={settings} onChange={setSettings} />

            {saveError && <ErrorAlert message={saveError} onDismiss={() => setSaveError(null)} />}

            <button
              type="button"
              onClick={() => void handleColorsSave()}
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Colors'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
