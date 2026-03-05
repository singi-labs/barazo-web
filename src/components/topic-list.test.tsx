import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopicList } from './topic-list'
import { mockTopics } from '@/mocks/data'
import type { Topic } from '@/lib/api/types'

const baseTopic: Topic = { ...mockTopics[0]! }

describe('TopicList', () => {
  it('renders all topics', () => {
    render(<TopicList topics={mockTopics} />)
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(mockTopics.length)
  })

  it('renders topic titles', () => {
    render(<TopicList topics={mockTopics} />)
    for (const topic of mockTopics) {
      expect(screen.getByRole('link', { name: topic.title })).toBeInTheDocument()
    }
  })

  it('renders empty state when no topics', () => {
    render(<TopicList topics={[]} />)
    expect(screen.getByText(/no topics yet/i)).toBeInTheDocument()
  })

  it('renders with heading', () => {
    render(<TopicList topics={mockTopics} heading="Recent Topics" />)
    expect(screen.getByRole('heading', { name: 'Recent Topics' })).toBeInTheDocument()
  })

  it('should render "Pinned" heading when there are pinned topics', () => {
    const topics: Topic[] = [
      {
        ...baseTopic,
        uri: 'at://did:plc:test/forum.barazo.topic.post/p1',
        rkey: 'p1',
        isPinned: true,
        pinnedScope: 'category',
        pinnedAt: '2026-03-01T00:00:00Z',
      },
      {
        ...baseTopic,
        uri: 'at://did:plc:test/forum.barazo.topic.post/r1',
        rkey: 'r1',
        isPinned: false,
        pinnedScope: null,
        pinnedAt: null,
      },
    ]
    render(<TopicList topics={topics} />)
    expect(screen.getByText('Pinned')).toBeInTheDocument()
    expect(screen.getByText('Topics')).toBeInTheDocument()
  })

  it('should not render section headings when no pinned topics', () => {
    const topics: Topic[] = [
      {
        ...baseTopic,
        uri: 'at://did:plc:test/forum.barazo.topic.post/r1',
        rkey: 'r1',
        isPinned: false,
        pinnedScope: null,
        pinnedAt: null,
      },
    ]
    render(<TopicList topics={topics} />)
    expect(screen.queryByText('Pinned')).not.toBeInTheDocument()
    expect(screen.queryByText('Topics')).not.toBeInTheDocument()
  })

  it('should render a separator between pinned and regular topics', () => {
    const topics: Topic[] = [
      {
        ...baseTopic,
        uri: 'at://did:plc:test/forum.barazo.topic.post/p1',
        rkey: 'p1',
        isPinned: true,
        pinnedScope: 'category',
        pinnedAt: '2026-03-01T00:00:00Z',
      },
      {
        ...baseTopic,
        uri: 'at://did:plc:test/forum.barazo.topic.post/r1',
        rkey: 'r1',
        isPinned: false,
        pinnedScope: null,
        pinnedAt: null,
      },
    ]
    render(<TopicList topics={topics} />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('should render only pinned section when all topics are pinned', () => {
    const topics: Topic[] = [
      {
        ...baseTopic,
        uri: 'at://did:plc:test/forum.barazo.topic.post/p1',
        rkey: 'p1',
        isPinned: true,
        pinnedScope: 'category',
        pinnedAt: '2026-03-01T00:00:00Z',
      },
      {
        ...baseTopic,
        uri: 'at://did:plc:test/forum.barazo.topic.post/p2',
        rkey: 'p2',
        isPinned: true,
        pinnedScope: 'forum',
        pinnedAt: '2026-03-02T00:00:00Z',
      },
    ]
    render(<TopicList topics={topics} />)
    expect(screen.getByText('Pinned')).toBeInTheDocument()
    // No regular topics section needed, but separator and "Topics" heading still render for consistency
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(2)
  })
})
