/**
 * Tests for AgeGateDialog component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgeGateDialog } from './age-gate-dialog'

// Mock localStorage
const mockStorage: Record<string, string> = {}

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => mockStorage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key]
    }),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  })
  mockStorage['accessToken'] = 'test-token'
})

afterEach(() => {
  vi.restoreAllMocks()
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
})

describe('AgeGateDialog', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <AgeGateDialog open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog when open', () => {
    render(<AgeGateDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Age Confirmation Required')).toBeInTheDocument()
    expect(screen.getByText('I confirm I am 16 or older')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('has correct ARIA attributes', () => {
    render(<AgeGateDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'age-gate-title')
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(<AgeGateDialog open={true} onConfirm={vi.fn()} onCancel={onCancel} />)

    const user = userEvent.setup()
    await user.click(screen.getByText('Cancel'))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onConfirm with timestamp when confirmed', async () => {
    const onConfirm = vi.fn()
    render(<AgeGateDialog open={true} onConfirm={onConfirm} onCancel={vi.fn()} />)

    const user = userEvent.setup()
    await user.click(screen.getByText('I confirm I am 16 or older'))

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce()
    })
    // The mock handler returns an ageDeclarationAt string
    expect(onConfirm).toHaveBeenCalledWith(expect.any(String))
  })

  it('shows error when not authenticated', async () => {
    delete mockStorage['accessToken']
    render(<AgeGateDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)

    const user = userEvent.setup()
    await user.click(screen.getByText('I confirm I am 16 or older'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Not authenticated')
    })
  })
})
