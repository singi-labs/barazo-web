/**
 * Admin trust seeds page.
 * URL: /admin/trust-seeds
 * Manage trust seeds for the EigenTrust algorithm.
 * @see specs/prd-web.md Section P2.10
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { getTrustSeeds, createTrustSeed, deleteTrustSeed } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { TrustSeed } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// --- Confirm Dialog ---
function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h3 id="confirm-dialog-title" className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p id="confirm-dialog-message" className="mt-2 text-sm text-muted-foreground">
          {message}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Add Seed Dialog ---
function AddSeedDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: { handle: string; communityId?: string; reason?: string }) => void
}) {
  const [handle, setHandle] = useState('')
  const [reason, setReason] = useState('')
  const handleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      handleRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!handle.trim()) return
    onSubmit({
      handle: handle.trim(),
      reason: reason.trim() || undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Add trust seed"
    >
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Add Trust Seed</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="seed-handle" className="block text-sm font-medium text-foreground">
              Handle
            </label>
            <input
              ref={handleRef}
              id="seed-handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="user.bsky.social"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          <div>
            <label htmlFor="seed-reason" className="block text-sm font-medium text-foreground">
              Reason
            </label>
            <input
              id="seed-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional: why this account is trusted"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// --- Type Badge ---
function TypeBadge({ implicit }: { implicit: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
        implicit ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
      )}
    >
      {implicit ? 'Automatic' : 'Manual'}
    </span>
  )
}

// --- Main Page ---
export default function AdminTrustSeedsPage() {
  const { getAccessToken } = useAuth()
  const [seeds, setSeeds] = useState<TrustSeed[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addDialogKey, setAddDialogKey] = useState(0)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  const fetchData = useCallback(async () => {
    setLoadError(null)
    setLoading(true)
    try {
      const res = await getTrustSeeds(getAccessToken() ?? '')
      setSeeds(res.seeds)
    } catch {
      setLoadError('Failed to load trust seeds. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleAddSeed = async (data: { handle: string; communityId?: string; reason?: string }) => {
    setActionError(null)
    try {
      const newSeed = await createTrustSeed(data, getAccessToken() ?? '')
      setSeeds((prev) => [...prev, newSeed])
      setAddDialogOpen(false)
    } catch {
      setActionError('Failed to add trust seed.')
    }
  }

  const handleRemoveSeed = (seed: TrustSeed) => {
    setConfirmAction({
      title: 'Remove trust seed',
      message: `Are you sure you want to remove ${seed.handle} as a trust seed?`,
      onConfirm: async () => {
        setConfirmAction(null)
        setActionError(null)
        try {
          await deleteTrustSeed(seed.id, getAccessToken() ?? '')
          setSeeds((prev) => prev.filter((s) => s.id !== seed.id))
        } catch {
          setActionError('Failed to remove trust seed.')
        }
      },
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trust Seeds</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trusted accounts that anchor the EigenTrust computation. Manual seeds are explicitly
            added by admins. Automatic seeds are derived from moderators and admins.
          </p>
        </div>

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchData()} />
        )}

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

        {!loading && !loadError && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Seeds ({seeds.length})</h2>
              <button
                type="button"
                onClick={() => {
                  setAddDialogKey((k) => k + 1)
                  setAddDialogOpen(true)
                }}
                aria-label="Add trust seed"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Add Trust Seed
              </button>
            </div>

            <div className="space-y-2">
              {seeds.map((seed) => (
                <article key={seed.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{seed.handle}</span>
                        <TypeBadge implicit={seed.implicit} />
                        {seed.communityId ? (
                          <span className="text-xs text-muted-foreground">Scoped</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Global</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {seed.displayName}
                        {seed.reason && <> &middot; {seed.reason}</>}
                        {' &middot; Added '}
                        {formatDate(seed.createdAt)}
                      </p>
                    </div>
                    {!seed.implicit && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSeed(seed)}
                        aria-label="Remove"
                        className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </article>
              ))}
              {seeds.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">No trust seeds configured.</p>
              )}
            </div>
          </>
        )}

        {/* Add Seed Dialog */}
        <AddSeedDialog
          key={addDialogKey}
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onSubmit={(data) => void handleAddSeed(data)}
        />

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmAction !== null}
          title={confirmAction?.title ?? ''}
          message={confirmAction?.message ?? ''}
          onConfirm={() => confirmAction?.onConfirm()}
          onCancel={() => setConfirmAction(null)}
        />
      </div>
    </AdminLayout>
  )
}
