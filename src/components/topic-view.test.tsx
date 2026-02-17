/**
 * Tests for TopicView component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { TopicView } from './topic-view'
import { mockTopics, mockUsers } from '@/mocks/data'

const topic = mockTopics[0]!

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
})
