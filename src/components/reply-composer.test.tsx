/**
 * Tests for ReplyComposer component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ReplyComposer } from './reply-composer'
import type { ReplyTarget } from './reply-composer'

const mockGetAccessToken = vi.fn<() => string | null>(() => 'mock-access-token')
const mockToast = vi.fn()
const mockCreateReply = vi.fn()

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      did: 'did:plc:user-test-001',
      handle: 'test.bsky.social',
      displayName: 'Test User',
      avatarUrl: null,
    },
    isAuthenticated: true,
    isLoading: false,
    getAccessToken: mockGetAccessToken,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
    crossPostScopesGranted: false,
  }),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: vi.fn(),
  }),
}))

vi.mock('@/lib/api/client', () => ({
  createReply: (...args: unknown[]) => mockCreateReply(...args),
}))

const defaultProps = {
  topicUri: 'at://did:plc:abc/forum.barazo.topic/123',
  topicCid: 'bafyreiabc123',
  communityDid: 'did:plc:community-001',
  onReplyCreated: vi.fn(),
}

const mockReplyTarget: ReplyTarget = {
  uri: 'at://did:plc:def/forum.barazo.reply/456',
  cid: 'bafyreidef456',
  authorHandle: 'alice.bsky.social',
  snippet: 'This is a snippet of the original reply content',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCreateReply.mockResolvedValue({
    uri: 'at://did:plc:user-test-001/forum.barazo.reply/789',
    cid: 'bafyrei789',
    content: 'Test reply',
    authorDid: 'did:plc:user-test-001',
  })
})

describe('ReplyComposer', () => {
  describe('collapsed state', () => {
    it('renders collapsed bar with "Write a reply..." text', () => {
      render(<ReplyComposer {...defaultProps} />)
      expect(screen.getByText('Write a reply...')).toBeInTheDocument()
    })

    it('does not show textarea in collapsed state', () => {
      render(<ReplyComposer {...defaultProps} />)
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('passes axe accessibility check in collapsed state', async () => {
      const { container } = render(<ReplyComposer {...defaultProps} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('expand/collapse', () => {
    it('expands when collapsed bar is clicked', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      await user.click(screen.getByText('Write a reply...'))

      expect(screen.getByRole('textbox', { name: 'Reply' })).toBeInTheDocument()
    })

    it('collapses when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      await user.click(screen.getByText('Write a reply...'))
      expect(screen.getByRole('textbox', { name: 'Reply' })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getByText('Write a reply...')).toBeInTheDocument()
    })
  })

  describe('reply target banner', () => {
    it('shows reply target banner when replyTarget prop is provided', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} replyTarget={mockReplyTarget} />)

      // Should auto-expand when reply target is set
      expect(screen.getByText('Replying to @alice.bsky.social')).toBeInTheDocument()
      expect(screen.getByText(mockReplyTarget.snippet)).toBeInTheDocument()
    })

    it('auto-expands when replyTarget is set', () => {
      render(<ReplyComposer {...defaultProps} replyTarget={mockReplyTarget} />)

      // Textarea should be visible because it auto-expanded
      expect(screen.getByRole('textbox', { name: 'Reply' })).toBeInTheDocument()
    })

    it('calls onClearReplyTarget when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      const onClear = vi.fn()
      render(
        <ReplyComposer
          {...defaultProps}
          replyTarget={mockReplyTarget}
          onClearReplyTarget={onClear}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Dismiss reply target' }))
      expect(onClear).toHaveBeenCalledTimes(1)
    })

    it('does not show reply target banner when replyTarget is null', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} replyTarget={null} />)

      await user.click(screen.getByText('Write a reply...'))
      expect(screen.queryByText(/replying to/i)).not.toBeInTheDocument()
    })
  })

  describe('locked topic', () => {
    it('shows locked notice when isLocked is true', () => {
      render(<ReplyComposer {...defaultProps} isLocked={true} />)
      expect(
        screen.getByText('This topic is locked. New replies are not accepted.')
      ).toBeInTheDocument()
    })

    it('does not show composer input when locked', () => {
      render(<ReplyComposer {...defaultProps} isLocked={true} />)
      expect(screen.queryByText('Write a reply...')).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('passes axe accessibility check when locked', async () => {
      const { container } = render(<ReplyComposer {...defaultProps} isLocked={true} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('submit behavior', () => {
    it('disables submit button when content is empty', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      await user.click(screen.getByText('Write a reply...'))
      const submitBtn = screen.getByRole('button', { name: 'Reply' })
      expect(submitBtn).toBeDisabled()
    })

    it('disables submit button when content is only whitespace', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      await user.click(screen.getByText('Write a reply...'))
      const textarea = screen.getByRole('textbox', { name: 'Reply' })
      await user.type(textarea, '   ')

      const submitBtn = screen.getByRole('button', { name: 'Reply' })
      expect(submitBtn).toBeDisabled()
    })

    it('enables submit button when content has text', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      await user.click(screen.getByText('Write a reply...'))
      const textarea = screen.getByRole('textbox', { name: 'Reply' })
      await user.type(textarea, 'A valid reply')

      const submitBtn = screen.getByRole('button', { name: 'Reply' })
      expect(submitBtn).toBeEnabled()
    })

    it('calls createReply and onReplyCreated on successful submit', async () => {
      const user = userEvent.setup()
      const onReplyCreated = vi.fn()
      render(<ReplyComposer {...defaultProps} onReplyCreated={onReplyCreated} />)

      await user.click(screen.getByText('Write a reply...'))
      const textarea = screen.getByRole('textbox', { name: 'Reply' })
      await user.type(textarea, 'My test reply')
      await user.click(screen.getByRole('button', { name: 'Reply' }))

      await waitFor(() => {
        expect(mockCreateReply).toHaveBeenCalledWith(
          defaultProps.topicUri,
          { content: 'My test reply', parentUri: undefined },
          'mock-access-token'
        )
      })

      await waitFor(() => {
        expect(onReplyCreated).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({ title: 'Reply posted' })
      })
    })

    it('passes parentUri when reply target is set', async () => {
      const user = userEvent.setup()
      render(
        <ReplyComposer
          {...defaultProps}
          replyTarget={mockReplyTarget}
          onClearReplyTarget={vi.fn()}
        />
      )

      const textarea = screen.getByRole('textbox', { name: 'Reply' })
      await user.type(textarea, 'Replying to a specific post')
      await user.click(screen.getByRole('button', { name: 'Reply' }))

      await waitFor(() => {
        expect(mockCreateReply).toHaveBeenCalledWith(
          defaultProps.topicUri,
          { content: 'Replying to a specific post', parentUri: mockReplyTarget.uri },
          'mock-access-token'
        )
      })
    })

    it('clears content and collapses after successful submit', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      await user.click(screen.getByText('Write a reply...'))
      const textarea = screen.getByRole('textbox', { name: 'Reply' })
      await user.type(textarea, 'My test reply')
      await user.click(screen.getByRole('button', { name: 'Reply' }))

      await waitFor(() => {
        expect(screen.getByText('Write a reply...')).toBeInTheDocument()
      })
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('shows error toast on failed submit', async () => {
      mockCreateReply.mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      await user.click(screen.getByText('Write a reply...'))
      const textarea = screen.getByRole('textbox', { name: 'Reply' })
      await user.type(textarea, 'My test reply')
      await user.click(screen.getByRole('button', { name: 'Reply' }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Network error',
          variant: 'destructive',
        })
      })
    })

    it('shows generic error message for non-Error exceptions', async () => {
      mockCreateReply.mockRejectedValueOnce('unknown error')

      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      await user.click(screen.getByText('Write a reply...'))
      const textarea = screen.getByRole('textbox', { name: 'Reply' })
      await user.type(textarea, 'My test reply')
      await user.click(screen.getByRole('button', { name: 'Reply' }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to post reply',
          variant: 'destructive',
        })
      })
    })

    it('stays expanded after failed submit', async () => {
      mockCreateReply.mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      await user.click(screen.getByText('Write a reply...'))
      const textarea = screen.getByRole('textbox', { name: 'Reply' })
      await user.type(textarea, 'My test reply')
      await user.click(screen.getByRole('button', { name: 'Reply' }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled()
      })
      // Should still be expanded with content intact
      expect(screen.getByRole('textbox', { name: 'Reply' })).toBeInTheDocument()
    })
  })

  describe('initialContent', () => {
    it('populates textarea with initialContent and auto-expands', () => {
      const initialText = '> quoted text\n\n'
      render(<ReplyComposer {...defaultProps} initialContent={initialText} />)
      expect(screen.getByRole('textbox', { name: 'Reply' })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Reply' })).toHaveValue(initialText)
    })
  })

  describe('expanded state accessibility', () => {
    it('passes axe accessibility check in expanded state', async () => {
      const user = userEvent.setup()
      const { container } = render(<ReplyComposer {...defaultProps} />)

      await user.click(screen.getByText('Write a reply...'))

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('passes axe accessibility check with reply target banner', async () => {
      const { container } = render(
        <ReplyComposer
          {...defaultProps}
          replyTarget={mockReplyTarget}
          onClearReplyTarget={vi.fn()}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('keyboard shortcuts', () => {
    it('collapses when Escape is pressed while expanded', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      // Expand first
      await user.click(screen.getByText('Write a reply...'))
      expect(screen.getByRole('textbox', { name: 'Reply' })).toBeInTheDocument()

      // Press Escape
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getByText('Write a reply...')).toBeInTheDocument()
    })

    it('does not collapse when Escape is pressed while already collapsed', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      // Press Escape while collapsed - should remain collapsed (no crash)
      await user.keyboard('{Escape}')
      expect(screen.getByText('Write a reply...')).toBeInTheDocument()
    })

    it('preserves draft content after Escape collapse', async () => {
      const user = userEvent.setup()
      render(<ReplyComposer {...defaultProps} />)

      // Expand, type content, collapse with Escape
      await user.click(screen.getByText('Write a reply...'))
      const textarea = screen.getByRole('textbox', { name: 'Reply' })
      await user.type(textarea, 'My draft reply')
      await user.keyboard('{Escape}')

      // Re-expand and verify draft is preserved
      await user.click(screen.getByText('Write a reply...'))
      expect(screen.getByRole('textbox', { name: 'Reply' })).toHaveValue('My draft reply')
    })
  })

  describe('imperative handle', () => {
    it('expands composer when expand() is called via ref', async () => {
      const ref = { current: null } as React.RefObject<import('./reply-composer').ReplyComposerHandle | null>
      render(<ReplyComposer {...defaultProps} ref={ref} />)

      expect(screen.getByText('Write a reply...')).toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

      // Call expand via ref wrapped in act
      act(() => {
        ref.current?.expand()
      })

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Reply' })).toBeInTheDocument()
      })
    })
  })

  describe('className prop', () => {
    it('applies custom className in collapsed state', () => {
      const { container } = render(<ReplyComposer {...defaultProps} className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('applies custom className when locked', () => {
      const { container } = render(
        <ReplyComposer {...defaultProps} isLocked={true} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
