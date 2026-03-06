import type { ComponentType } from 'react'

export type SlotName =
  | 'settings-community'
  | 'settings-global'
  | 'post-content'
  | 'admin-dashboard'
  | 'topic-sidebar'
  | 'user-profile'

export interface PluginRegistration {
  pluginName: string
  component: ComponentType<Record<string, unknown>>
}

const registry = new Map<SlotName, PluginRegistration[]>()

export function registerPluginComponent(
  slot: SlotName,
  pluginName: string,
  component: ComponentType<Record<string, unknown>>
): void {
  const existing = registry.get(slot) ?? []
  // Prevent duplicate registration
  if (existing.some((r) => r.pluginName === pluginName)) return
  registry.set(slot, [...existing, { pluginName, component }])
}

export function getPluginComponents(slot: SlotName): PluginRegistration[] {
  return registry.get(slot) ?? []
}

export function clearPluginRegistry(): void {
  registry.clear()
}
