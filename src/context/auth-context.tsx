/**
 * Auth context provider for AT Protocol OAuth.
 * Access token held in useRef (memory only, never localStorage/sessionStorage).
 * Silent refresh on mount via HTTP-only cookie.
 * @see specs/prd-web.md Section M3 (Auth Flow)
 */

'use client'

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthSession, AuthUser } from '@/lib/api/types'
import {
  initiateLogin,
  initiateCrossPostAuth,
  refreshSession,
  logout as apiLogout,
} from '@/lib/api/client'
import { createAuthFetch } from '@/lib/api/auth-fetch'

export interface AuthContextValue {
  /** The current authenticated user, or null */
  user: AuthUser | null
  /** Whether the user is authenticated */
  isAuthenticated: boolean
  /** Whether auth state is still loading (initial refresh) */
  isLoading: boolean
  /** Whether the user has authorized cross-post scopes */
  crossPostScopesGranted: boolean
  /** Get the current access token (stable function ref) */
  getAccessToken: () => string | null
  /** Initiate login flow -- redirects to PDS OAuth */
  login: (handle: string) => Promise<void>
  /** Log out and clear auth state */
  logout: () => Promise<void>
  /** Set session from OAuth callback (stores token in memory) */
  setSessionFromCallback: (session: AuthSession) => void
  /** Initiate cross-post authorization flow (redirects to PDS OAuth with expanded scopes) */
  requestCrossPostAuth: () => Promise<void>
  /** Auth-aware fetch that auto-refreshes on 401 */
  authFetch: <T>(
    path: string,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      headers?: Record<string, string>
      body?: unknown
      signal?: AbortSignal
    }
  ) => Promise<T>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [crossPostScopesGranted, setCrossPostScopesGranted] = useState(false)
  const tokenRef = useRef<string | null>(null)

  const getAccessToken = useCallback(() => tokenRef.current, [])

  const setSession = useCallback((session: AuthSession) => {
    tokenRef.current = session.accessToken
    setUser({
      did: session.did,
      handle: session.handle,
      displayName: session.displayName,
      avatarUrl: session.avatarUrl,
    })
    setCrossPostScopesGranted(session.crossPostScopesGranted ?? false)
  }, [])

  const clearSession = useCallback(() => {
    tokenRef.current = null
    setUser(null)
    setCrossPostScopesGranted(false)
  }, [])

  const handleAuthFailure = useCallback(() => {
    clearSession()
  }, [clearSession])

  const authFetch = useMemo(
    () =>
      createAuthFetch({
        getToken: () => tokenRef.current,
        setToken: setSession,
        onAuthFailure: handleAuthFailure,
      }),
    [setSession, handleAuthFailure]
  )

  // Silent refresh on mount
  useEffect(() => {
    let cancelled = false

    async function attemptRefresh() {
      try {
        const session = await refreshSession()
        if (!cancelled) {
          setSession(session)
        }
      } catch {
        // No valid refresh cookie -- user is not logged in
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void attemptRefresh()
    return () => {
      cancelled = true
    }
  }, [setSession])

  const login = useCallback(async (handle: string) => {
    const { url } = await initiateLogin(handle)
    window.location.href = url
  }, [])

  const logout = useCallback(async () => {
    const token = tokenRef.current
    if (token) {
      try {
        await apiLogout(token)
      } catch {
        // Best-effort server-side logout
      }
    }
    clearSession()
  }, [clearSession])

  const requestCrossPostAuth = useCallback(async () => {
    const token = tokenRef.current
    if (!token) return
    sessionStorage.setItem('auth_returnTo', window.location.href)
    const { url } = await initiateCrossPostAuth(token)
    window.location.href = url
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      crossPostScopesGranted,
      getAccessToken,
      login,
      logout,
      setSessionFromCallback: setSession,
      requestCrossPostAuth,
      authFetch,
    }),
    [
      user,
      isLoading,
      crossPostScopesGranted,
      getAccessToken,
      login,
      logout,
      setSession,
      requestCrossPostAuth,
      authFetch,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
