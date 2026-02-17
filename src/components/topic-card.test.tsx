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

  it('renders as an article element', () => {
    render(<TopicCard topic={topic} />)
    expect(screen.getByRole('article')).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<TopicCard topic={topic} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
