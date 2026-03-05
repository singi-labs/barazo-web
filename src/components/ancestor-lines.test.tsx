import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { AncestorLines } from './ancestor-lines'

describe('AncestorLines', () => {
  it('renders one button per ancestor', () => {
    const ancestors = [
      { uri: 'a1', authorName: 'Alice', replyCount: 3, expanded: true },
      { uri: 'a2', authorName: 'Bob', replyCount: 5, expanded: true },
    ]
    render(
      <AncestorLines ancestors={ancestors} onToggle={vi.fn()} showChevron={false} lineWidth={22} />
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('applies decreasing opacity from right to left', () => {
    const ancestors = [
      { uri: 'a1', authorName: 'Alice', replyCount: 3, expanded: true },
      { uri: 'a2', authorName: 'Bob', replyCount: 5, expanded: true },
      { uri: 'a3', authorName: 'Carol', replyCount: 1, expanded: true },
    ]
    const { container } = render(
      <AncestorLines ancestors={ancestors} onToggle={vi.fn()} showChevron={false} lineWidth={22} />
    )
    const lines = container.querySelectorAll('[aria-hidden="true"]')
    expect(lines.length).toBeGreaterThan(0)
    // Verify different opacity values exist
    const opacities = Array.from(lines).map((l) => l.getAttribute('style'))
    const uniqueOpacities = new Set(opacities)
    expect(uniqueOpacities.size).toBeGreaterThan(1)
  })

  it('calls onToggle with correct uri when an ancestor line is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const ancestors = [
      { uri: 'a1', authorName: 'Alice', replyCount: 3, expanded: true },
      { uri: 'a2', authorName: 'Bob', replyCount: 5, expanded: true },
    ]
    render(
      <AncestorLines ancestors={ancestors} onToggle={onToggle} showChevron={false} lineWidth={22} />
    )
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0]!)
    expect(onToggle).toHaveBeenCalledWith('a1')
  })

  it('renders nothing when ancestors array is empty', () => {
    const { container } = render(
      <AncestorLines ancestors={[]} onToggle={vi.fn()} showChevron={false} lineWidth={22} />
    )
    expect(container.querySelector('button')).not.toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const ancestors = [{ uri: 'a1', authorName: 'Alice', replyCount: 3, expanded: true }]
    const { container } = render(
      <AncestorLines ancestors={ancestors} onToggle={vi.fn()} showChevron={false} lineWidth={22} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
