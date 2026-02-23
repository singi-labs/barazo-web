/**
 * Admin plugin management page.
 * URL: /admin/plugins
 * Lists installed plugins with enable/disable, settings, and uninstall controls.
 * Phase 1: manage installed plugins. Phase 2: marketplace search/install.
 * @see specs/prd-web.md Section M13
 */

'use client'

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
  } = usePluginManagement()

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

        {dependencyWarning && (
          <DependencyWarningDialog
            pluginName={dependencyWarning.plugin.displayName}
            dependents={dependencyWarning.dependents}
            onConfirm={() => void confirmDisable()}
            onCancel={() => setDependencyWarning(null)}
          />
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
