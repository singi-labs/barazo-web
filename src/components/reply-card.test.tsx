/**
 * Tests for ReplyCard component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ReplyCard } from './reply-card'
import { mockReplies, mockAuthorDeletedReply, mockModDeletedReply } from '@/mocks/data'

const reply = mockReplies[0]!
const nestedReply = mockReplies[1]! // depth 1

const mockReactions = [{ type: 'like', count: 3, reacted: true }]

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

  it('applies depth indentation for nested replies', () => {
    const { container } = render(<ReplyCard reply={nestedReply} postNumber={3} />)
    const wrapper = container.firstChild as HTMLElement
    // Depth 1 should have margin-left
    expect(wrapper.className).toContain('ml-')
  })

  it('does not indent top-level replies', () => {
    const { container } = render(<ReplyCard reply={reply} postNumber={2} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).not.toContain('ml-')
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
})
