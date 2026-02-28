/**
 * Tests for BlockMuteButton component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlockMuteButton } from './block-mute-button'

const mockGetAccessToken = vi.fn<() => string | null>(() => 'mock-access-token')
const mockToast = vi.fn()

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

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: vi.fn(),
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

describe('BlockMuteButton', () => {
  it('renders block button in inactive state', () => {
    render(
      <BlockMuteButton
        targetDid="did:plc:target123"
        action="block"
        isActive={false}
        onToggle={vi.fn()}
      />
    )
    expect(screen.getByText('Block')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Block this user')
  })

  it('renders unblock button in active state', () => {
    render(
      <BlockMuteButton
        targetDid="did:plc:target123"
        action="block"
        isActive={true}
        onToggle={vi.fn()}
      />
    )
    expect(screen.getByText('Unblock')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Unblock this user')
  })

  it('renders mute button in inactive state', () => {
    render(
      <BlockMuteButton
        targetDid="did:plc:target123"
        action="mute"
        isActive={false}
        onToggle={vi.fn()}
      />
    )
    expect(screen.getByText('Mute')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Mute this user')
  })

  it('renders unmute button in active state', () => {
    render(
      <BlockMuteButton
        targetDid="did:plc:target123"
        action="mute"
        isActive={true}
        onToggle={vi.fn()}
      />
    )
    expect(screen.getByText('Unmute')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Unmute this user')
  })

  it('calls onToggle after successful block', async () => {
    const onToggle = vi.fn()
    render(
      <BlockMuteButton
        targetDid="did:plc:target123"
        action="block"
        isActive={false}
        onToggle={onToggle}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByText('Block'))

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(true)
    })
  })

  it('calls onToggle after successful mute', async () => {
    const onToggle = vi.fn()
    render(
      <BlockMuteButton
        targetDid="did:plc:target123"
        action="mute"
        isActive={false}
        onToggle={onToggle}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByText('Mute'))

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(true)
    })
  })

  it('does not call onToggle without auth token', async () => {
    mockGetAccessToken.mockReturnValue(null)
    const onToggle = vi.fn()
    render(
      <BlockMuteButton
        targetDid="did:plc:target123"
        action="block"
        isActive={false}
        onToggle={onToggle}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByText('Block'))

    // Wait a tick and verify onToggle was NOT called
    await new Promise((r) => setTimeout(r, 100))
    expect(onToggle).not.toHaveBeenCalled()
  })
})
