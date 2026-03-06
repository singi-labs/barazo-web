/**
 * Admin plugin management page.
 * URL: /admin/plugins
 * Tabbed view: "Installed" lists plugins with controls, "Browse" searches the registry.
 * @see specs/prd-web.md Section M13
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { PuzzlePiece, MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { PluginCard } from '@/components/admin/plugins/plugin-card'
import { RegistryPluginCard } from '@/components/admin/plugins/registry-plugin-card'
import { PluginSettingsModal } from '@/components/admin/plugins/plugin-settings-modal'
import { DependencyWarningDialog } from '@/components/admin/plugins/dependency-warning-dialog'
import { usePluginManagement } from '@/hooks/admin/use-plugin-management'
import { useRegistrySearch } from '@/hooks/admin/use-registry-search'
import { useAuth } from '@/hooks/use-auth'
import { installPlugin, getFeaturedPlugins } from '@/lib/api/client'
import type { RegistryPlugin } from '@/lib/api/types'

type PluginTab = 'installed' | 'browse'

export default function AdminPluginsPage() {
  const { getAccessToken } = useAuth()
  const [tab, setTab] = useState<PluginTab>('installed')
  const [searchQuery, setSearchQuery] = useState('')
  const [installingName, setInstallingName] = useState<string | null>(null)
  const [installError, setInstallError] = useState<string | null>(null)
  const [registryVersions, setRegistryVersions] = useState<Map<string, string>>(new Map())

  const {
    plugins,
    loading,
    settingsPlugin,
    setSettingsPlugin,
    dependencyWarning,
    setDependencyWarning,
    loadError,
    actionError,
    setActionError,
    fetchPlugins,
    handleToggle,
    confirmDisable,
    handleSaveSettings,
    handleUninstall,
    settingsSaveStatus,
  } = usePluginManagement()

  const registry = useRegistrySearch()

  // Fetch featured plugins on mount to get registry versions for update comparison
  useEffect(() => {
    async function loadRegistryVersions() {
      try {
        const response = await getFeaturedPlugins()
        const versions = new Map<string, string>()
        for (const plugin of response.plugins) {
          versions.set(plugin.name, plugin.version)
        }
        setRegistryVersions(versions)
      } catch {
        // Non-critical: version comparison is a nice-to-have
      }
    }
    void loadRegistryVersions()
  }, [])

  const installedNames = new Set(plugins.map((p) => p.name))

  const handleSearch = useCallback(() => {
    void registry.search({ q: searchQuery || undefined })
  }, [registry, searchQuery])

  const handleInstall = useCallback(
    async (plugin: RegistryPlugin) => {
      setInstallingName(plugin.name)
      setInstallError(null)
      try {
        await installPlugin(plugin.name, plugin.version, getAccessToken() ?? '')
        await fetchPlugins()
      } catch {
        setInstallError(`Failed to install ${plugin.displayName}. Please try again.`)
      } finally {
        setInstallingName(null)
      }
    },
    [getAccessToken, fetchPlugins]
  )

  const hasUpdate = useCallback(
    (pluginName: string, installedVersion: string): boolean => {
      const registryVersion = registryVersions.get(pluginName)
      if (!registryVersion) return false
      return registryVersion !== installedVersion
    },
    [registryVersions]
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Plugins</h1>

        <div role="tablist" aria-label="Plugin tabs" className="flex gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setTab('installed')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              tab === 'installed'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-selected={tab === 'installed'}
            role="tab"
            id="tab-installed"
            aria-controls="tabpanel-installed"
          >
            Installed
          </button>
          <button
            type="button"
            onClick={() => setTab('browse')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              tab === 'browse'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-selected={tab === 'browse'}
            role="tab"
            id="tab-browse"
            aria-controls="tabpanel-browse"
          >
            Browse
          </button>
        </div>

        {tab === 'installed' && (
          <div
            role="tabpanel"
            id="tabpanel-installed"
            aria-labelledby="tab-installed"
            className="space-y-6"
          >
            {loadError && (
              <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchPlugins()} />
            )}

            {actionError && (
              <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />
            )}

            {loading && (
              <div className="space-y-3" aria-busy="true" aria-label="Loading plugins">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-lg border border-border bg-muted/50"
                  />
                ))}
              </div>
            )}

            {!loading && !loadError && plugins.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                <PuzzlePiece
                  className="mb-4 h-12 w-12 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <h2 className="text-lg font-semibold text-foreground">No plugins installed</h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Plugins extend your community with additional features. Browse the registry to
                  find and install plugins.
                </p>
                <button
                  type="button"
                  onClick={() => setTab('browse')}
                  className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Browse Plugins
                </button>
              </div>
            )}

            {!loading && plugins.length > 0 && (
              <div className="space-y-3">
                {plugins.map((plugin) => (
                  <div key={plugin.id} className="relative">
                    <PluginCard
                      plugin={plugin}
                      allPlugins={plugins}
                      onOpenSettings={(p) => setSettingsPlugin(p)}
                      onToggle={(p) => void handleToggle(p)}
                      onUninstall={(p) => void handleUninstall(p)}
                    />
                    {hasUpdate(plugin.name, plugin.version) && (
                      <span className="absolute right-14 top-4 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Update available
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'browse' && (
          <div
            role="tabpanel"
            id="tabpanel-browse"
            aria-labelledby="tab-browse"
            className="space-y-6"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlass
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                  className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Search plugins"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={registry.loading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                Search
              </button>
            </div>

            {installError && (
              <ErrorAlert message={installError} onDismiss={() => setInstallError(null)} />
            )}
            {registry.error && <ErrorAlert message={registry.error} />}

            {registry.loading && (
              <div className="space-y-3" aria-busy="true" aria-label="Searching plugins">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-lg border border-border bg-muted/50"
                  />
                ))}
              </div>
            )}

            {!registry.loading &&
              registry.hasSearched &&
              registry.results.length === 0 &&
              !registry.error && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                  <MagnifyingGlass
                    className="mb-4 h-12 w-12 text-muted-foreground/50"
                    aria-hidden="true"
                  />
                  <h2 className="text-lg font-semibold text-foreground">No plugins found</h2>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Try a different search term or browse all available plugins.
                  </p>
                </div>
              )}

            {!registry.loading && !registry.hasSearched && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                <PuzzlePiece
                  className="mb-4 h-12 w-12 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <h2 className="text-lg font-semibold text-foreground">
                  Browse the plugin registry
                </h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Search for plugins by name, category, or keyword to extend your community.
                </p>
              </div>
            )}

            {!registry.loading && registry.results.length > 0 && (
              <div className="space-y-3">
                {registry.results.map((plugin) => (
                  <RegistryPluginCard
                    key={plugin.name}
                    plugin={plugin}
                    isInstalled={installedNames.has(plugin.name)}
                    onInstall={(p) => void handleInstall(p)}
                    installing={installingName === plugin.name}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {settingsPlugin && (
        <PluginSettingsModal
          plugin={settingsPlugin}
          onClose={() => setSettingsPlugin(null)}
          onSave={(settings) => void handleSaveSettings(settings)}
          saveStatus={settingsSaveStatus}
        />
      )}

      {dependencyWarning && (
        <DependencyWarningDialog
          pluginName={dependencyWarning.plugin.displayName}
          dependents={dependencyWarning.dependents}
          onConfirm={() => void confirmDisable()}
          onCancel={() => setDependencyWarning(null)}
        />
      )}
    </AdminLayout>
  )
}
