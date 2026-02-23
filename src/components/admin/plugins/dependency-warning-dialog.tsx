/**
 * DependencyWarningDialog - Warns when disabling a plugin that other plugins depend on.
 */

'use client'

import { WarningCircle } from '@phosphor-icons/react'

interface DependencyWarningDialogProps {
  pluginName: string
  dependents: string[]
  onConfirm: () => void
  onCancel: () => void
}

export function DependencyWarningDialog({
  pluginName,
  dependents,
  onConfirm,
  onCancel,
}: DependencyWarningDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="alertdialog"
      aria-modal="true"
      aria-label="Dependency warning"
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-3 flex items-center gap-2 text-destructive">
          <WarningCircle size={20} aria-hidden="true" />
          <h2 className="font-semibold">Dependency Warning</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Disabling <strong>{pluginName}</strong> will affect the following plugins that depend on
          it: <strong>{dependents.join(', ')}</strong>
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Disable Anyway
          </button>
        </div>
      </div>
    </div>
  )
}
