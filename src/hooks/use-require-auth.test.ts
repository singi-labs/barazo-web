/**
 * Tests for useRequireAuth hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRequireAuth } from './use-require-auth'
import { useAuth } from '@/hooks/use-auth'

const mockToast = vi.fn()

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: vi.fn(),
  }),
}))

const mockedUseAuth = vi.mocked(useAuth)

beforeEach(() => {
  vi.clearAllMocks()
  // Default: logged out
  mockedUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    crossPostScopesGranted: false,
    getAccessToken: vi.fn(() => null),
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    requestCrossPostAuth: vi.fn(),
    authFetch: vi.fn(),
  })
})

describe('useRequireAuth', () => {
  it('shows login toast when not authenticated', () => {
    const { result } = renderHook(() => useRequireAuth())
    const action = vi.fn()

    act(() => {
      result.current.requireAuth(action)
    })

    expect(action).not.toHaveBeenCalled()
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Login required',
        description: 'You need to log in before you can perform this action.',
      })
    )
  })

  it('includes login action in toast', () => {
    const { result } = renderHook(() => useRequireAuth())

    act(() => {
      result.current.requireAuth(vi.fn())
    })

    expect(mockToast.mock.calls[0]).toBeDefined()
    const toastArg = mockToast.mock.calls[0]![0] as {
      action?: { label: string; altText: string; onClick: () => void }
    }
    expect(toastArg.action).toBeDefined()
    expect(toastArg.action?.label).toBe('Log in')
  })

  it('executes action when authenticated', () => {
    mockedUseAuth.mockReturnValue({
      user: {
        did: 'did:plc:test',
        handle: 'test.bsky.social',
        displayName: null,
        avatarUrl: null,
        role: 'user' as const,
      },
      isAuthenticated: true,
      isLoading: false,
      crossPostScopesGranted: false,
      getAccessToken: vi.fn(() => 'mock-token'),
      login: vi.fn(),
      logout: vi.fn(),
      setSessionFromCallback: vi.fn(),
      requestCrossPostAuth: vi.fn(),
      authFetch: vi.fn(),
    })

    const { result } = renderHook(() => useRequireAuth())
    const action = vi.fn()

    act(() => {
      result.current.requireAuth(action)
    })

    expect(action).toHaveBeenCalled()
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('exposes isAuthenticated from auth context', () => {
    const { result } = renderHook(() => useRequireAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })
})
