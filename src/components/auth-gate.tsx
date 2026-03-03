/**
 * AuthGate - Sign-in prompt for unauthenticated users.
 * Replaces interactive elements (composer, new topic button).
 */

import Link from 'next/link'
import { SignIn } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

interface AuthGateProps {
  message: string
  className?: string
}

export function AuthGate({ message, className }: AuthGateProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex items-center justify-center gap-3 py-3">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link
          href="/login"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors',
            'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          <SignIn className="h-4 w-4" weight="bold" aria-hidden="true" />
          Sign in
        </Link>
      </div>
    </div>
  )
}
