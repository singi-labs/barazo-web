/**
 * Tests for TopicView component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { TopicView } from './topic-view'
import { mockTopics, mockUsers, mockAuthorDeletedTopic, mockModDeletedTopic } from '@/mocks/data'

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

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

const topic = mockTopics[0]!
const baseTopic = topic
const editedTopic = {
  ...baseTopic,
  indexedAt: new Date(new Date(baseTopic.createdAt).getTime() + 60_000).toISOString(),
}

const mockReactions = [
  { type: 'like', count: 5, reacted: false },
  { type: 'celebrate', count: 2, reacted: true },
]

describe('TopicView', () => {
  it('renders topic title as h2', () => {
    render(<TopicView topic={topic} />)
    const heading = screen.getByRole('heading', { level: 2, name: topic.title })
    expect(heading).toBeInTheDocument()
  })

  it('renders topic content via markdown', () => {
    render(<TopicView topic={topic} />)
    expect(screen.getByText(topic.content)).toBeInTheDocument()
  })

  it('renders author handle', () => {
    render(<TopicView topic={topic} />)
    expect(screen.getByText(mockUsers[0]!.did)).toBeInTheDocument()
  })

  it('renders category link', () => {
    render(<TopicView topic={topic} />)
    const link = screen.getByRole('link', { name: topic.category })
    expect(link).toHaveAttribute('href', `/c/${topic.category}`)
  })

  it('renders tags', () => {
    render(<TopicView topic={topic} />)
    for (const tag of topic.tags ?? []) {
      expect(screen.getByText(`#${tag}`)).toBeInTheDocument()
    }
  })

  it('renders reply count', () => {
    render(<TopicView topic={topic} />)
    expect(screen.getByLabelText(`${topic.replyCount} replies`)).toBeInTheDocument()
  })

  it('renders reaction count', () => {
    render(<TopicView topic={topic} />)
    expect(screen.getByLabelText(`${topic.reactionCount} reactions`)).toBeInTheDocument()
  })

  it('uses article element with aria-labelledby', () => {
    const { container } = render(<TopicView topic={topic} />)
    const article = container.querySelector('article')
    expect(article).toBeInTheDocument()
    expect(article).toHaveAttribute('aria-labelledby')
  })

  it('includes anchor link for post', () => {
    const { container } = render(<TopicView topic={topic} />)
    const article = container.querySelector('article')
    expect(article).toHaveAttribute('id', 'post-1')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<TopicView topic={topic} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders reaction bar when reactions are provided', () => {
    render(<TopicView topic={topic} reactions={mockReactions} onReactionToggle={vi.fn()} />)
    expect(screen.getByRole('group', { name: 'Reactions' })).toBeInTheDocument()
  })

  it('does not render reactions when not provided', () => {
    render(<TopicView topic={topic} />)
    expect(screen.queryByRole('group', { name: 'Reactions' })).not.toBeInTheDocument()
  })

  it('renders moderation controls for moderators', () => {
    render(<TopicView topic={topic} isModerator={true} onModerationAction={vi.fn()} />)
    expect(screen.getByRole('group', { name: /moderation/i })).toBeInTheDocument()
  })

  it('renders report button when canReport is true', () => {
    render(<TopicView topic={topic} canReport={true} onReport={vi.fn()} />)
    expect(screen.getByRole('button', { name: /report/i })).toBeInTheDocument()
  })

  it('renders self-label indicator when selfLabels are provided', () => {
    render(<TopicView topic={topic} selfLabels={['sexual']} />)
    expect(screen.getByText(/content warning/i)).toBeInTheDocument()
  })

  it('calls onReactionToggle when reaction is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<TopicView topic={topic} reactions={mockReactions} onReactionToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: /like/i }))
    expect(onToggle).toHaveBeenCalledWith('like')
  })

  describe('edit button', () => {
    it('renders edit button when canEdit is true and onEdit is provided', () => {
      render(<TopicView topic={topic} canEdit={true} onEdit={vi.fn()} />)
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('does not render edit button when canEdit is false', () => {
      render(<TopicView topic={topic} canEdit={false} onEdit={vi.fn()} />)
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('does not render edit button when canEdit is undefined', () => {
      render(<TopicView topic={topic} onEdit={vi.fn()} />)
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('does not render edit button when onEdit is not provided', () => {
      render(<TopicView topic={topic} canEdit={true} />)
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('calls onEdit callback when edit button is clicked', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      render(<TopicView topic={topic} canEdit={true} onEdit={onEdit} />)
      await user.click(screen.getByRole('button', { name: /edit/i }))
      expect(onEdit).toHaveBeenCalledTimes(1)
    })

    it('passes axe accessibility check with edit button visible', async () => {
      const { container } = render(<TopicView topic={topic} canEdit={true} onEdit={vi.fn()} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('edited indicator', () => {
    it('shows "(edited)" when indexedAt is more than 30s after createdAt', () => {
      render(<TopicView topic={editedTopic} />)
      expect(screen.getByText('(edited)')).toBeInTheDocument()
    })

    it('does not show "(edited)" when timestamps are close', () => {
      render(<TopicView topic={topic} />)
      expect(screen.queryByText('(edited)')).not.toBeInTheDocument()
    })
  })

  describe('tombstone: author-deleted topics', () => {
    it('shows author-deleted placeholder text', () => {
      render(<TopicView topic={mockAuthorDeletedTopic} />)
      expect(screen.getByText('This topic was removed by the author.')).toBeInTheDocument()
    })

    it('does not render topic content for author-deleted topics', () => {
      const { container } = render(<TopicView topic={mockAuthorDeletedTopic} />)
      expect(container.querySelector('.prose')).not.toBeInTheDocument()
    })

    it('does not render the API placeholder title for author-deleted topics', () => {
      render(<TopicView topic={mockAuthorDeletedTopic} />)
      expect(screen.queryByText('[Deleted by author]')).not.toBeInTheDocument()
    })

    it('shows [deleted] instead of author identity for author-deleted topics', () => {
      render(<TopicView topic={mockAuthorDeletedTopic} />)
      expect(screen.getByText('[deleted]')).toBeInTheDocument()
    })

    it('does not render category or tags for author-deleted topics', () => {
      render(<TopicView topic={mockAuthorDeletedTopic} />)
      expect(screen.queryByText(mockAuthorDeletedTopic.category)).not.toBeInTheDocument()
    })

    it('does not render reactions footer for author-deleted topics', () => {
      render(
        <TopicView
          topic={mockAuthorDeletedTopic}
          reactions={[{ type: 'like', count: 3, reacted: true }]}
          onReactionToggle={vi.fn()}
        />
      )
      expect(screen.queryByRole('group', { name: 'Reactions' })).not.toBeInTheDocument()
    })

    it('does not render report button for author-deleted topics', () => {
      render(<TopicView topic={mockAuthorDeletedTopic} canReport={true} onReport={vi.fn()} />)
      expect(screen.queryByRole('button', { name: /report/i })).not.toBeInTheDocument()
    })

    it('uses muted styling for author-deleted topics', () => {
      const { container } = render(<TopicView topic={mockAuthorDeletedTopic} />)
      const article = container.querySelector('article')
      expect(article?.className).toContain('bg-muted/50')
    })

    it('passes axe accessibility check for author-deleted topics', async () => {
      const { container } = render(<TopicView topic={mockAuthorDeletedTopic} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('tombstone: moderator-deleted topics', () => {
    it('shows moderator-deleted placeholder text', () => {
      render(<TopicView topic={mockModDeletedTopic} />)
      expect(screen.getByText('This topic was removed by a moderator.')).toBeInTheDocument()
    })

    it('does not render the API placeholder title for mod-deleted topics', () => {
      render(<TopicView topic={mockModDeletedTopic} />)
      expect(screen.queryByText('[Removed by moderator]')).not.toBeInTheDocument()
    })

    it('shows [deleted] instead of author identity for mod-deleted topics', () => {
      render(<TopicView topic={mockModDeletedTopic} />)
      expect(screen.getByText('[deleted]')).toBeInTheDocument()
    })

    it('uses muted styling for mod-deleted topics', () => {
      const { container } = render(<TopicView topic={mockModDeletedTopic} />)
      const article = container.querySelector('article')
      expect(article?.className).toContain('bg-muted/50')
    })

    it('passes axe accessibility check for mod-deleted topics', async () => {
      const { container } = render(<TopicView topic={mockModDeletedTopic} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
