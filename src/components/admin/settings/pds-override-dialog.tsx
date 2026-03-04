/**
 * PdsOverrideDialog - Form dialog for adding/editing PDS trust factor overrides.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { FormLabel } from '@/components/ui/form-label'

interface PdsOverrideDialogProps {
  open: boolean
  mode: 'add' | 'edit'
  initialHostname: string
  initialTrustFactor: number
  onClose: () => void
  onSubmit: (hostname: string, trustFactor: number) => void
}

export function PdsOverrideDialog({
  open,
  mode,
  initialHostname,
  initialTrustFactor,
  onClose,
  onSubmit,
}: PdsOverrideDialogProps) {
  const [hostname, setHostname] = useState(initialHostname)
  const [trustFactor, setTrustFactor] = useState(initialTrustFactor)
  const hostnameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && mode === 'add') {
      hostnameRef.current?.focus()
    }
  }, [open, mode])

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
    if (mode === 'add' && !hostname.trim()) return
    onSubmit(hostname.trim(), trustFactor)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'add' ? 'Add PDS trust override' : 'Edit PDS trust factor'}
    >
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">
          {mode === 'add' ? 'Add PDS Override' : 'Edit Trust Factor'}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <FormLabel htmlFor="pds-hostname" required>
              PDS Hostname
            </FormLabel>
            <input
              ref={hostnameRef}
              id="pds-hostname"
              type="text"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              disabled={mode === 'edit'}
              placeholder="my-pds.example.org"
              className={cn(
                'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                mode === 'edit' && 'cursor-not-allowed opacity-60'
              )}
              required
            />
          </div>
          <div>
            <FormLabel htmlFor="pds-trust-factor" required>
              Trust Factor: {trustFactor.toFixed(1)}
            </FormLabel>
            <input
              id="pds-trust-factor"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={trustFactor}
              onChange={(e) => setTrustFactor(parseFloat(e.target.value))}
              className="mt-1 w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>0.0 (untrusted)</span>
              <span>1.0 (fully trusted)</span>
            </div>
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
              {mode === 'add' ? 'Add' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
