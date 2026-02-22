/**
 * PdsTrustSection - PDS Provider Trust management with add/edit/remove.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PdsOverrideDialog } from '@/components/admin/settings/pds-override-dialog'
import type { PdsTrustFactor } from '@/lib/api/types'

interface PdsTrustSectionProps {
  providers: PdsTrustFactor[]
  onUpdate: (pdsHost: string, trustFactor: number) => void
  onRemove: (pdsHost: string) => void
}

export function PdsTrustSection({ providers, onUpdate, onRemove }: PdsTrustSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editHostname, setEditHostname] = useState('')
  const [editTrustFactor, setEditTrustFactor] = useState(1.0)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const handleAdd = () => {
    setDialogMode('add')
    setEditHostname('')
    setEditTrustFactor(1.0)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  const handleEdit = (provider: PdsTrustFactor) => {
    setDialogMode('edit')
    setEditHostname(provider.pdsHost)
    setEditTrustFactor(provider.trustFactor)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  const handleDialogSubmit = (hostname: string, trustFactor: number) => {
    onUpdate(hostname, trustFactor)
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">PDS Provider Trust</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Accounts from providers with higher trust factors earn reputation faster. Override the
            default if you trust a specific self-hosted PDS provider.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          aria-label="Add override"
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Add Override
        </button>
      </div>

      <div className="space-y-2">
        {providers.map((provider) => (
          <div
            key={provider.pdsHost}
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{provider.pdsHost}</span>
                {provider.isDefault && (
                  <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Trust factor: {provider.trustFactor.toFixed(1)}
              </p>
            </div>
            {!provider.isDefault && (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(provider)}
                  aria-label="Edit"
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(provider.pdsHost)}
                  aria-label="Remove"
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
        {providers.length === 0 && (
          <p className="py-4 text-center text-muted-foreground">No PDS providers configured.</p>
        )}
      </div>

      <PdsOverrideDialog
        key={dialogKey}
        open={dialogOpen}
        mode={dialogMode}
        initialHostname={editHostname}
        initialTrustFactor={editTrustFactor}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
      />

      <ConfirmDialog
        open={confirmRemove !== null}
        title="Remove PDS override"
        description={`Are you sure you want to remove the trust override for ${confirmRemove ?? ''}? The default trust factor will apply.`}
        confirmLabel="Confirm"
        variant="destructive"
        onConfirm={() => {
          if (confirmRemove) onRemove(confirmRemove)
          setConfirmRemove(null)
        }}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  )
}
