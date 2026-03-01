/**
 * UserBlockList - handle-based blocked user management.
 * Displays blocked users as chips with avatars and allows adding/removing.
 */

'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import { User, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { AuthorProfile } from '@/lib/api/types'

interface UserBlockListProps {
  users: AuthorProfile[]
  onAdd: (handle: string) => Promise<void>
  onRemove: (did: string) => void
  label: string
  description: string
}

export function UserBlockList({
  users,
  onAdd,
  onRemove,
  label,
  description,
}: UserBlockListProps) {
  const instanceId = useId()
  const errorId = `block-error-${instanceId}`
  const [handleInput, setHandleInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    const handle = handleInput.trim()
    if (!handle) return

    setLoading(true)
    setError(null)
    try {
      await onAdd(handle)
      setHandleInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve handle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <p className="text-xs text-muted-foreground">{description}</p>

      {users.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={`${label} list`}>
          {users.map((user) => (
            <li key={user.did}>
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 py-1 pl-1 pr-2 text-sm">
                <div className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="20px"
                    />
                  ) : (
                    <User size={12} className="text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <span className="max-w-[200px] truncate text-foreground">
                  {user.displayName ? (
                    <>
                      <span className="font-medium">{user.displayName}</span>{' '}
                      <span className="text-muted-foreground">@{user.handle}</span>
                    </>
                  ) : (
                    <span className="font-medium">@{user.handle}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(user.did)}
                  className={cn(
                    'ml-0.5 flex h-4 w-4 items-center justify-center rounded-full',
                    'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                  aria-label={`Unblock ${user.displayName ?? user.handle}`}
                >
                  <X size={10} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {users.length === 0 && (
        <p className="text-xs italic text-muted-foreground">No users blocked.</p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={handleInput}
          onChange={(e) => {
            setHandleInput(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="Add user by handle (e.g. jay.bsky.team)"
          disabled={loading}
          className={cn(
            'flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive'
          )}
          aria-label="Handle to block"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading || !handleInput.trim()}
          className={cn(
            'rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground',
            'hover:bg-primary-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {loading ? 'Adding...' : 'Block'}
        </button>
      </div>

      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
