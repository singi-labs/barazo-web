/**
 * Admin plugin management page.
 * URL: /admin/plugins
 * Lists installed plugins with enable/disable, settings, and uninstall controls.
 * Phase 1: manage installed plugins. Phase 2: marketplace search/install.
 * @see specs/prd-web.md Section M13
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { WarningCircle } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { PluginCard } from '@/components/admin/plugins/plugin-card'
import { PluginSettingsModal } from '@/components/admin/plugins/plugin-settings-modal'
import { getPlugins, togglePlugin, updatePluginSettings, uninstallPlugin } from '@/lib/api/client'
import type { Plugin } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

export default function AdminPluginsPage() {
  const { getAccessToken } = useAuth()
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsPlugin, setSettingsPlugin] = useState<Plugin | null>(null)
  const [dependencyWarning, setDependencyWarning] = useState<{
    plugin: Plugin
    dependents: string[]
  } | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchPlugins = useCallback(async () => {
    setLoadError(null)
    try {
      const response = await getPlugins(getAccessToken() ?? '')
      setPlugins(response.plugins)
    } catch {
      setLoadError('Failed to load plugins. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchPlugins()
  }, [fetchPlugins])

  const findDependentNames = (plugin: Plugin): string[] => {
    return plugin.dependents.map((depId) => {
      const dep = plugins.find((p) => p.id === depId)
      return dep?.displayName ?? depId
    })
  }

  const handleToggle = async (plugin: Plugin) => {
    if (plugin.enabled && plugin.dependents.length > 0) {
      const dependentNames = findDependentNames(plugin)
      setDependencyWarning({ plugin, dependents: dependentNames })
      return
    }

    setActionError(null)
    try {
      await togglePlugin(plugin.id, !plugin.enabled, getAccessToken() ?? '')
      setPlugins((prev) =>
        prev.map((p) => (p.id === plugin.id ? { ...p, enabled: !p.enabled } : p))
      )
    } catch {
      setActionError(`Failed to ${plugin.enabled ? 'disable' : 'enable'} plugin. Please try again.`)
    }
  }

  const confirmDisable = async () => {
    if (!dependencyWarning) return
    setActionError(null)
    try {
      await togglePlugin(dependencyWarning.plugin.id, false, getAccessToken() ?? '')
      setPlugins((prev) =>
        prev.map((p) => (p.id === dependencyWarning.plugin.id ? { ...p, enabled: false } : p))
      )
    } catch {
      setActionError('Failed to disable plugin. Please try again.')
    }
    setDependencyWarning(null)
  }

  const handleSaveSettings = async (settings: Record<string, boolean | string | number>) => {
    if (!settingsPlugin) return
    setActionError(null)
    try {
      await updatePluginSettings(settingsPlugin.id, settings, getAccessToken() ?? '')
      setPlugins((prev) => prev.map((p) => (p.id === settingsPlugin.id ? { ...p, settings } : p)))
    } catch {
      setActionError('Failed to save plugin settings. Please try again.')
    }
    setSettingsPlugin(null)
  }

  const handleUninstall = async (plugin: Plugin) => {
    setActionError(null)
    try {
      await uninstallPlugin(plugin.id, getAccessToken() ?? '')
      setPlugins((prev) => prev.filter((p) => p.id !== plugin.id))
    } catch {
      setActionError('Failed to uninstall plugin. Please try again.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Plugins</h1>
          <p className="text-sm text-muted-foreground">
            {plugins.filter((p) => p.enabled).length} of {plugins.length} enabled
          </p>
        </div>

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchPlugins()} />
        )}

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

        {loading && <p className="text-sm text-muted-foreground">Loading plugins...</p>}

        {!loading && plugins.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No plugins installed.</p>
        )}

        {!loading && plugins.length > 0 && (
          <div className="space-y-3">
            {plugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                allPlugins={plugins}
                onOpenSettings={setSettingsPlugin}
                onToggle={(p) => void handleToggle(p)}
                onUninstall={(p) => void handleUninstall(p)}
              />
            ))}
          </div>
        )}

        {/* Dependency Warning Dialog */}
        {dependencyWarning && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            role="alertdialog"
            aria-modal="true"
            aria-label="Dependency warning"
          >
            <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
              <div className="mb-3 flex items-center gap-2 text-destructive">
                <WarningCircle size={20} aria-hidden="true" />
                <h2 className="font-semibold">Dependency Warning</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Disabling <strong>{dependencyWarning.plugin.displayName}</strong> will affect the
                following plugins that depend on it:{' '}
                <strong>{dependencyWarning.dependents.join(', ')}</strong>
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDependencyWarning(null)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDisable()}
                  className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                >
                  Disable Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        {settingsPlugin && (
          <PluginSettingsModal
            plugin={settingsPlugin}
            onClose={() => setSettingsPlugin(null)}
            onSave={(settings) => void handleSaveSettings(settings)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
