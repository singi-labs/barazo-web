/**
 * DesignColorsSection - Primary and accent color inputs for the design page.
 */

'use client'

import type { CommunitySettings } from '@/lib/api/types'

interface DesignColorsSectionProps {
  settings: CommunitySettings
  onChange: (updated: CommunitySettings) => void
}

export function DesignColorsSection({ settings, onChange }: DesignColorsSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium text-foreground">Colors</legend>

      <div>
        <label htmlFor="design-primary-color" className="block text-sm text-muted-foreground">
          Primary Color
        </label>
        <input
          id="design-primary-color"
          type="text"
          value={settings.primaryColor ?? ''}
          onChange={(e) => onChange({ ...settings, primaryColor: e.target.value || null })}
          placeholder="#31748f"
          className="mt-1 w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div>
        <label htmlFor="design-accent-color" className="block text-sm text-muted-foreground">
          Accent Color
        </label>
        <input
          id="design-accent-color"
          type="text"
          value={settings.accentColor ?? ''}
          onChange={(e) => onChange({ ...settings, accentColor: e.target.value || null })}
          placeholder="#c4a7e7"
          className="mt-1 w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
    </fieldset>
  )
}
