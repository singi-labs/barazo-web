/**
 * Shared test utility for mocking auth context.
 * Use mockAuthContext() to get a vi.mock factory for @/hooks/use-auth,
 * and wrapWithAuth() to render components inside an AuthProvider mock.
 */

import { vi } from 'vitest'
import type { AuthContextValue } from '@/context/auth-context'
import type { AuthUser } from '@/lib/api/types'

export const mockUser: AuthUser = {
  did: 'did:plc:user-alice-001',
  handle: 'alice.bsky.social',
  displayName: 'Alice',
  avatarUrl: 'https://cdn.bsky.social/avatar/alice.jpg',
  role: 'user',
}

export function createMockAuthContext(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    crossPostScopesGranted: false,
    getAccessToken: vi.fn(() => 'mock-access-token'),
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    requestCrossPostAuth: vi.fn(),
    authFetch: vi.fn(),
    ...overrides,
  }
}

export function createUnauthenticatedMockAuthContext(
  overrides: Partial<AuthContextValue> = {}
): AuthContextValue {
  return {
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
    ...overrides,
  }
}
