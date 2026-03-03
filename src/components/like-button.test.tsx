/**
 * Tests for LikeButton component.
 * Interactive heart button for liking/unliking topics and replies.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { LikeButton } from './like-button'

// --- Mocks ---

const mockToast = vi.fn()

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

const mockGetAccessToken = vi.fn(() => 'mock-access-token')
const mockAuthFetch = vi.fn()

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { did: 'did:plc:user-test-001', handle: 'test.bsky.social' },
    isAuthenticated: mockGetAccessToken() !== null,
    isLoading: false,
    getAccessToken: mockGetAccessToken,
    authFetch: mockAuthFetch,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    crossPostScopesGranted: false,
    requestCrossPostAuth: vi.fn(),
  }),
}))

vi.mock('@/lib/api/client', () => ({
  getReactions: vi.fn().mockResolvedValue({ reactions: [], cursor: null }),
  createReaction: vi.fn().mockResolvedValue({
    uri: 'at://did:plc:user-test-001/forum.barazo.interaction.reaction/abc123',
    cid: 'bafyrei-abc123',
    rkey: 'abc123',
    type: 'like',
    subjectUri: 'at://did:plc:author/forum.barazo.topic.post/topic1',
    createdAt: '2026-02-14T12:00:00.000Z',
  }),
  deleteReaction: vi.fn().mockResolvedValue(undefined),
}))

// Import after mocks so we can spy on them
const { getReactions, createReaction, deleteReaction } = await import('@/lib/api/client')

const defaultProps = {
  subjectUri: 'at://did:plc:author/forum.barazo.topic.post/topic1',
  subjectCid: 'bafyrei-topic1',
  initialCount: 5,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockToast.mockReset()
  mockGetAccessToken.mockReturnValue('mock-access-token')
  mockAuthFetch.mockReset()
  vi.mocked(getReactions).mockResolvedValue({ reactions: [], cursor: null })
  vi.mocked(createReaction).mockResolvedValue({
    uri: 'at://did:plc:user-test-001/forum.barazo.interaction.reaction/abc123',
    cid: 'bafyrei-abc123',
    rkey: 'abc123',
    type: 'like',
    subjectUri: defaultProps.subjectUri,
    createdAt: '2026-02-14T12:00:00.000Z',
  })
  vi.mocked(deleteReaction).mockResolvedValue(undefined)
})

describe('LikeButton', () => {
  describe('rendering', () => {
    it('renders a button with heart icon and count', () => {
      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button', { name: /5 reactions/i })
      expect(button).toBeInTheDocument()
    })

    it('displays the initial count', () => {
      render(<LikeButton {...defaultProps} initialCount={12} />)
      expect(screen.getByText('12')).toBeInTheDocument()
    })

    it('displays zero count', () => {
      render(<LikeButton {...defaultProps} initialCount={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('fetching user reaction status', () => {
    it('checks if the current user has already liked on mount', async () => {
      render(<LikeButton {...defaultProps} />)
      await waitFor(() => {
        expect(getReactions).toHaveBeenCalledWith(
          defaultProps.subjectUri,
          { type: 'like' },
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer mock-access-token',
            }),
          })
        )
      })
    })

    it('shows filled state when user has already liked', async () => {
      vi.mocked(getReactions).mockResolvedValueOnce({
        reactions: [
          {
            uri: 'at://did:plc:user-test-001/forum.barazo.interaction.reaction/existing',
            rkey: 'existing',
            authorDid: 'did:plc:user-test-001',
            subjectUri: defaultProps.subjectUri,
            subjectCid: defaultProps.subjectCid,
            type: 'like',
            communityDid: 'did:plc:community',
            cid: 'bafyrei-existing',
            createdAt: '2026-02-14T12:00:00.000Z',
          },
        ],
        cursor: null,
      })

      render(<LikeButton {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
      })
    })

    it('shows unfilled state when user has not liked', async () => {
      render(<LikeButton {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
      })
    })
  })

  describe('liking', () => {
    it('calls createReaction when clicking an unliked button', async () => {
      const user = userEvent.setup()
      render(<LikeButton {...defaultProps} />)

      await waitFor(() => {
        expect(getReactions).toHaveBeenCalled()
      })

      await user.click(screen.getByRole('button'))

      expect(createReaction).toHaveBeenCalledWith(
        {
          subjectUri: defaultProps.subjectUri,
          subjectCid: defaultProps.subjectCid,
          type: 'like',
        },
        'mock-access-token'
      )
    })

    it('optimistically increments count on like', async () => {
      const user = userEvent.setup()
      render(<LikeButton {...defaultProps} initialCount={5} />)

      await waitFor(() => {
        expect(getReactions).toHaveBeenCalled()
      })

      await user.click(screen.getByRole('button'))
      expect(screen.getByText('6')).toBeInTheDocument()
    })

    it('optimistically sets pressed state on like', async () => {
      const user = userEvent.setup()
      render(<LikeButton {...defaultProps} />)

      await waitFor(() => {
        expect(getReactions).toHaveBeenCalled()
      })

      await user.click(screen.getByRole('button'))
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('unliking', () => {
    it('calls deleteReaction when clicking a liked button', async () => {
      vi.mocked(getReactions).mockResolvedValueOnce({
        reactions: [
          {
            uri: 'at://did:plc:user-test-001/forum.barazo.interaction.reaction/existing',
            rkey: 'existing',
            authorDid: 'did:plc:user-test-001',
            subjectUri: defaultProps.subjectUri,
            subjectCid: defaultProps.subjectCid,
            type: 'like',
            communityDid: 'did:plc:community',
            cid: 'bafyrei-existing',
            createdAt: '2026-02-14T12:00:00.000Z',
          },
        ],
        cursor: null,
      })

      const user = userEvent.setup()
      render(<LikeButton {...defaultProps} initialCount={5} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
      })

      await user.click(screen.getByRole('button'))

      expect(deleteReaction).toHaveBeenCalledWith(
        'at://did:plc:user-test-001/forum.barazo.interaction.reaction/existing',
        'mock-access-token'
      )
    })

    it('optimistically decrements count on unlike', async () => {
      vi.mocked(getReactions).mockResolvedValueOnce({
        reactions: [
          {
            uri: 'at://did:plc:user-test-001/forum.barazo.interaction.reaction/existing',
            rkey: 'existing',
            authorDid: 'did:plc:user-test-001',
            subjectUri: defaultProps.subjectUri,
            subjectCid: defaultProps.subjectCid,
            type: 'like',
            communityDid: 'did:plc:community',
            cid: 'bafyrei-existing',
            createdAt: '2026-02-14T12:00:00.000Z',
          },
        ],
        cursor: null,
      })

      const user = userEvent.setup()
      render(<LikeButton {...defaultProps} initialCount={5} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
      })

      await user.click(screen.getByRole('button'))
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('does not go below zero on unlike', async () => {
      vi.mocked(getReactions).mockResolvedValueOnce({
        reactions: [
          {
            uri: 'at://did:plc:user-test-001/forum.barazo.interaction.reaction/existing',
            rkey: 'existing',
            authorDid: 'did:plc:user-test-001',
            subjectUri: defaultProps.subjectUri,
            subjectCid: defaultProps.subjectCid,
            type: 'like',
            communityDid: 'did:plc:community',
            cid: 'bafyrei-existing',
            createdAt: '2026-02-14T12:00:00.000Z',
          },
        ],
        cursor: null,
      })

      const user = userEvent.setup()
      render(<LikeButton {...defaultProps} initialCount={0} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
      })

      await user.click(screen.getByRole('button'))
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('reverts count on like failure', async () => {
      vi.mocked(createReaction).mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()
      render(<LikeButton {...defaultProps} initialCount={5} />)

      await waitFor(() => {
        expect(getReactions).toHaveBeenCalled()
      })

      await user.click(screen.getByRole('button'))

      // After error: reverts to 5
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument()
      })
    })

    it('shows error toast on like failure', async () => {
      vi.mocked(createReaction).mockRejectedValueOnce(
        new Error('API 502: Failed to write to remote PDS')
      )

      const user = userEvent.setup()
      render(<LikeButton {...defaultProps} initialCount={5} />)

      await waitFor(() => {
        expect(getReactions).toHaveBeenCalled()
      })

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            variant: 'destructive',
          })
        )
      })
    })

    it('reverts pressed state on like failure', async () => {
      vi.mocked(createReaction).mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()
      render(<LikeButton {...defaultProps} />)

      await waitFor(() => {
        expect(getReactions).toHaveBeenCalled()
      })

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
      })
    })
  })

  describe('unauthenticated state', () => {
    it('does not fetch reactions when not authenticated', () => {
      mockGetAccessToken.mockReturnValue(null as unknown as string)
      render(<LikeButton {...defaultProps} />)
      expect(getReactions).not.toHaveBeenCalled()
    })

    it('disables the button when not authenticated', () => {
      mockGetAccessToken.mockReturnValue(null as unknown as string)
      render(<LikeButton {...defaultProps} />)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('size variants', () => {
    it('renders with default size', () => {
      render(<LikeButton {...defaultProps} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('accepts sm size prop', () => {
      render(<LikeButton {...defaultProps} size="sm" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has aria-pressed reflecting liked state', async () => {
      render(<LikeButton {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
      })
    })

    it('has accessible label with count', () => {
      render(<LikeButton {...defaultProps} initialCount={5} />)
      expect(screen.getByRole('button', { name: /5 reactions/i })).toBeInTheDocument()
    })

    it('passes axe accessibility check', async () => {
      const { container } = render(<LikeButton {...defaultProps} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
