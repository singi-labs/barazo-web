import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ThreadLine } from './thread-line'

describe('ThreadLine', () => {
  const defaultProps = {
    expanded: true,
    onToggle: vi.fn(),
    authorName: 'Alex',
    replyCount: 5,
    opacity: 1,
    showChevron: true,
  }

  it('renders as a button', () => {
    render(<ThreadLine {...defaultProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has aria-expanded matching expanded prop', () => {
    const { rerender } = render(<ThreadLine {...defaultProps} expanded={true} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')

    rerender(<ThreadLine {...defaultProps} expanded={false} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('has descriptive aria-label including author and reply count', () => {
    render(<ThreadLine {...defaultProps} expanded={true} replyCount={5} />)
    const label = screen.getByRole('button').getAttribute('aria-label')!
    expect(label).toContain('Alex')
    expect(label).toContain('5')
  })

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<ThreadLine {...defaultProps} onToggle={onToggle} />)
    await user.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('renders chevron icon when showChevron is true', () => {
    const { container } = render(
      <ThreadLine {...defaultProps} expanded={true} showChevron={true} />
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('does not render chevron icon when showChevron is false', () => {
    const { container } = render(<ThreadLine {...defaultProps} showChevron={false} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('applies opacity style to the line', () => {
    const { container } = render(<ThreadLine {...defaultProps} opacity={0.5} />)
    const line = container.querySelector('[aria-hidden="true"]')
    expect(line).toBeInTheDocument()
    expect(line!.getAttribute('style')).toContain('opacity')
  })

  it('has adequate tap target (min 44px)', () => {
    const { container } = render(<ThreadLine {...defaultProps} />)
    const button = container.querySelector('button')!
    expect(button.className).toMatch(/min-w-\[44px\]/)
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<ThreadLine {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
