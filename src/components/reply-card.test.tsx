/**
 * Tests for ReplyCard component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ReplyCard } from './reply-card'
import { mockReplies, mockAuthorDeletedReply, mockModDeletedReply } from '@/mocks/data'
import { useAuth } from '@/hooks/use-auth'
import { updateReply } from '@/lib/api/client'
import type { Reply } from '@/lib/api/types'
import { createMockOnboardingContext } from '@/test/mock-onboarding'

// Mock useAuth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({
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
  })),
}))

// Mock useToast
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast, dismiss: vi.fn() }),
}))

// Mock onboarding context
vi.mock('@/context/onboarding-context', () => ({
  useOnboardingContext: () => createMockOnboardingContext(),
}))

// Mock API client
vi.mock('@/lib/api/client', () => ({
  updateReply: vi.fn(),
  getReactions: vi.fn().mockResolvedValue({ reactions: [], cursor: null }),
  createReaction: vi.fn().mockResolvedValue({ uri: 'at://test', cid: 'bafyrei-test' }),
  deleteReaction: vi.fn().mockResolvedValue(undefined),
}))

const reply = mockReplies[0]!

const mockReactions = [{ type: 'like', count: 3, reacted: true }]

beforeEach(() => {
  vi.clearAllMocks()
  mockToast.mockReset()
})

describe('ReplyCard', () => {
  it('renders reply content', () => {
    render(<ReplyCard reply={reply} postNumber={2} />)
    expect(screen.getByText(reply.content)).toBeInTheDocument()
  })

  it('renders author display name', () => {
    render(<ReplyCard reply={reply} postNumber={2} />)
    const expectedName = reply.author?.displayName ?? reply.author?.handle ?? reply.authorDid
    expect(screen.getByText(expectedName)).toBeInTheDocument()
  })

  it('renders as article with aria-labelledby', () => {
    const { container } = render(<ReplyCard reply={reply} postNumber={2} />)
    const article = container.querySelector('article')
    expect(article).toBeInTheDocument()
    expect(article).toHaveAttribute('aria-labelledby')
  })

  it('renders anchor id for post number', () => {
    const { container } = render(<ReplyCard reply={reply} postNumber={2} />)
    const article = container.querySelector('article')
    expect(article).toHaveAttribute('id', 'post-2')
  })

  it('renders post number link', () => {
    render(<ReplyCard reply={reply} postNumber={2} />)
    const link = screen.getByRole('link', { name: 'Link to post #2' })
    expect(link).toHaveAttribute('href', '#post-2')
  })

  it('renders reaction count', () => {
    render(<ReplyCard reply={reply} postNumber={2} />)
    expect(screen.getByText(`${reply.reactionCount}`)).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<ReplyCard reply={reply} postNumber={2} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders reaction bar when reactions are provided', () => {
    render(
      <ReplyCard
        reply={reply}
        postNumber={2}
        reactions={mockReactions}
        onReactionToggle={vi.fn()}
      />
    )
    expect(screen.getByRole('group', { name: 'Reactions' })).toBeInTheDocument()
  })

  it('renders report button when canReport is true', () => {
    render(<ReplyCard reply={reply} postNumber={2} canReport={true} onReport={vi.fn()} />)
    expect(screen.getByRole('button', { name: /report/i })).toBeInTheDocument()
  })

  it('renders self-label indicator when selfLabels are provided', () => {
    render(<ReplyCard reply={reply} postNumber={2} selfLabels={['graphic-media']} />)
    expect(screen.getByText(/content warning/i)).toBeInTheDocument()
  })

  it('calls onReactionToggle when reaction is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <ReplyCard
        reply={reply}
        postNumber={2}
        reactions={mockReactions}
        onReactionToggle={onToggle}
      />
    )
    await user.click(screen.getByRole('button', { name: /like/i }))
    expect(onToggle).toHaveBeenCalledWith('like')
  })

  describe('reply button', () => {
    it('calls onReply with correct metadata when Reply button is clicked', async () => {
      const user = userEvent.setup()
      const onReply = vi.fn()
      render(<ReplyCard reply={reply} postNumber={2} onReply={onReply} />)
      await user.click(screen.getByRole('button', { name: /reply to/i }))
      expect(onReply).toHaveBeenCalledWith({
        uri: reply.uri,
        cid: reply.cid,
        authorHandle: reply.author?.handle ?? reply.authorDid,
        snippet: reply.content.slice(0, 100),
      })
    })

    it('does not show Reply button on deleted replies', () => {
      render(<ReplyCard reply={mockAuthorDeletedReply} postNumber={4} onReply={vi.fn()} />)
      expect(screen.queryByRole('button', { name: /reply to/i })).not.toBeInTheDocument()
    })

    it('does not show Reply button when onReply is not provided', () => {
      render(<ReplyCard reply={reply} postNumber={2} />)
      expect(screen.queryByRole('button', { name: /reply to/i })).not.toBeInTheDocument()
    })
  })

  describe('tombstone: author-deleted replies', () => {
    it('shows author-deleted placeholder text', () => {
      render(<ReplyCard reply={mockAuthorDeletedReply} postNumber={4} />)
      expect(screen.getByText('This post was removed by the author.')).toBeInTheDocument()
    })

    it('does not render MarkdownContent for author-deleted replies', () => {
      const { container } = render(<ReplyCard reply={mockAuthorDeletedReply} postNumber={4} />)
      expect(container.querySelector('.prose')).not.toBeInTheDocument()
    })

    it('shows [deleted] instead of author name for author-deleted replies', () => {
      render(<ReplyCard reply={mockAuthorDeletedReply} postNumber={4} />)
      expect(screen.getByText('[deleted]')).toBeInTheDocument()
    })

    it('does not render author avatar for author-deleted replies', () => {
      render(<ReplyCard reply={mockAuthorDeletedReply} postNumber={4} />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('preserves post number anchor for author-deleted replies', () => {
      const { container } = render(<ReplyCard reply={mockAuthorDeletedReply} postNumber={4} />)
      const article = container.querySelector('article')
      expect(article).toHaveAttribute('id', 'post-4')
    })

    it('does not render reactions footer for author-deleted replies', () => {
      render(<ReplyCard reply={mockAuthorDeletedReply} postNumber={4} />)
      expect(screen.queryByLabelText(/reactions/i)).not.toBeInTheDocument()
    })

    it('does not render report button for author-deleted replies', () => {
      render(
        <ReplyCard
          reply={mockAuthorDeletedReply}
          postNumber={4}
          canReport={true}
          onReport={vi.fn()}
        />
      )
      expect(screen.queryByRole('button', { name: /report/i })).not.toBeInTheDocument()
    })

    it('passes axe accessibility check for author-deleted replies', async () => {
      const { container } = render(<ReplyCard reply={mockAuthorDeletedReply} postNumber={4} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('tombstone: moderator-deleted replies', () => {
    it('shows moderator-deleted placeholder text', () => {
      render(<ReplyCard reply={mockModDeletedReply} postNumber={5} />)
      expect(screen.getByText('This post was removed by a moderator.')).toBeInTheDocument()
    })

    it('does not render original reply content for mod-deleted replies', () => {
      render(<ReplyCard reply={mockModDeletedReply} postNumber={5} />)
      expect(screen.queryByText('[Removed by moderator]')).not.toBeInTheDocument()
    })

    it('shows [deleted] instead of author name for mod-deleted replies', () => {
      render(<ReplyCard reply={mockModDeletedReply} postNumber={5} />)
      expect(screen.getByText('[deleted]')).toBeInTheDocument()
    })

    it('preserves post number anchor for mod-deleted replies', () => {
      const { container } = render(<ReplyCard reply={mockModDeletedReply} postNumber={5} />)
      const article = container.querySelector('article')
      expect(article).toHaveAttribute('id', 'post-5')
    })

    it('passes axe accessibility check for mod-deleted replies', async () => {
      const { container } = render(<ReplyCard reply={mockModDeletedReply} postNumber={5} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('edit mode', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          did: reply.authorDid,
          handle: reply.author?.handle ?? '',
          displayName: 'Alex',
          avatarUrl: null,
          role: 'user',
        },
        isAuthenticated: true,
        isLoading: false,
        crossPostScopesGranted: false,
        getAccessToken: () => 'mock-token',
        login: vi.fn(),
        logout: vi.fn(),
        setSessionFromCallback: vi.fn(),
        requestCrossPostAuth: vi.fn(),
        authFetch: vi.fn(),
      } as ReturnType<typeof useAuth>)
    })

    it('renders Edit button when canEdit is true', () => {
      render(<ReplyCard reply={reply} postNumber={2} canEdit={true} />)
      expect(
        screen.getByRole('button', {
          name: `Edit reply by ${reply.author?.handle ?? reply.authorDid}`,
        })
      ).toBeInTheDocument()
    })

    it('does not render Edit button when canEdit is false', () => {
      render(<ReplyCard reply={reply} postNumber={2} />)
      expect(screen.queryByRole('button', { name: /edit reply by/i })).not.toBeInTheDocument()
    })

    it('does not render Edit button on deleted replies', () => {
      render(<ReplyCard reply={mockAuthorDeletedReply} postNumber={4} canEdit={true} />)
      expect(screen.queryByRole('button', { name: /edit reply by/i })).not.toBeInTheDocument()
    })

    it('shows MarkdownEditor with reply content when Edit is clicked', async () => {
      const user = userEvent.setup()
      render(<ReplyCard reply={reply} postNumber={2} canEdit={true} />)
      await user.click(screen.getByRole('button', { name: /edit reply by/i }))
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveValue(reply.content)
    })

    it('returns to read mode when Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<ReplyCard reply={reply} postNumber={2} canEdit={true} />)
      await user.click(screen.getByRole('button', { name: /edit reply by/i }))
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
      expect(screen.getByText(reply.content)).toBeInTheDocument()
    })

    it('calls updateReply with correct args on save', async () => {
      const user = userEvent.setup()
      vi.mocked(updateReply).mockResolvedValueOnce({} as Reply)
      render(<ReplyCard reply={reply} postNumber={2} canEdit={true} />)
      await user.click(screen.getByRole('button', { name: /edit reply by/i }))
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'new content')
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(updateReply).toHaveBeenCalledWith(
          reply.uri,
          { content: 'new content' },
          'mock-token'
        )
      })
      // Editor should close after save
      await waitFor(() => {
        expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
      })
    })

    it('disables Save button when content is empty', async () => {
      const user = userEvent.setup()
      render(<ReplyCard reply={reply} postNumber={2} canEdit={true} />)
      await user.click(screen.getByRole('button', { name: /edit reply by/i }))
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('shows "Saving..." while submitting', async () => {
      const user = userEvent.setup()
      let resolvePromise: (value: Reply) => void
      vi.mocked(updateReply).mockReturnValueOnce(
        new Promise<Reply>((resolve) => {
          resolvePromise = resolve
        })
      )
      render(<ReplyCard reply={reply} postNumber={2} canEdit={true} />)
      await user.click(screen.getByRole('button', { name: /edit reply by/i }))
      await user.click(screen.getByRole('button', { name: 'Save' }))
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument()
      // Resolve and wait for state to settle
      resolvePromise!({} as Reply)
      await waitFor(() => {
        expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
      })
    })

    it('shows error toast on save failure', async () => {
      const user = userEvent.setup()
      vi.mocked(updateReply).mockRejectedValueOnce(new Error('Network error'))
      render(<ReplyCard reply={reply} postNumber={2} canEdit={true} />)
      await user.click(screen.getByRole('button', { name: /edit reply by/i }))
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Network error',
          variant: 'destructive',
        })
      })
      // Editor should remain open
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
    })

    it('shows success toast on save', async () => {
      const user = userEvent.setup()
      vi.mocked(updateReply).mockResolvedValueOnce({} as Reply)
      render(<ReplyCard reply={reply} postNumber={2} canEdit={true} />)
      await user.click(screen.getByRole('button', { name: /edit reply by/i }))
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({ title: 'Reply updated' })
      })
    })

    it('shows "(edited)" indicator when indexedAt > createdAt + 30s', () => {
      const editedReply: Reply = {
        ...reply,
        createdAt: '2026-02-14T12:00:00.000Z',
        indexedAt: '2026-02-14T12:01:00.000Z',
      }
      render(<ReplyCard reply={editedReply} postNumber={2} />)
      expect(screen.getByText('(edited)')).toBeInTheDocument()
    })

    it('does not show "(edited)" indicator when timestamps are close', () => {
      // Default mock reply has same createdAt and indexedAt
      render(<ReplyCard reply={reply} postNumber={2} />)
      expect(screen.queryByText('(edited)')).not.toBeInTheDocument()
    })

    it('passes axe accessibility check in edit mode', async () => {
      const user = userEvent.setup()
      const { container } = render(<ReplyCard reply={reply} postNumber={2} canEdit={true} />)
      await user.click(screen.getByRole('button', { name: /edit reply by/i }))
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
