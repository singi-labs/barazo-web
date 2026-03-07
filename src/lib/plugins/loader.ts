/**
 * Plugin frontend loader.
 * Registers bundled plugin components into the slot registry.
 * Called once by PluginProvider after the plugin list is fetched.
 */

import type { ComponentType } from 'react'
import { registerPluginComponent } from './registry'
import type { SlotName } from './registry'

interface PluginComponentRegistry {
  add: (slot: string, component: ComponentType<Record<string, unknown>>) => void
}

function createRegistryAdapter(pluginName: string): PluginComponentRegistry {
  return {
    add(slot: string, component: ComponentType<Record<string, unknown>>) {
      registerPluginComponent(slot as SlotName, pluginName, component)
    },
  }
}

const BUNDLED_PLUGINS: Record<
  string,
  () => Promise<{ register: (r: PluginComponentRegistry) => void }>
> = {
  '@barazo/plugin-signatures': () => import('@barazo/plugin-signatures/frontend/register'),
}

let loaded = false

export async function loadBundledPlugins(enabledPluginNames: string[]): Promise<void> {
  if (loaded) return
  loaded = true

  for (const [name, loader] of Object.entries(BUNDLED_PLUGINS)) {
    if (!enabledPluginNames.includes(name)) continue
    try {
      const mod = await loader()
      mod.register(createRegistryAdapter(name))
    } catch {
      // Plugin failed to load — silently skip (error boundary catches render errors)
    }
  }
}
