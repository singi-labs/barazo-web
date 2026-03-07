/**
 * Hook for managing plugin list state and API interactions.
 * @see specs/prd-web.md Section M13
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPlugins, togglePlugin, updatePluginSettings, uninstallPlugin } from '@/lib/api/client'
import type { Plugin } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useSaveState } from '@/hooks/use-save-state'

interface DependencyWarning {
  plugin: Plugin
  dependents: string[]
}

export function usePluginManagement() {
  const { getAccessToken } = useAuth()
  const { toast } = useToast()
  const settingsSave = useSaveState()
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsPlugin, setSettingsPlugin] = useState<Plugin | null>(null)
  const [dependencyWarning, setDependencyWarning] = useState<DependencyWarning | null>(null)
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
    return (plugin.dependents ?? []).map((depId) => {
      const dep = plugins.find((p) => p.id === depId)
      return dep?.displayName ?? depId
    })
  }

  const handleToggle = async (plugin: Plugin) => {
    if (plugin.enabled && (plugin.dependents?.length ?? 0) > 0) {
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
      toast({ title: `${plugin.displayName} ${plugin.enabled ? 'disabled' : 'enabled'}` })
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
      toast({ title: `${dependencyWarning.plugin.displayName} disabled` })
    } catch {
      setActionError('Failed to disable plugin. Please try again.')
    }
    setDependencyWarning(null)
  }

  const handleSaveSettings = async (settings: Record<string, boolean | string | number>) => {
    if (!settingsPlugin) return
    setActionError(null)
    settingsSave.startSaving()
    try {
      await updatePluginSettings(settingsPlugin.id, settings, getAccessToken() ?? '')
      setPlugins((prev) => prev.map((p) => (p.id === settingsPlugin.id ? { ...p, settings } : p)))
      settingsSave.reset()
      toast({ title: `${settingsPlugin.displayName} settings saved` })
    } catch {
      settingsSave.reset()
      setActionError('Failed to save plugin settings. Please try again.')
    }
    setSettingsPlugin(null)
  }

  const handleUninstall = async (plugin: Plugin) => {
    setActionError(null)
    try {
      await uninstallPlugin(plugin.id, getAccessToken() ?? '')
      setPlugins((prev) => prev.filter((p) => p.id !== plugin.id))
      toast({ title: `${plugin.displayName} uninstalled` })
    } catch {
      setActionError('Failed to uninstall plugin. Please try again.')
    }
  }

  return {
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
    settingsSaveStatus: settingsSave.status,
  }
}
