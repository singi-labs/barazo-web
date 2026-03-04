/**
 * Admin community settings page.
 * URL: /admin/settings
 * Community name, description, branding, reaction config, maturity rating.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { CommunitySettingsForm } from '@/components/admin/settings/community-settings-form'
import { PdsTrustSection } from '@/components/admin/settings/pds-trust-section'
import {
  getCommunitySettings,
  updateCommunitySettings,
  getPdsTrustFactors,
  updatePdsTrustFactor,
} from '@/lib/api/client'
import type { CommunitySettings, PdsTrustFactor } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export default function AdminSettingsPage() {
  const { getAccessToken } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<CommunitySettings | null>(null)
  const [pdsProviders, setPdsProviders] = useState<PdsTrustFactor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pdsError, setPdsError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoadError(null)
    try {
      const [settingsData, pdsData] = await Promise.all([
        getCommunitySettings(getAccessToken() ?? ''),
        getPdsTrustFactors(getAccessToken() ?? ''),
      ])
      setSettings(settingsData)
      setPdsProviders(pdsData.factors)
    } catch {
      setLoadError('Failed to load community settings. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await updateCommunitySettings(
        {
          communityName: settings.communityName,
          communityDescription: settings.communityDescription,
          maturityRating: settings.maturityRating,
          reactionSet: settings.reactionSet,
          primaryColor: settings.primaryColor,
          accentColor: settings.accentColor,
          maxReplyDepth: settings.maxReplyDepth,
        },
        getAccessToken() ?? ''
      )
      setSettings(updated)
      toast({ title: 'Settings saved' })
    } catch {
      setSaveError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePdsUpdate = async (pdsHost: string, trustFactor: number) => {
    setPdsError(null)
    try {
      const updated = await updatePdsTrustFactor(pdsHost, trustFactor, getAccessToken() ?? '')
      setPdsProviders((prev) => {
        const existing = prev.find((p) => p.pdsHost === pdsHost)
        if (existing) {
          return prev.map((p) => (p.pdsHost === pdsHost ? updated : p))
        }
        return [...prev, updated]
      })
      toast({ title: 'PDS trust factor updated' })
    } catch {
      setPdsError('Failed to update PDS trust factor.')
    }
  }

  const handlePdsRemove = async (pdsHost: string) => {
    setPdsError(null)
    setPdsProviders((prev) => prev.filter((p) => p.pdsHost !== pdsHost))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Community settings</h1>

        {loading && <p className="text-sm text-muted-foreground">Loading settings...</p>}

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchSettings()} />
        )}

        {settings && (
          <CommunitySettingsForm
            settings={settings}
            onChange={setSettings}
            onSave={() => void handleSave()}
            saving={saving}
            saveError={saveError}
            onDismissError={() => setSaveError(null)}
          />
        )}

        {!loading && !loadError && (
          <>
            <hr className="border-border" />
            {pdsError && <ErrorAlert message={pdsError} onDismiss={() => setPdsError(null)} />}
            <PdsTrustSection
              providers={pdsProviders}
              onUpdate={(host, factor) => void handlePdsUpdate(host, factor)}
              onRemove={(host) => void handlePdsRemove(host)}
            />
          </>
        )}
      </div>
    </AdminLayout>
  )
}
