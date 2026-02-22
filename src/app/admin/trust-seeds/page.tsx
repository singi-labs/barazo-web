/**
 * Admin trust seeds page.
 * URL: /admin/trust-seeds
 * Manage trust seeds for the EigenTrust algorithm.
 * @see specs/prd-web.md Section P2.10
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AddSeedDialog } from '@/components/admin/trust-seeds/add-seed-dialog'
import { TrustSeedCard } from '@/components/admin/trust-seeds/trust-seed-card'
import { getTrustSeeds, createTrustSeed, deleteTrustSeed } from '@/lib/api/client'
import type { TrustSeed } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

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
    description: string
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
      description: `Are you sure you want to remove ${seed.handle} as a trust seed?`,
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
                <TrustSeedCard key={seed.id} seed={seed} onRemove={handleRemoveSeed} />
              ))}
              {seeds.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">No trust seeds configured.</p>
              )}
            </div>
          </>
        )}

        <AddSeedDialog
          key={addDialogKey}
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onSubmit={(data) => void handleAddSeed(data)}
        />

        <ConfirmDialog
          open={confirmAction !== null}
          title={confirmAction?.title ?? ''}
          description={confirmAction?.description ?? ''}
          variant="destructive"
          onConfirm={() => confirmAction?.onConfirm()}
          onCancel={() => setConfirmAction(null)}
        />
      </div>
    </AdminLayout>
  )
}
