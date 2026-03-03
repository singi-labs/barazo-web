/**
 * CommunitySettingsForm - Form for community name, description, maturity, and reactions.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { ErrorAlert } from '@/components/error-alert'
import type { CommunitySettings, MaturityRating } from '@/lib/api/types'

interface CommunitySettingsFormProps {
  settings: CommunitySettings
  onChange: (updated: CommunitySettings) => void
  onSave: () => void
  saving: boolean
  saveError: string | null
  onDismissError: () => void
}

export function CommunitySettingsForm({
  settings,
  onChange,
  onSave,
  saving,
  saveError,
  onDismissError,
}: CommunitySettingsFormProps) {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <label htmlFor="settings-name" className="block text-sm font-medium text-foreground">
          Community Name
        </label>
        <input
          id="settings-name"
          type="text"
          value={settings.communityName}
          onChange={(e) => onChange({ ...settings, communityName: e.target.value })}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div>
        <label htmlFor="settings-desc" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="settings-desc"
          value={settings.communityDescription ?? ''}
          onChange={(e) => onChange({ ...settings, communityDescription: e.target.value || null })}
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div>
        <label htmlFor="settings-maturity" className="block text-sm font-medium text-foreground">
          Community Maturity Rating
        </label>
        <select
          id="settings-maturity"
          value={settings.maturityRating}
          onChange={(e) =>
            onChange({ ...settings, maturityRating: e.target.value as MaturityRating })
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="safe">Safe (default)</option>
          <option value="mature">Mature</option>
          <option value="adult">Adult</option>
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Changing to Mature or Adult affects global aggregator visibility.
        </p>
      </div>

      <div>
        <label htmlFor="settings-reactions" className="block text-sm font-medium text-foreground">
          Reaction Set
        </label>
        <input
          id="settings-reactions"
          type="text"
          value={settings.reactionSet.join(', ')}
          onChange={(e) =>
            onChange({
              ...settings,
              reactionSet: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Comma-separated list of reaction types available in your community.
        </p>
      </div>

      {saveError && <ErrorAlert message={saveError} onDismiss={onDismissError} />}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
