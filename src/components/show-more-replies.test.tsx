/**
 * Tests for ShowMoreReplies component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ShowMoreReplies } from './show-more-replies'

describe('ShowMoreReplies', () => {
  it('renders with correct count (plural)', () => {
    render(<ShowMoreReplies count={4} onShow={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('Show 4 more replies')
  })

  it('renders with correct count (singular)', () => {
    render(<ShowMoreReplies count={1} onShow={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('Show 1 more reply')
  })

  it('calls onShow when clicked', async () => {
    const user = userEvent.setup()
    const onShow = vi.fn()
    render(<ShowMoreReplies count={3} onShow={onShow} />)
    await user.click(screen.getByRole('button'))
    expect(onShow).toHaveBeenCalledTimes(1)
  })

  it('has aria-live polite for screen readers', () => {
    const { container } = render(<ShowMoreReplies count={3} onShow={vi.fn()} />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<ShowMoreReplies count={3} onShow={vi.fn()} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
