'use client'

import { Component, type ReactNode, type ComponentType } from 'react'
import { usePlugins } from '@/hooks/use-plugins'
import { getPluginComponents, type SlotName } from '@/lib/plugins/registry'

interface PluginSlotProps {
  name: SlotName
  context?: Record<string, unknown>
  fallback?: ReactNode
}

// Error boundary for individual plugin components
interface ErrorBoundaryProps {
  pluginName: string
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class PluginErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          Plugin &ldquo;{this.props.pluginName}&rdquo; encountered an error.
        </div>
      )
    }
    return this.props.children
  }
}

export function PluginSlot({ name, context = {}, fallback }: PluginSlotProps) {
  const { plugins } = usePlugins()

  const registrations = getPluginComponents(name)

  // Filter to only enabled plugins
  const activeRegistrations = registrations.filter((reg) =>
    plugins.some((p) => p.name === reg.pluginName && p.enabled)
  )

  if (activeRegistrations.length === 0) {
    return fallback ?? null
  }

  return (
    <>
      {activeRegistrations.map((reg) => {
        const PluginComponent = reg.component as ComponentType<Record<string, unknown>>
        return (
          <PluginErrorBoundary key={reg.pluginName} pluginName={reg.pluginName}>
            <PluginComponent {...context} />
          </PluginErrorBoundary>
        )
      })}
    </>
  )
}
