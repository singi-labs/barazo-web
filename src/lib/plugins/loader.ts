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

// Map of bundled plugin names to their frontend register module paths.
// Dynamic import uses a variable so TypeScript doesn't statically resolve the
// module — this lets CI pass without the workspace plugin packages checked out.
const BUNDLED_PLUGIN_PATHS: Record<string, string> = {
  '@barazo/plugin-signatures': '@barazo/plugin-signatures/frontend/register',
}

function pluginLoader(
  modulePath: string
): () => Promise<{ register: (r: PluginComponentRegistry) => void }> {
  return () => import(/* webpackIgnore: true */ modulePath)
}

const BUNDLED_PLUGINS: Record<
  string,
  () => Promise<{ register: (r: PluginComponentRegistry) => void }>
> = Object.fromEntries(
  Object.entries(BUNDLED_PLUGIN_PATHS).map(([name, path]) => [name, pluginLoader(path)])
)

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
