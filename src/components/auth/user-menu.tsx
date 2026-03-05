/**
 * User menu -- header dropdown for authenticated users, login button for guests.
 * Uses Radix DropdownMenu (via shadcn/ui).
 * @see specs/prd-web.md Section M3 (Auth Flow)
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User, SignOut, GearSix, ShieldCheck } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className={cn(
          'inline-flex items-center whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors sm:px-3',
          'hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
      >
        Log in
      </Link>
    )
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground ring-offset-background transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="User menu"
        >
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt="" fill className="object-cover" />
          ) : (
            <User size={16} weight="bold" aria-hidden="true" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          {user.displayName && (
            <p className="text-sm font-medium text-foreground">{user.displayName}</p>
          )}
          <p className="text-xs text-muted-foreground">@{user.handle}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/profile/${encodeURIComponent(user.handle)}`} className="flex items-center gap-2">
            <User size={16} aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <GearSix size={16} aria-hidden="true" />
            Account settings
          </Link>
        </DropdownMenuItem>

        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <ShieldCheck size={16} aria-hidden="true" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => void handleLogout()}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <SignOut size={16} aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
