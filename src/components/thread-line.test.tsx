import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ThreadHoverProvider } from '@/context/thread-hover-context'
import { ThreadLine } from './thread-line'

function renderWithProvider(ui: React.ReactElement) {
  return render(<ThreadHoverProvider>{ui}</ThreadHoverProvider>)
}

describe('ThreadLine', () => {
  const defaultProps = {
    expanded: true,
    onToggle: vi.fn(),
    authorName: 'Alex',
    replyCount: 5,
    ancestorUri: 'at://test/line1',
    opacity: 1,
    showChevron: true,
  }

  it('renders as a button', () => {
    renderWithProvider(<ThreadLine {...defaultProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has aria-expanded matching expanded prop', () => {
    const { rerender } = renderWithProvider(<ThreadLine {...defaultProps} expanded={true} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')

    rerender(
      <ThreadHoverProvider>
        <ThreadLine {...defaultProps} expanded={false} />
      </ThreadHoverProvider>
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('has descriptive aria-label including author and reply count', () => {
    renderWithProvider(<ThreadLine {...defaultProps} expanded={true} replyCount={5} />)
    const label = screen.getByRole('button').getAttribute('aria-label')!
    expect(label).toContain('Alex')
    expect(label).toContain('5')
  })

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderWithProvider(<ThreadLine {...defaultProps} onToggle={onToggle} />)
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
    const { container } = renderWithProvider(<ThreadLine {...defaultProps} showChevron={false} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('applies opacity style to the line', () => {
    const { container } = renderWithProvider(<ThreadLine {...defaultProps} opacity={0.5} />)
    const line = container.querySelector('[aria-hidden="true"]')
    expect(line).toBeInTheDocument()
    expect(line!.getAttribute('style')).toContain('opacity')
  })

  it('applies width from prop', () => {
    const { container } = renderWithProvider(<ThreadLine {...defaultProps} width={22} />)
    const button = container.querySelector('button')!
    expect(button.style.width).toBe('22px')
  })

  it('passes axe accessibility check', async () => {
    const { container } = renderWithProvider(<ThreadLine {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
