/**
 * Tests for SearchInput component.
 * WAI-ARIA Combobox pattern with result count via role="status".
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { SearchInput } from './search-input'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('SearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders with combobox role', () => {
    render(<SearchInput />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('has correct aria attributes', () => {
    render(<SearchInput />)
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-controls')
  })

  it('shows listbox on typing when suggestions exist', async () => {
    const user = userEvent.setup()
    render(
      <SearchInput
        onSearch={vi.fn()}
        suggestions={[{ type: 'topic', title: 'Test result', rkey: '1', authorHandle: 'jay.bsky.team' }]}
      />
    )
    const input = screen.getByRole('combobox')
    await user.type(input, 'test')

    // Wait for debounce
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350))
    })

    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('calls onSearch with query text', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchInput onSearch={onSearch} />)
    const input = screen.getByRole('combobox')
    await user.type(input, 'barazo')

    // Wait for debounce
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350))
    })

    expect(onSearch).toHaveBeenCalledWith('barazo')
  })

  it('navigates to search page on Enter', async () => {
    const user = userEvent.setup()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')
    await user.type(input, 'query')
    await user.keyboard('{Enter}')

    expect(mockPush).toHaveBeenCalledWith('/search?q=query')
  })

  it('announces result count via role="status"', async () => {
    const user = userEvent.setup()
    render(
      <SearchInput
        onSearch={vi.fn()}
        suggestions={[
          { type: 'topic', title: 'First result', rkey: '1', authorHandle: 'jay.bsky.team' },
          { type: 'topic', title: 'Second result', rkey: '2', authorHandle: 'alex.example.com' },
        ]}
      />
    )
    const input = screen.getByRole('combobox')
    await user.type(input, 'res')

    // Wait for debounce
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350))
    })

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('2 results')
  })

  it('closes suggestions on Escape', async () => {
    const user = userEvent.setup()
    render(
      <SearchInput
        onSearch={vi.fn()}
        suggestions={[{ type: 'topic', title: 'Result', rkey: '1', authorHandle: 'jay.bsky.team' }]}
      />
    )
    const input = screen.getByRole('combobox')
    await user.type(input, 'test')

    await act(async () => {
      await new Promise((r) => setTimeout(r, 350))
    })

    expect(input).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('navigates suggestions with arrow keys', async () => {
    const user = userEvent.setup()
    render(
      <SearchInput
        onSearch={vi.fn()}
        suggestions={[
          { type: 'topic', title: 'First', rkey: '1', authorHandle: 'jay.bsky.team' },
          { type: 'topic', title: 'Second', rkey: '2', authorHandle: 'alex.example.com' },
        ]}
      />
    )
    const input = screen.getByRole('combobox')
    await user.type(input, 'test')

    await act(async () => {
      await new Promise((r) => setTimeout(r, 350))
    })

    await user.keyboard('{ArrowDown}')
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
    expect(options[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('clears input on clear button click', async () => {
    const user = userEvent.setup()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')
    await user.type(input, 'query')
    expect(input).toHaveValue('query')

    const clearButton = screen.getByLabelText('Clear search')
    await user.click(clearButton)
    expect(input).toHaveValue('')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<SearchInput />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
