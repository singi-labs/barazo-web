/**
 * PluginSettingsModal - Modal dialog for editing a plugin's settings.
 * Dynamically renders fields from the plugin's settingsSchema.
 * @see specs/prd-web.md Section M13
 */

'use client'

import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import { SettingsField } from '@/components/admin/plugins/settings-field'
import type { Plugin } from '@/lib/api/types'

interface PluginSettingsModalProps {
  plugin: Plugin
  onClose: () => void
  onSave: (settings: Record<string, boolean | string | number>) => void
}

export function PluginSettingsModal({ plugin, onClose, onSave }: PluginSettingsModalProps) {
  const [values, setValues] = useState<Record<string, boolean | string | number>>(() => ({
    ...plugin.settings,
  }))

  const handleChange = (key: string, value: boolean | string | number) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(values)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={`${plugin.displayName} settings`}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{plugin.displayName} Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close settings"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(plugin.settingsSchema).map(([key, schema]) => (
            <SettingsField
              key={key}
              fieldKey={key}
              schema={schema}
              value={values[key] ?? schema.default}
              onChange={(val) => handleChange(key, val)}
            />
          ))}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
