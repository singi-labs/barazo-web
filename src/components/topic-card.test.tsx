import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { TopicCard } from './topic-card'
import { mockTopics } from '@/mocks/data'

const topic = mockTopics[0]!

describe('TopicCard', () => {
  it('renders topic title as a link', () => {
    render(<TopicCard topic={topic} />)
    const link = screen.getByRole('link', { name: topic.title })
    expect(link).toBeInTheDocument()
  })

  it('renders author display name', () => {
    render(<TopicCard topic={topic} />)
    const expectedName = topic.author?.displayName ?? topic.author?.handle ?? topic.authorDid
    expect(screen.getByText(expectedName)).toBeInTheDocument()
  })

  it('renders category', () => {
    render(<TopicCard topic={topic} />)
    expect(screen.getByText(topic.category)).toBeInTheDocument()
  })

  it('renders reply count', () => {
    render(<TopicCard topic={topic} />)
    expect(screen.getByText(String(topic.replyCount))).toBeInTheDocument()
  })

  it('renders reaction count', () => {
    render(<TopicCard topic={topic} />)
    expect(screen.getByText(String(topic.reactionCount))).toBeInTheDocument()
  })

  it('renders view count with accessible label', () => {
    render(<TopicCard topic={topic} />)
    expect(screen.getByLabelText(`${topic.viewCount} views`)).toBeInTheDocument()
  })

  it('renders as an article element', () => {
    render(<TopicCard topic={topic} />)
    expect(screen.getByRole('article')).toBeInTheDocument()
  })

  it('should show pin icon for pinned topics', () => {
    const pinnedTopic = {
      ...topic,
      isPinned: true,
      pinnedScope: 'category' as const,
      pinnedAt: '2026-03-01T00:00:00Z',
    }
    const { getByLabelText } = render(<TopicCard topic={pinnedTopic} />)
    expect(getByLabelText('Pinned topic')).toBeInTheDocument()
  })

  it('should show Global badge for forum-wide pinned topics', () => {
    const globalTopic = {
      ...topic,
      isPinned: true,
      pinnedScope: 'forum' as const,
      pinnedAt: '2026-03-01T00:00:00Z',
    }
    const { getByText } = render(<TopicCard topic={globalTopic} />)
    expect(getByText('Global')).toBeInTheDocument()
  })

  it('should not show pin indicator for unpinned topics', () => {
    const { queryByLabelText } = render(<TopicCard topic={topic} />)
    expect(queryByLabelText('Pinned topic')).not.toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<TopicCard topic={topic} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
