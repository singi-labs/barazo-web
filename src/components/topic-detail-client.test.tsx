/**
 * Tests for TopicDetailClient component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { TopicDetailClient } from './topic-detail-client'
import { mockTopics, mockReplies } from '@/mocks/data'

const mockRouterRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRouterRefresh,
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Default: authenticated user
const mockUseAuth = vi.fn(() => ({
  isAuthenticated: true,
  isLoading: false,
  user: {
    did: 'did:plc:user-test-001',
    handle: 'test.bsky.social',
    displayName: 'Test User',
    avatarUrl: null,
  } as Record<string, unknown> | null,
  getAccessToken: (() => 'mock-access-token') as () => string | null,
  login: vi.fn(),
  logout: vi.fn(),
  setSessionFromCallback: vi.fn(),
  authFetch: vi.fn(),
  crossPostScopesGranted: false,
  requestCrossPostAuth: vi.fn(),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
  }),
}))

vi.mock('@/lib/api/client', () => ({
  createReply: vi.fn().mockResolvedValue({
    uri: 'at://did:plc:user-test-001/forum.barazo.reply/789',
    cid: 'bafyrei789',
    content: 'Test reply',
    authorDid: 'did:plc:user-test-001',
  }),
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

// Mock next/image to render a plain img
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src as string} alt={alt as string} {...props} />
  ),
}))

const topic = mockTopics[0]!
const replies = mockReplies.slice(0, 3)

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: {
      did: 'did:plc:user-test-001',
      handle: 'test.bsky.social',
      displayName: 'Test User',
      avatarUrl: null,
    } as Record<string, unknown> | null,
    getAccessToken: (() => 'mock-access-token') as () => string | null,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
    crossPostScopesGranted: false,
    requestCrossPostAuth: vi.fn(),
  })
})

describe('TopicDetailClient', () => {
  describe('reply thread rendering', () => {
    it('renders ReplyThread with replies', () => {
      render(<TopicDetailClient topic={topic} replies={replies} />)
      for (const reply of replies) {
        expect(screen.getByText(reply.content)).toBeInTheDocument()
      }
    })

    it('renders reply count heading', () => {
      render(<TopicDetailClient topic={topic} replies={replies} />)
      expect(
        screen.getByRole('heading', { level: 2, name: `${replies.length} Replies` })
      ).toBeInTheDocument()
    })

    it('renders empty state when no replies', () => {
      render(<TopicDetailClient topic={topic} replies={[]} />)
      expect(screen.getByText(/no replies yet/i)).toBeInTheDocument()
    })
  })

  describe('authenticated state', () => {
    it('shows ReplyComposer when authenticated', () => {
      render(<TopicDetailClient topic={topic} replies={replies} />)
      expect(screen.getByText('Write a reply...')).toBeInTheDocument()
    })

    it('shows reply buttons on reply cards when authenticated', () => {
      render(<TopicDetailClient topic={topic} replies={replies} />)
      const replyButtons = screen.getAllByRole('button', { name: /reply to/i })
      expect(replyButtons.length).toBeGreaterThan(0)
    })
  })

  describe('unauthenticated state', () => {
    it('shows AuthGate when not authenticated', () => {
      mockUseAuth.mockReturnValueOnce({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        getAccessToken: () => null,
        login: vi.fn(),
        logout: vi.fn(),
        setSessionFromCallback: vi.fn(),
        authFetch: vi.fn(),
        crossPostScopesGranted: false,
        requestCrossPostAuth: vi.fn(),
      })

      render(<TopicDetailClient topic={topic} replies={replies} />)
      expect(screen.getByText('Sign in to join the discussion')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
    })

    it('does not show ReplyComposer when not authenticated', () => {
      mockUseAuth.mockReturnValueOnce({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        getAccessToken: () => null,
        login: vi.fn(),
        logout: vi.fn(),
        setSessionFromCallback: vi.fn(),
        authFetch: vi.fn(),
        crossPostScopesGranted: false,
        requestCrossPostAuth: vi.fn(),
      })

      render(<TopicDetailClient topic={topic} replies={replies} />)
      expect(screen.queryByText('Write a reply...')).not.toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows neither composer nor auth gate while loading', () => {
      mockUseAuth.mockReturnValueOnce({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        getAccessToken: () => null,
        login: vi.fn(),
        logout: vi.fn(),
        setSessionFromCallback: vi.fn(),
        authFetch: vi.fn(),
        crossPostScopesGranted: false,
        requestCrossPostAuth: vi.fn(),
      })

      render(<TopicDetailClient topic={topic} replies={replies} />)
      expect(screen.queryByText('Write a reply...')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign in to join the discussion')).not.toBeInTheDocument()
    })
  })

  describe('reply targeting', () => {
    it('sets reply target when reply button is clicked on a reply card', async () => {
      const user = userEvent.setup()
      render(<TopicDetailClient topic={topic} replies={replies} />)

      const replyButtons = screen.getAllByRole('button', { name: /reply to/i })
      await user.click(replyButtons[0]!)

      // The composer should expand and show the reply target banner
      const firstReply = replies[0]!
      const expectedHandle = firstReply.author?.handle ?? firstReply.authorDid
      expect(screen.getByText(`Replying to @${expectedHandle}`)).toBeInTheDocument()
    })

    it('clears reply target when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      render(<TopicDetailClient topic={topic} replies={replies} />)

      // Click reply to set a target
      const replyButtons = screen.getAllByRole('button', { name: /reply to/i })
      await user.click(replyButtons[0]!)

      const firstReply = replies[0]!
      const expectedHandle = firstReply.author?.handle ?? firstReply.authorDid
      expect(screen.getByText(`Replying to @${expectedHandle}`)).toBeInTheDocument()

      // Click dismiss
      await user.click(screen.getByRole('button', { name: 'Dismiss reply target' }))
      expect(screen.queryByText(`Replying to @${expectedHandle}`)).not.toBeInTheDocument()
    })
  })

  describe('locked topic', () => {
    it('hides reply buttons when topic is locked', () => {
      render(<TopicDetailClient topic={topic} replies={replies} isLocked />)
      expect(screen.queryByRole('button', { name: /reply to/i })).not.toBeInTheDocument()
    })

    it('shows locked notice in composer when topic is locked', () => {
      render(<TopicDetailClient topic={topic} replies={replies} isLocked />)
      expect(
        screen.getByText('This topic is locked. New replies are not accepted.')
      ).toBeInTheDocument()
    })

    it('still renders replies when topic is locked', () => {
      render(<TopicDetailClient topic={topic} replies={replies} isLocked />)
      for (const reply of replies) {
        expect(screen.getByText(reply.content)).toBeInTheDocument()
      }
    })
  })

  describe('accessibility', () => {
    it('passes axe accessibility check when authenticated', async () => {
      const { container } = render(
        <TopicDetailClient topic={topic} replies={replies} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('passes axe accessibility check when not authenticated', async () => {
      mockUseAuth.mockReturnValueOnce({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        getAccessToken: () => null,
        login: vi.fn(),
        logout: vi.fn(),
        setSessionFromCallback: vi.fn(),
        authFetch: vi.fn(),
        crossPostScopesGranted: false,
        requestCrossPostAuth: vi.fn(),
      })

      const { container } = render(
        <TopicDetailClient topic={topic} replies={replies} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('passes axe accessibility check when locked', async () => {
      const { container } = render(
        <TopicDetailClient topic={topic} replies={replies} isLocked />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
