/**
 * Tests for auth callback page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import CallbackPage from '@/app/auth/callback/page'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

const mockSetSessionFromCallback = vi.fn()

let mockSearchParams = new URLSearchParams('code=test-code&state=test-state')

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
    mockSearchParams = new URLSearchParams('code=test-code&state=test-state')
  })

  it('shows loading spinner while processing', () => {
    // Override callback to never resolve
    server.use(
      http.get(`${API_URL}/api/auth/callback`, () => {
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

  it('shows error when code or state is missing', () => {
    mockSearchParams = new URLSearchParams('')
    render(<CallbackPage />)
    expect(screen.getByRole('alert')).toHaveTextContent(/missing authorization code or state/i)
  })

  it('shows error on API failure', async () => {
    server.use(
      http.get(`${API_URL}/api/auth/callback`, () => {
        return HttpResponse.json({ error: 'Invalid code' }, { status: 400 })
      })
    )

    render(<CallbackPage />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('shows retry link on error', async () => {
    server.use(
      http.get(`${API_URL}/api/auth/callback`, () => {
        return HttpResponse.json({ error: 'Failed' }, { status: 500 })
      })
    )

    render(<CallbackPage />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /try again/i })).toHaveAttribute('href', '/login')
    })
  })
})
