/**
 * Tests for edit topic page.
 */

import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'
import EditTopicPage from './page'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock useAuth hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    getAccessToken: () => null,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
  }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  notFound: vi.fn(),
  redirect: vi.fn(),
}))

describe('EditTopicPage', () => {
  it('renders edit topic heading', async () => {
    render(<EditTopicPage params={{ slug: 'welcome-to-barazo-forums', rkey: '3kf1abc' }} />)
    expect(await screen.findByRole('heading', { name: 'Edit Topic' })).toBeInTheDocument()
  })

  it('pre-populates form with topic data', async () => {
    render(<EditTopicPage params={{ slug: 'welcome-to-barazo-forums', rkey: '3kf1abc' }} />)
    expect(await screen.findByDisplayValue('Welcome to Barazo Forums')).toBeInTheDocument()
  })

  it('shows save button', async () => {
    render(<EditTopicPage params={{ slug: 'welcome-to-barazo-forums', rkey: '3kf1abc' }} />)
    expect(await screen.findByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })
})
