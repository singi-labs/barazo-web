/**
 * Hook to access auth context.
 * Throws if used outside AuthProvider.
 * @see specs/prd-web.md Section M3 (Auth Flow)
 */

'use client'

import { useContext } from 'react'
import { AuthContext } from '@/context/auth-context'
import type { AuthContextValue } from '@/context/auth-context'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
