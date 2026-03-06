/**
 * Plugin context provider.
 * Fetches enabled plugins and their settings from the API on mount.
 * Exposes helpers to check plugin state and a refresh method for admin pages.
 */

'use client'

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Plugin } from '@/lib/api/types'
import { getPlugins } from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'

export interface PluginContextValue {
  /** List of all plugins (enabled and disabled) */
  plugins: Plugin[]
  /** Check whether a plugin with the given name is enabled */
  isPluginEnabled: (name: string) => boolean
  /** Get the settings for a plugin by name, or null if not found */
  getPluginSettings: (name: string) => Record<string, unknown> | null
  /** Whether the plugin list is still loading */
  isLoading: boolean
  /** Re-fetch the plugin list (call after admin changes) */
  refreshPlugins: () => Promise<void>
}

export const PluginContext = createContext<PluginContextValue | null>(null)

interface PluginProviderProps {
  children: ReactNode
}

export function PluginProvider({ children }: PluginProviderProps) {
  const { getAccessToken, isLoading: authLoading } = useAuth()
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPlugins = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      // Unauthenticated: no plugin data available from API
      setPlugins([])
      setIsLoading(false)
      return
    }

    try {
      const response = await getPlugins(token)
      setPlugins(response.plugins)
    } catch {
      // On error, keep existing plugins (or empty on first load)
      setPlugins((prev) => prev)
    } finally {
      setIsLoading(false)
    }
  }, [getAccessToken])

  const refreshPlugins = useCallback(async () => {
    setIsLoading(true)
    await fetchPlugins()
  }, [fetchPlugins])

  useEffect(() => {
    if (authLoading) return
    void fetchPlugins()
  }, [authLoading, fetchPlugins])

  const isPluginEnabled = useCallback(
    (name: string): boolean => {
      const plugin = plugins.find((p) => p.name === name)
      return plugin?.enabled ?? false
    },
    [plugins]
  )

  const getPluginSettings = useCallback(
    (name: string): Record<string, unknown> | null => {
      const plugin = plugins.find((p) => p.name === name)
      if (!plugin) return null
      return { ...plugin.settings }
    },
    [plugins]
  )

  const value = useMemo<PluginContextValue>(
    () => ({
      plugins,
      isPluginEnabled,
      getPluginSettings,
      isLoading,
      refreshPlugins,
    }),
    [plugins, isPluginEnabled, getPluginSettings, isLoading, refreshPlugins]
  )

  return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>
}
