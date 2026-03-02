/**
 * AddSeedDialog - Modal dialog for adding a new trust seed.
 * @see specs/prd-web.md Section P2.10
 */

'use client'

import { useState, useEffect, useRef } from 'react'

interface AddSeedDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { handle: string; communityId?: string; reason?: string }) => void
}

export function AddSeedDialog({ open, onClose, onSubmit }: AddSeedDialogProps) {
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
        <h3 className="text-lg font-semibold text-foreground">Add trust seed</h3>
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
