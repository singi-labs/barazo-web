/**
 * Tests for auth callback page.
 * The callback page receives ?success=true after API redirects from PDS OAuth.
 * It then calls POST /api/auth/refresh (using the HTTP-only cookie set by API)
 * to get the access token, stores it in memory via setSessionFromCallback,
 * and redirects to the returnTo path.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import CallbackPage from '@/app/auth/callback/page'

const API_URL = ''

const mockSetSessionFromCallback = vi.fn()

let mockSearchParams = new URLSearchParams('success=true')

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    setSessionFromCallback: mockSetSessionFromCallback,
  }),
}))

// Mock sessionStorage
const mockSessionStorage: Record<string, string> = {}
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: (key: string) => mockSessionStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockSessionStorage[key] = value
    },
    removeItem: (key: string) => {
      delete mockSessionStorage[key]
    },
  },
  writable: true,
})

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    mockSetSessionFromCallback.mockClear()
    mockSearchParams = new URLSearchParams('success=true')
  })

  it('shows loading spinner while processing', () => {
    // Override refresh to never resolve so we can see the spinner
    server.use(
      http.post(`${API_URL}/api/auth/refresh`, () => {
        return new Promise(() => {})
      })
    )
    render(<CallbackPage />)
    expect(screen.getByText(/completing login/i)).toBeInTheDocument()
  })

  it('calls setSessionFromCallback on success', async () => {
    render(<CallbackPage />)
    await waitFor(() => {
      expect(mockSetSessionFromCallback).toHaveBeenCalled()
    })
  })

  it('shows error when success or error param is missing', () => {
    mockSearchParams = new URLSearchParams('')
    render(<CallbackPage />)
    expect(screen.getByRole('alert')).toHaveTextContent(/missing authorization parameters/i)
  })

  it('shows error from error search param', () => {
    mockSearchParams = new URLSearchParams('error=OAuth+callback+failed')
    render(<CallbackPage />)
    expect(screen.getByRole('alert')).toHaveTextContent(/oauth callback failed/i)
  })

  it('shows error on API failure', async () => {
    server.use(
      http.post(`${API_URL}/api/auth/refresh`, () => {
        return HttpResponse.json({ error: 'Session expired' }, { status: 401 })
      })
    )

    render(<CallbackPage />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('shows retry link on error', async () => {
    server.use(
      http.post(`${API_URL}/api/auth/refresh`, () => {
        return HttpResponse.json({ error: 'Failed' }, { status: 500 })
      })
    )

    render(<CallbackPage />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /try again/i })).toHaveAttribute('href', '/login')
    })
  })
})
