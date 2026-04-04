/**
 * Tests for edit topic page.
 */

import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'
import EditTopicPage from './page'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Configurable useAuth mock (vi.fn() pattern)
const mockUseAuth = vi.fn(() => ({
  user: {
    did: 'did:plc:user-jay-001',
    handle: 'jay.bsky.team',
    displayName: 'Jay',
    avatarUrl: null,
  } as Record<string, unknown> | null,
  isAuthenticated: true,
  isLoading: false,
  getAccessToken: (() => 'mock-access-token') as () => string | null,
  login: vi.fn(),
  logout: vi.fn(),
  setSessionFromCallback: vi.fn(),
  authFetch: vi.fn(),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
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

// Mock next/link to render a plain anchor
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

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({
    user: {
      did: 'did:plc:user-jay-001',
      handle: 'jay.bsky.team',
      displayName: 'Jay',
      avatarUrl: null,
    } as Record<string, unknown> | null,
    isAuthenticated: true,
    isLoading: false,
    getAccessToken: (() => 'mock-access-token') as () => string | null,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
  })
})

describe('EditTopicPage', () => {
  it('renders edit topic heading', async () => {
    render(<EditTopicPage params={{ handle: 'jay.bsky.team', rkey: '3kf1abc' }} />)
    expect(await screen.findByRole('heading', { name: 'Edit topic' })).toBeInTheDocument()
  })

  it('pre-populates form with topic data', async () => {
    render(<EditTopicPage params={{ handle: 'jay.bsky.team', rkey: '3kf1abc' }} />)
    expect(await screen.findByDisplayValue('Welcome to Barazo Forums')).toBeInTheDocument()
  })

  it('shows save button', async () => {
    render(<EditTopicPage params={{ handle: 'jay.bsky.team', rkey: '3kf1abc' }} />)
    expect(await screen.findByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('renders edit form when user DID matches topic authorDid', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        did: 'did:plc:user-jay-001',
        handle: 'jay.bsky.team',
        displayName: 'Jay',
        avatarUrl: null,
      } as Record<string, unknown> | null,
      isAuthenticated: true,
      isLoading: false,
      getAccessToken: (() => 'mock-access-token') as () => string | null,
      login: vi.fn(),
      logout: vi.fn(),
      setSessionFromCallback: vi.fn(),
      authFetch: vi.fn(),
    })

    render(<EditTopicPage params={{ handle: 'jay.bsky.team', rkey: '3kf1abc' }} />)
    expect(await screen.findByRole('heading', { name: 'Edit topic' })).toBeInTheDocument()
  })

  it('renders "You can only edit your own posts" when user DID does not match topic authorDid', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        did: 'did:plc:user-other-999',
        handle: 'other.bsky.social',
        displayName: 'Other User',
        avatarUrl: null,
      } as Record<string, unknown> | null,
      isAuthenticated: true,
      isLoading: false,
      getAccessToken: (() => 'mock-access-token') as () => string | null,
      login: vi.fn(),
      logout: vi.fn(),
      setSessionFromCallback: vi.fn(),
      authFetch: vi.fn(),
    })

    render(<EditTopicPage params={{ handle: 'jay.bsky.team', rkey: '3kf1abc' }} />)
    expect(await screen.findByText('You can only edit your own posts.')).toBeInTheDocument()
  })

  it('renders "You can only edit your own posts" when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null as Record<string, unknown> | null,
      isAuthenticated: false,
      isLoading: false,
      getAccessToken: (() => null) as () => string | null,
      login: vi.fn(),
      logout: vi.fn(),
      setSessionFromCallback: vi.fn(),
      authFetch: vi.fn(),
    })

    render(<EditTopicPage params={{ handle: 'jay.bsky.team', rkey: '3kf1abc' }} />)
    expect(await screen.findByText('You can only edit your own posts.')).toBeInTheDocument()
  })

  it('shows error when getAccessToken returns null on submit', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: {
        did: 'did:plc:user-jay-001',
        handle: 'jay.bsky.team',
        displayName: 'Jay',
        avatarUrl: null,
      } as Record<string, unknown> | null,
      isAuthenticated: true,
      isLoading: false,
      getAccessToken: (() => null) as () => string | null,
      login: vi.fn(),
      logout: vi.fn(),
      setSessionFromCallback: vi.fn(),
      authFetch: vi.fn(),
    })

    render(<EditTopicPage params={{ handle: 'jay.bsky.team', rkey: '3kf1abc' }} />)
    const saveButton = await screen.findByRole('button', { name: 'Save Changes' })
    await user.click(saveButton)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('You must be logged in to edit a topic.')
    })
  })
})
