/**
 * PluginCard - Card display for a single plugin with controls.
 * @see specs/prd-web.md Section M13
 */

import { Gear, Trash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Plugin } from '@/lib/api/types'

const SOURCE_STYLES: Record<string, string> = {
  core: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  official: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  community: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  experimental: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
}

const SOURCE_LABELS: Record<string, string> = {
  core: 'Core',
  official: 'Official',
  community: 'Community',
  experimental: 'Experimental',
}

interface PluginCardProps {
  plugin: Plugin
  allPlugins: Plugin[]
  onOpenSettings: (plugin: Plugin) => void
  onToggle: (plugin: Plugin) => void
  onUninstall: (plugin: Plugin) => void
}

export function PluginCard({
  plugin,
  allPlugins,
  onOpenSettings,
  onToggle,
  onUninstall,
}: PluginCardProps) {
  return (
    <article
      className={cn('rounded-lg border border-border bg-card p-4', !plugin.enabled && 'opacity-60')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">{plugin.displayName}</h2>
            <span className="text-xs text-muted-foreground">v{plugin.version}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                SOURCE_STYLES[plugin.source] ?? SOURCE_STYLES.community
              )}
            >
              {SOURCE_LABELS[plugin.source] ?? plugin.source}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{plugin.description}</p>
          {(plugin.dependencies?.length ?? 0) > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Depends on:{' '}
              {plugin.dependencies
                .map((depId) => {
                  const dep = allPlugins.find((p) => p.id === depId)
                  return dep?.displayName ?? depId
                })
                .join(', ')}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {Object.keys(plugin.settingsSchema ?? {}).length > 0 && (
            <button
              type="button"
              onClick={() => onOpenSettings(plugin)}
              className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`${plugin.displayName} settings`}
            >
              <Gear size={16} aria-hidden="true" />
            </button>
          )}
          {plugin.source !== 'core' && (
            <button
              type="button"
              onClick={() => onUninstall(plugin)}
              className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-destructive"
              aria-label={`Uninstall ${plugin.displayName}`}
            >
              <Trash size={16} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={plugin.enabled}
            aria-label={`${plugin.enabled ? 'Disable' : 'Enable'} ${plugin.displayName}`}
            onClick={() => onToggle(plugin)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
              plugin.enabled ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform',
                plugin.enabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>
    </article>
  )
}
