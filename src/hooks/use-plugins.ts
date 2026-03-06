/**
 * Hook to access plugin context.
 * Returns a safe default when used outside PluginProvider (SSR, tests).
 */

'use client'

import { useContext } from 'react'
import { PluginContext } from '@/context/plugin-context'
import type { PluginContextValue } from '@/context/plugin-context'

const defaultContext: PluginContextValue = {
  plugins: [],
  isPluginEnabled: () => false,
  getPluginSettings: () => null,
  isLoading: false,
  refreshPlugins: async () => {},
}

export function usePlugins(): PluginContextValue {
  const context = useContext(PluginContext)
  return context ?? defaultContext
}
