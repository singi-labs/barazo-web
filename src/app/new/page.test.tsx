/**
 * Tests for new topic page.
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterAll, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'
import { createMockOnboardingContext } from '@/test/mock-onboarding'
import NewTopicPage from './page'

vi.mock('@/context/onboarding-context', () => ({
  useOnboardingContext: () => createMockOnboardingContext(),
}))

const server = setupServer(...handlers)

const mockStorage: Record<string, string> = {}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => mockStorage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key]
    }),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  })
  mockStorage['accessToken'] = 'test-token'
})
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      did: 'did:plc:user-jay-001',
      handle: 'jay.bsky.team',
      displayName: 'Jay',
      avatarUrl: null,
    },
    isAuthenticated: true,
    isLoading: false,
    getAccessToken: () => 'mock-access-token',
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
  }),
}))

describe('NewTopicPage', () => {
  it('renders create topic heading', () => {
    render(<NewTopicPage />)
    expect(screen.getByRole('heading', { name: 'Create new topic' })).toBeInTheDocument()
  })

  it('renders topic form', () => {
    render(<NewTopicPage />)
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Content' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Topic' })).toBeInTheDocument()
  })

  it('renders breadcrumbs', () => {
    render(<NewTopicPage />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('New topic')).toBeInTheDocument()
  })
})
