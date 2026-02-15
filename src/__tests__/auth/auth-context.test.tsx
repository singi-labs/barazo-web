/**
 * Tests for AuthProvider and auth context.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider } from '@/context/auth-context'
import { useAuth } from '@/hooks/use-auth'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

// Test component that exposes auth context values
function AuthDisplay() {
  const { user, isAuthenticated, isLoading } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="handle">{user?.handle ?? 'none'}</span>
    </div>
  )
}

function LogoutButton() {
  const { logout } = useAuth()
  return <button onClick={() => void logout()}>Logout</button>
}

describe('AuthProvider', () => {
  it('renders children', () => {
    render(
      <AuthProvider>
        <span>child content</span>
      </AuthProvider>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('starts in loading state', () => {
    // Override refresh to never resolve
    server.use(
      http.post(`${API_URL}/api/auth/refresh`, () => {
        return new Promise(() => {})
      })
    )
    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    )
    expect(screen.getByTestId('loading')).toHaveTextContent('true')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  it('authenticates after successful silent refresh', async () => {
    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('handle')).toHaveTextContent('alice.bsky.social')
  })

  it('stays unauthenticated when refresh fails', async () => {
    server.use(
      http.post(`${API_URL}/api/auth/refresh`, () => {
        return HttpResponse.json({ error: 'No session' }, { status: 401 })
      })
    )
    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('handle')).toHaveTextContent('none')
  })

  it('clears user on logout', async () => {
    render(
      <AuthProvider>
        <AuthDisplay />
        <LogoutButton />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    await act(async () => {
      screen.getByText('Logout').click()
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })
})

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<AuthDisplay />)).toThrow('useAuth must be used within an AuthProvider')
    consoleSpy.mockRestore()
  })
})
