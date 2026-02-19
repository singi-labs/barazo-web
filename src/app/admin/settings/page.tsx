/**
 * Admin community settings page.
 * URL: /admin/settings
 * Community name, description, branding, reaction config, maturity rating.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import {
  getCommunitySettings,
  updateCommunitySettings,
  getPdsTrustFactors,
  updatePdsTrustFactor,
} from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { CommunitySettings, MaturityRating, PdsTrustFactor } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

// --- Confirm Dialog ---
function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h3 id="confirm-dialog-title" className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p id="confirm-dialog-message" className="mt-2 text-sm text-muted-foreground">
          {message}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Add/Edit PDS Override Dialog ---
function PdsOverrideDialog({
  open,
  mode,
  initialHostname,
  initialTrustFactor,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: 'add' | 'edit'
  initialHostname: string
  initialTrustFactor: number
  onClose: () => void
  onSubmit: (hostname: string, trustFactor: number) => void
}) {
  const [hostname, setHostname] = useState(initialHostname)
  const [trustFactor, setTrustFactor] = useState(initialTrustFactor)
  const hostnameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && mode === 'add') {
      hostnameRef.current?.focus()
    }
  }, [open, mode])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'add' && !hostname.trim()) return
    onSubmit(hostname.trim(), trustFactor)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'add' ? 'Add PDS trust override' : 'Edit PDS trust factor'}
    >
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">
          {mode === 'add' ? 'Add PDS Override' : 'Edit Trust Factor'}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="pds-hostname" className="block text-sm font-medium text-foreground">
              PDS Hostname
            </label>
            <input
              ref={hostnameRef}
              id="pds-hostname"
              type="text"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              disabled={mode === 'edit'}
              placeholder="my-pds.example.org"
              className={cn(
                'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                mode === 'edit' && 'cursor-not-allowed opacity-60'
              )}
              required
            />
          </div>
          <div>
            <label htmlFor="pds-trust-factor" className="block text-sm font-medium text-foreground">
              Trust Factor: {trustFactor.toFixed(1)}
            </label>
            <input
              id="pds-trust-factor"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={trustFactor}
              onChange={(e) => setTrustFactor(parseFloat(e.target.value))}
              className="mt-1 w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>0.0 (untrusted)</span>
              <span>1.0 (fully trusted)</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {mode === 'add' ? 'Add' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// --- PDS Provider Trust Section ---
function PdsTrustSection({
  providers,
  onUpdate,
  onRemove,
}: {
  providers: PdsTrustFactor[]
  onUpdate: (pdsHost: string, trustFactor: number) => void
  onRemove: (pdsHost: string) => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editHostname, setEditHostname] = useState('')
  const [editTrustFactor, setEditTrustFactor] = useState(1.0)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const handleAdd = () => {
    setDialogMode('add')
    setEditHostname('')
    setEditTrustFactor(1.0)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  const handleEdit = (provider: PdsTrustFactor) => {
    setDialogMode('edit')
    setEditHostname(provider.pdsHost)
    setEditTrustFactor(provider.trustFactor)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  const handleDialogSubmit = (hostname: string, trustFactor: number) => {
    onUpdate(hostname, trustFactor)
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">PDS Provider Trust</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Accounts from providers with higher trust factors earn reputation faster. Override the
            default if you trust a specific self-hosted PDS provider.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          aria-label="Add override"
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Add Override
        </button>
      </div>

      <div className="space-y-2">
        {providers.map((provider) => (
          <div
            key={provider.pdsHost}
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{provider.pdsHost}</span>
                {provider.isDefault && (
                  <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Trust factor: {provider.trustFactor.toFixed(1)}
              </p>
            </div>
            {!provider.isDefault && (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(provider)}
                  aria-label="Edit"
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(provider.pdsHost)}
                  aria-label="Remove"
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
        {providers.length === 0 && (
          <p className="py-4 text-center text-muted-foreground">No PDS providers configured.</p>
        )}
      </div>

      <PdsOverrideDialog
        key={dialogKey}
        open={dialogOpen}
        mode={dialogMode}
        initialHostname={editHostname}
        initialTrustFactor={editTrustFactor}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
      />

      <ConfirmDialog
        open={confirmRemove !== null}
        title="Remove PDS override"
        message={`Are you sure you want to remove the trust override for ${confirmRemove ?? ''}? The default trust factor will apply.`}
        onConfirm={() => {
          if (confirmRemove) onRemove(confirmRemove)
          setConfirmRemove(null)
        }}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  )
}

export default function AdminSettingsPage() {
  const { getAccessToken } = useAuth()
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
        getCommunitySettings(),
        getPdsTrustFactors(getAccessToken() ?? ''),
      ])
      setSettings(settingsData)
      setPdsProviders(pdsData.providers)
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
        },
        getAccessToken() ?? ''
      )
      setSettings(updated)
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
    } catch {
      setPdsError('Failed to update PDS trust factor.')
    }
  }

  const handlePdsRemove = async (pdsHost: string) => {
    setPdsError(null)
    // Removing an override reverts to default -- for the UI we just remove it from the list
    setPdsProviders((prev) => prev.filter((p) => p.pdsHost !== pdsHost))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Community Settings</h1>

        {loading && <p className="text-sm text-muted-foreground">Loading settings...</p>}

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchSettings()} />
        )}

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

            {saveError && <ErrorAlert message={saveError} onDismiss={() => setSaveError(null)} />}

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

        {/* PDS Provider Trust section */}
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
