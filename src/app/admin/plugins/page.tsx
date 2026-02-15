/**
 * Admin plugin management page.
 * URL: /admin/plugins
 * Lists installed plugins with enable/disable, settings, and uninstall controls.
 * Phase 1: manage installed plugins. Phase 2: marketplace search/install.
 * @see specs/prd-web.md Section M13
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gear, Trash, WarningCircle, X } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { getPlugins, togglePlugin, updatePluginSettings, uninstallPlugin } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { Plugin, PluginSettingsSchema } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

const SOURCE_STYLES: Record<string, string> = {
  core: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  official: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  community: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  experimental: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
}

const SOURCE_LABELS: Record<string, string> = {
  core: 'Core',
  official: 'Official',
  community: 'Community',
  experimental: 'Experimental',
}

function PluginSettingsModal({
  plugin,
  onClose,
  onSave,
}: {
  plugin: Plugin
  onClose: () => void
  onSave: (settings: Record<string, boolean | string | number>) => void
}) {
  const [values, setValues] = useState<Record<string, boolean | string | number>>(() => ({
    ...plugin.settings,
  }))

  const handleChange = (key: string, value: boolean | string | number) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(values)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={`${plugin.displayName} settings`}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{plugin.displayName} Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close settings"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(plugin.settingsSchema).map(([key, schema]) => (
            <SettingsField
              key={key}
              fieldKey={key}
              schema={schema}
              value={values[key] ?? schema.default}
              onChange={(val) => handleChange(key, val)}
            />
          ))}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SettingsField({
  fieldKey,
  schema,
  value,
  onChange,
}: {
  fieldKey: string
  schema: PluginSettingsSchema[string]
  value: boolean | string | number
  onChange: (value: boolean | string | number) => void
}) {
  if (schema.type === 'boolean') {
    return (
      <label className="flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-foreground">{schema.label}</span>
          {schema.description && (
            <p className="text-xs text-muted-foreground">{schema.description}</p>
          )}
        </div>
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
      </label>
    )
  }

  if (schema.type === 'select') {
    return (
      <label className="block">
        <span className="text-sm font-medium text-foreground">{schema.label}</span>
        {schema.description && (
          <p className="text-xs text-muted-foreground">{schema.description}</p>
        )}
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        >
          {schema.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt || '(none)'}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (schema.type === 'number') {
    return (
      <label className="block">
        <span className="text-sm font-medium text-foreground">{schema.label}</span>
        {schema.description && (
          <p className="text-xs text-muted-foreground">{schema.description}</p>
        )}
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
          name={fieldKey}
        />
      </label>
    )
  }

  // string
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{schema.label}</span>
      {schema.description && <p className="text-xs text-muted-foreground">{schema.description}</p>}
      <input
        type="text"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        name={fieldKey}
      />
    </label>
  )
}

export default function AdminPluginsPage() {
  const { getAccessToken } = useAuth()
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsPlugin, setSettingsPlugin] = useState<Plugin | null>(null)
  const [dependencyWarning, setDependencyWarning] = useState<{
    plugin: Plugin
    dependents: string[]
  } | null>(null)

  const fetchPlugins = useCallback(async () => {
    try {
      const response = await getPlugins(getAccessToken() ?? '')
      setPlugins(response.plugins)
    } catch {
      // Silently handle
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

    try {
      await togglePlugin(plugin.id, !plugin.enabled, getAccessToken() ?? '')
      setPlugins((prev) =>
        prev.map((p) => (p.id === plugin.id ? { ...p, enabled: !p.enabled } : p))
      )
    } catch {
      // Silently handle
    }
  }

  const confirmDisable = async () => {
    if (!dependencyWarning) return
    try {
      await togglePlugin(dependencyWarning.plugin.id, false, getAccessToken() ?? '')
      setPlugins((prev) =>
        prev.map((p) => (p.id === dependencyWarning.plugin.id ? { ...p, enabled: false } : p))
      )
    } catch {
      // Silently handle
    }
    setDependencyWarning(null)
  }

  const handleSaveSettings = async (settings: Record<string, boolean | string | number>) => {
    if (!settingsPlugin) return
    try {
      await updatePluginSettings(settingsPlugin.id, settings, getAccessToken() ?? '')
      setPlugins((prev) => prev.map((p) => (p.id === settingsPlugin.id ? { ...p, settings } : p)))
    } catch {
      // Silently handle
    }
    setSettingsPlugin(null)
  }

  const handleUninstall = async (plugin: Plugin) => {
    try {
      await uninstallPlugin(plugin.id, getAccessToken() ?? '')
      setPlugins((prev) => prev.filter((p) => p.id !== plugin.id))
    } catch {
      // Silently handle
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

        {loading && <p className="text-sm text-muted-foreground">Loading plugins...</p>}

        {!loading && plugins.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No plugins installed.</p>
        )}

        {!loading && plugins.length > 0 && (
          <div className="space-y-3">
            {plugins.map((plugin) => (
              <article
                key={plugin.id}
                className={cn(
                  'rounded-lg border border-border bg-card p-4',
                  !plugin.enabled && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-foreground">
                        {plugin.displayName}
                      </h2>
                      <span className="text-xs text-muted-foreground">v{plugin.version}</span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          SOURCE_STYLES[plugin.source] ?? SOURCE_STYLES.community
                        )}
                      >
                        {SOURCE_LABELS[plugin.source] ?? plugin.source}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{plugin.description}</p>
                    {plugin.dependencies.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Depends on:{' '}
                        {plugin.dependencies
                          .map((depId) => {
                            const dep = plugins.find((p) => p.id === depId)
                            return dep?.displayName ?? depId
                          })
                          .join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {Object.keys(plugin.settingsSchema).length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSettingsPlugin(plugin)}
                        className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`${plugin.displayName} settings`}
                      >
                        <Gear size={16} aria-hidden="true" />
                      </button>
                    )}
                    {plugin.source !== 'core' && (
                      <button
                        type="button"
                        onClick={() => void handleUninstall(plugin)}
                        className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={`Uninstall ${plugin.displayName}`}
                      >
                        <Trash size={16} aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={plugin.enabled}
                      aria-label={`${plugin.enabled ? 'Disable' : 'Enable'} ${plugin.displayName}`}
                      onClick={() => void handleToggle(plugin)}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                        plugin.enabled ? 'bg-primary' : 'bg-muted'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform',
                          plugin.enabled ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                </div>
              </article>
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

        {/* Settings Modal */}
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
