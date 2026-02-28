'use client'

import { useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

/**
 * Returns a guard function that checks auth state before performing an action.
 * If the user is not authenticated, shows a toast prompting them to log in.
 * If authenticated, executes the callback.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const requireAuth = useCallback(
    (action: () => void | Promise<void>) => {
      if (!isAuthenticated) {
        toast({
          title: 'Login required',
          description: 'You need to log in before you can perform this action.',
          action: {
            label: 'Log in',
            altText: 'Go to login page',
            onClick: () => {
              window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`
            },
          },
        })
        return
      }
      void action()
    },
    [isAuthenticated, toast]
  )

  return { requireAuth, isAuthenticated }
}
