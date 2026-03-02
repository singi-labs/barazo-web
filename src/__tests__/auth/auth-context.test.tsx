/**
 * Tests for AuthProvider and auth context.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider } from '@/context/auth-context'
import { useAuth } from '@/hooks/use-auth'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'

const API_URL = ''

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
    expect(screen.getByTestId('handle')).toHaveTextContent('jay.bsky.team')
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

describe('AuthProvider login flow', () => {
  it('redirects to OAuth URL from API response', async () => {
    const oauthUrl = 'https://bsky.social/oauth/authorize?client_id=test&request_uri=urn:test'

    server.use(
      http.get(`${API_URL}/api/auth/login`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('handle')).toBe('test.bsky.social')
        return HttpResponse.json({ url: oauthUrl })
      }),
      // Silent refresh fails (user not logged in)
      http.post(`${API_URL}/api/auth/refresh`, () => {
        return HttpResponse.json({ error: 'No session' }, { status: 401 })
      })
    )

    // Spy on window.location.href assignment
    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: 'http://localhost:3000/login',
    })
    const hrefSetter = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, href: 'http://localhost:3000/login' },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => 'http://localhost:3000/login',
      configurable: true,
    })

    function LoginTrigger() {
      const { login, isLoading } = useAuth()
      return (
        <button disabled={isLoading} onClick={() => void login('test.bsky.social')}>
          Login
        </button>
      )
    }

    render(
      <AuthProvider>
        <LoginTrigger />
      </AuthProvider>
    )

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    // Click login
    await act(async () => {
      screen.getByRole('button').click()
    })

    // Verify redirect to the OAuth URL from the API (not undefined, not redirectUrl)
    await waitFor(() => {
      expect(hrefSetter).toHaveBeenCalledWith(oauthUrl)
    })

    locationSpy.mockRestore()
  })
})

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<AuthDisplay />)).toThrow('useAuth must be used within an AuthProvider')
    consoleSpy.mockRestore()
  })
})
