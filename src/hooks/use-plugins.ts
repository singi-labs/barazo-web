/**
 * Hook to access plugin context.
 * Throws if used outside PluginProvider.
 */

'use client'

import { useContext } from 'react'
import { PluginContext } from '@/context/plugin-context'
import type { PluginContextValue } from '@/context/plugin-context'

export function usePlugins(): PluginContextValue {
  const context = useContext(PluginContext)
  if (!context) {
    throw new Error('usePlugins must be used within a PluginProvider')
  }
  return context
}
