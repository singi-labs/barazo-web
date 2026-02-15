/**
 * Tests for AgeGateDialog component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgeGateDialog } from './age-gate-dialog'

const mockGetAccessToken = vi.fn<() => string | null>(() => 'mock-access-token')

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      did: 'did:plc:user-alice-001',
      handle: 'alice.bsky.social',
      displayName: 'Alice',
      avatarUrl: null,
    },
    isAuthenticated: true,
    isLoading: false,
    getAccessToken: mockGetAccessToken,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
  }),
}))

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

  it('renders dialog with dropdown when open', () => {
    render(<AgeGateDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Age Declaration')).toBeInTheDocument()
    expect(screen.getByLabelText('Your age bracket')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
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

  it('shows all age bracket options in dropdown', () => {
    render(<AgeGateDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    const select = screen.getByLabelText('Your age bracket') as HTMLSelectElement
    const options = Array.from(select.options).map((o) => o.text)

    expect(options).toContain('Select age bracket...')
    expect(options).toContain('Rather not say')
    expect(options).toContain('13+')
    expect(options).toContain('14+')
    expect(options).toContain('15+')
    expect(options).toContain('16+')
    expect(options).toContain('18+')
  })

  it('disables Confirm button when no age selected', () => {
    render(<AgeGateDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    const confirmBtn = screen.getByText('Confirm')
    expect(confirmBtn).toBeDisabled()
  })

  it('enables Confirm button when age is selected', async () => {
    render(<AgeGateDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)

    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Your age bracket'), '16')

    expect(screen.getByText('Confirm')).not.toBeDisabled()
  })

  it('calls onConfirm with declaredAge when confirmed', async () => {
    const onConfirm = vi.fn()
    render(<AgeGateDialog open={true} onConfirm={onConfirm} onCancel={vi.fn()} />)

    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Your age bracket'), '16')
    await user.click(screen.getByText('Confirm'))

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce()
    })
    expect(onConfirm).toHaveBeenCalledWith(16)
  })

  it('shows "Rather not say" explanation when 0 is selected', async () => {
    render(<AgeGateDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)

    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Your age bracket'), '0')

    expect(
      screen.getByText(/Rather not say.*means you will only see Safe content/)
    ).toBeInTheDocument()
  })

  it('shows error when not authenticated', async () => {
    mockGetAccessToken.mockReturnValue(null)
    render(<AgeGateDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)

    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Your age bracket'), '16')
    await user.click(screen.getByText('Confirm'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Not authenticated')
    })
  })
})
