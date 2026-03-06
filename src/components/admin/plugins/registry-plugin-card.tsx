/**
 * RegistryPluginCard - Card display for a plugin from the registry (browse tab).
 * @see specs/prd-web.md Section M13
 */

import { cn } from '@/lib/utils'
import type { RegistryPlugin } from '@/lib/api/types'

const SOURCE_STYLES: Record<string, string> = {
  core: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  official: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  community: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  experimental: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
}

interface RegistryPluginCardProps {
  plugin: RegistryPlugin
  isInstalled: boolean
  onInstall: (plugin: RegistryPlugin) => void
  installing: boolean
}

export function RegistryPluginCard({
  plugin,
  isInstalled,
  onInstall,
  installing,
}: RegistryPluginCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{plugin.displayName}</h3>
            <span className="text-xs text-muted-foreground">v{plugin.version}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                SOURCE_STYLES[plugin.source] ?? SOURCE_STYLES.community
              )}
            >
              {plugin.source}
            </span>
            {plugin.approved && (
              <span
                className="text-xs text-green-600 dark:text-green-400"
                title="Approved by Barazo"
              >
                verified
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{plugin.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            By {plugin.author.name} · {plugin.license} · {plugin.category}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          {isInstalled ? (
            <span className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">
              Installed
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onInstall(plugin)}
              disabled={installing}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {installing ? 'Installing...' : 'Install'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
