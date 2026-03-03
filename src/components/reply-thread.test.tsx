/**
 * Tests for ReplyThread component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { ReplyThread } from './reply-thread'
import { mockReplies } from '@/mocks/data'

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { did: 'did:plc:user-test-001', handle: 'test.bsky.social' },
    isAuthenticated: true,
    isLoading: false,
    getAccessToken: () => 'mock-access-token',
    authFetch: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    crossPostScopesGranted: false,
    requestCrossPostAuth: vi.fn(),
  }),
}))

vi.mock('@/lib/api/client', () => ({
  getReactions: vi.fn().mockResolvedValue({ reactions: [], cursor: null }),
  createReaction: vi.fn().mockResolvedValue({ uri: 'at://test', cid: 'bafyrei-test' }),
  deleteReaction: vi.fn().mockResolvedValue(undefined),
}))

describe('ReplyThread', () => {
  it('renders all replies', () => {
    render(<ReplyThread replies={mockReplies} />)
    for (const reply of mockReplies) {
      expect(screen.getByText(reply.content)).toBeInTheDocument()
    }
  })

  it('renders heading with reply count', () => {
    render(<ReplyThread replies={mockReplies} />)
    const heading = screen.getByRole('heading', {
      level: 2,
      name: `${mockReplies.length} Replies`,
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders empty state when no replies', () => {
    render(<ReplyThread replies={[]} />)
    expect(screen.getByText(/no replies yet/i)).toBeInTheDocument()
  })

  it('assigns sequential post numbers starting from 2', () => {
    const { container } = render(<ReplyThread replies={mockReplies} />)
    const articles = container.querySelectorAll('article')
    expect(articles[0]).toHaveAttribute('id', 'post-2')
    expect(articles[1]).toHaveAttribute('id', 'post-3')
    expect(articles[2]).toHaveAttribute('id', 'post-4')
  })

  it('uses singular heading for 1 reply', () => {
    render(<ReplyThread replies={[mockReplies[0]!]} />)
    expect(screen.getByRole('heading', { level: 2, name: '1 Reply' })).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<ReplyThread replies={mockReplies} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
