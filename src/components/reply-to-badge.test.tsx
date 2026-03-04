/**
 * Tests for ReplyToBadge component.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { ReplyToBadge } from './reply-to-badge'

describe('ReplyToBadge', () => {
  it('renders with @username', () => {
    render(<ReplyToBadge authorHandle="alex.bsky.team" parentPostNumber={3} />)
    expect(screen.getByText(/@alex\.bsky\.team/)).toBeInTheDocument()
  })

  it('renders as an accessible link to parent post', () => {
    render(<ReplyToBadge authorHandle="alex.bsky.team" parentPostNumber={3} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#post-3')
    expect(link).toHaveAttribute('aria-label', expect.stringContaining('alex.bsky.team'))
  })

  it('renders ArrowBendDownRight icon', () => {
    const { container } = render(
      <ReplyToBadge authorHandle="alex.bsky.team" parentPostNumber={3} />
    )
    // Phosphor icons render as SVG
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(
      <ReplyToBadge authorHandle="alex.bsky.team" parentPostNumber={3} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
