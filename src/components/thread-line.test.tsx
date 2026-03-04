/**
 * Tests for ThreadLine component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ThreadLine } from './thread-line'

describe('ThreadLine', () => {
  it('renders as a button', () => {
    render(<ThreadLine expanded={true} onToggle={vi.fn()} authorName="Alex" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has aria-expanded matching expanded prop', () => {
    const { rerender } = render(<ThreadLine expanded={true} onToggle={vi.fn()} authorName="Alex" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')

    rerender(<ThreadLine expanded={false} onToggle={vi.fn()} authorName="Alex" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('has descriptive aria-label', () => {
    render(<ThreadLine expanded={true} onToggle={vi.fn()} authorName="Alex" />)
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Alex')
    )
  })

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<ThreadLine expanded={true} onToggle={onToggle} authorName="Alex" />)
    await user.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('has adequate tap target (min 44px width)', () => {
    const { container } = render(
      <ThreadLine expanded={true} onToggle={vi.fn()} authorName="Alex" />
    )
    const button = container.querySelector('button')!
    // The button should have min-width of 44px via class
    expect(button.className).toMatch(/min-w-\[44px\]|w-11/)
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(
      <ThreadLine expanded={true} onToggle={vi.fn()} authorName="Alex" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
