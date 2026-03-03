/**
 * Tests for ReplyThread component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { ReplyThread } from './reply-thread'
import { mockReplies, mockTopics } from '@/mocks/data'
import { createMockOnboardingContext } from '@/test/mock-onboarding'

const TOPIC_URI = mockTopics[0]!.uri

// Mock onboarding context (required by LikeButton via ReplyCard)
vi.mock('@/context/onboarding-context', () => ({
  useOnboardingContext: () => createMockOnboardingContext(),
}))

// Mock useAuth (required by ReplyCard)
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    crossPostScopesGranted: false,
    getAccessToken: () => null,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    requestCrossPostAuth: vi.fn(),
    authFetch: vi.fn(),
  }),
}))

// Mock useToast (required by ReplyCard)
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn() }),
}))

// Mock updateReply (imported by ReplyCard)
vi.mock('@/lib/api/client', () => ({
  getReactions: vi.fn().mockResolvedValue({ reactions: [], cursor: null }),
  createReaction: vi.fn().mockResolvedValue({ uri: 'at://test', cid: 'bafyrei-test' }),
  deleteReaction: vi.fn().mockResolvedValue(undefined),
  updateReply: vi.fn(),
}))

describe('ReplyThread', () => {
  it('renders all replies', () => {
    render(<ReplyThread replies={mockReplies} topicUri={TOPIC_URI} />)
    for (const reply of mockReplies) {
      expect(screen.getByText(reply.content)).toBeInTheDocument()
    }
  })

  it('renders heading with reply count', () => {
    render(<ReplyThread replies={mockReplies} topicUri={TOPIC_URI} />)
    const heading = screen.getByRole('heading', {
      level: 2,
      name: `${mockReplies.length} Replies`,
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders empty state when no replies', () => {
    render(<ReplyThread replies={[]} topicUri={TOPIC_URI} />)
    expect(screen.getByText(/no replies yet/i)).toBeInTheDocument()
  })

  it('assigns sequential post numbers in depth-first order starting from 2', () => {
    const { container } = render(<ReplyThread replies={mockReplies} topicUri={TOPIC_URI} />)
    const articles = container.querySelectorAll('article')
    // mockReplies depth-first: aaa (depth 1), bbb (depth 2, child of aaa),
    // ccc (depth 3, child of bbb), ddd (depth 1), eee (depth 2, child of ddd)
    expect(articles[0]).toHaveAttribute('id', 'post-2')
    expect(articles[1]).toHaveAttribute('id', 'post-3')
    expect(articles[2]).toHaveAttribute('id', 'post-4')
    expect(articles[3]).toHaveAttribute('id', 'post-5')
    expect(articles[4]).toHaveAttribute('id', 'post-6')
  })

  it('uses singular heading for 1 reply', () => {
    render(<ReplyThread replies={[mockReplies[0]!]} topicUri={TOPIC_URI} />)
    expect(screen.getByRole('heading', { level: 2, name: '1 Reply' })).toBeInTheDocument()
  })

  it('renders tree structure with nested ol/li elements', () => {
    const { container } = render(<ReplyThread replies={mockReplies} topicUri={TOPIC_URI} />)
    // Top-level <ol>
    const topOl = container.querySelector('section > ol')
    expect(topOl).toBeInTheDocument()

    // Top-level <li> items (two root-level replies: aaa at depth 1, ddd at depth 1)
    const topItems = topOl!.querySelectorAll(':scope > li')
    expect(topItems).toHaveLength(2)

    // First root has nested children (bbb -> ccc)
    const firstNested = topItems[0]!.querySelector('ol')
    expect(firstNested).toBeInTheDocument()
  })

  it('sets aria-level on li elements', () => {
    const { container } = render(<ReplyThread replies={mockReplies} topicUri={TOPIC_URI} />)
    const listItems = container.querySelectorAll('li')
    // depth 1 (aaa), depth 2 (bbb), depth 3 (ccc), depth 1 (ddd), depth 2 (eee)
    expect(listItems[0]).toHaveAttribute('aria-level', '1')
    expect(listItems[1]).toHaveAttribute('aria-level', '2')
    expect(listItems[2]).toHaveAttribute('aria-level', '3')
    expect(listItems[3]).toHaveAttribute('aria-level', '1')
    expect(listItems[4]).toHaveAttribute('aria-level', '2')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<ReplyThread replies={mockReplies} topicUri={TOPIC_URI} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
