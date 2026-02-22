/**
 * SettingsField - Dynamic form field renderer for plugin settings schemas.
 * Handles boolean, select, number, and string types.
 * @see specs/prd-web.md Section M13
 */

import type { PluginSettingsSchema } from '@/lib/api/types'

interface SettingsFieldProps {
  fieldKey: string
  schema: PluginSettingsSchema[string]
  value: boolean | string | number
  onChange: (value: boolean | string | number) => void
}

export function SettingsField({ fieldKey, schema, value, onChange }: SettingsFieldProps) {
  if (schema.type === 'boolean') {
    return (
      <label className="flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-foreground">{schema.label}</span>
          {schema.description && (
            <p className="text-xs text-muted-foreground">{schema.description}</p>
          )}
        </div>
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
      </label>
    )
  }

  if (schema.type === 'select') {
    return (
      <label className="block">
        <span className="text-sm font-medium text-foreground">{schema.label}</span>
        {schema.description && (
          <p className="text-xs text-muted-foreground">{schema.description}</p>
        )}
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        >
          {schema.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt || '(none)'}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (schema.type === 'number') {
    return (
      <label className="block">
        <span className="text-sm font-medium text-foreground">{schema.label}</span>
        {schema.description && (
          <p className="text-xs text-muted-foreground">{schema.description}</p>
        )}
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
          name={fieldKey}
        />
      </label>
    )
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{schema.label}</span>
      {schema.description && <p className="text-xs text-muted-foreground">{schema.description}</p>}
      <input
        type="text"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        name={fieldKey}
      />
    </label>
  )
}
