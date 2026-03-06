/**
 * Admin plugin management page.
 * URL: /admin/plugins
 * Lists installed plugins with enable/disable, settings, and uninstall controls.
 * @see specs/prd-web.md Section M13
 */

'use client'

import { PuzzlePiece } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { PluginCard } from '@/components/admin/plugins/plugin-card'
import { PluginSettingsModal } from '@/components/admin/plugins/plugin-settings-modal'
import { DependencyWarningDialog } from '@/components/admin/plugins/dependency-warning-dialog'
import { usePluginManagement } from '@/hooks/admin/use-plugin-management'

export default function AdminPluginsPage() {
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Plugins</h1>

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchPlugins()} />
        )}

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

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
            <PuzzlePiece className="mb-4 h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">No plugins installed</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Plugins extend your community with additional features. Install plugins to see them
              listed here.
            </p>
          </div>
        )}

        {!loading && plugins.length > 0 && (
          <div className="space-y-3">
            {plugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                allPlugins={plugins}
                onOpenSettings={(p) => setSettingsPlugin(p)}
                onToggle={(p) => void handleToggle(p)}
                onUninstall={(p) => void handleUninstall(p)}
              />
            ))}
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
