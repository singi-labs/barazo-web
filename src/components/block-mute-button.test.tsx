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
      did: 'did:plc:user-jay-001',
      handle: 'jay.bsky.team',
      displayName: 'Jay',
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
  mockGetAccessToken.mockReturnValue('mock-access-token')

  // Mock native dialog methods for JSDOM
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
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

  it('calls onToggle after successful block (dialog already dismissed)', async () => {
    mockStorage['barazo_block_explained'] = '1'
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

  it('calls onToggle after successful mute (dialog already dismissed)', async () => {
    mockStorage['barazo_mute_explained'] = '1'
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
    mockStorage['barazo_block_explained'] = '1'
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

  describe('first-use confirmation dialog', () => {
    it('opens block confirmation dialog on first block click', async () => {
      render(
        <BlockMuteButton
          targetDid="did:plc:target123"
          action="block"
          isActive={false}
          onToggle={vi.fn()}
        />
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('Block'))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Block this user?')).toBeInTheDocument()
    })

    it('calls API and sets localStorage when confirming block dialog', async () => {
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
      await user.click(screen.getByRole('button', { name: /^block$/i }))

      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(true)
      })
      expect(mockStorage['barazo_block_explained']).toBe('1')
    })

    it('does not call API when canceling block dialog', async () => {
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
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await new Promise((r) => setTimeout(r, 100))
      expect(onToggle).not.toHaveBeenCalled()
      expect(mockStorage['barazo_block_explained']).toBeUndefined()
    })

    it('skips dialog when localStorage flag is set for block', async () => {
      mockStorage['barazo_block_explained'] = '1'
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

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(true)
      })
    })

    it('never shows dialog for unblock', async () => {
      const onToggle = vi.fn()
      render(
        <BlockMuteButton
          targetDid="did:plc:target123"
          action="block"
          isActive={true}
          onToggle={onToggle}
        />
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('Unblock'))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(false)
      })
    })

    it('opens mute confirmation dialog on first mute click', async () => {
      render(
        <BlockMuteButton
          targetDid="did:plc:target123"
          action="mute"
          isActive={false}
          onToggle={vi.fn()}
        />
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('Mute'))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Mute this user?')).toBeInTheDocument()
    })

    it('calls API and sets localStorage when confirming mute dialog', async () => {
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
      await user.click(screen.getByRole('button', { name: /^mute$/i }))

      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(true)
      })
      expect(mockStorage['barazo_mute_explained']).toBe('1')
    })

    it('does not call API when canceling mute dialog', async () => {
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
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await new Promise((r) => setTimeout(r, 100))
      expect(onToggle).not.toHaveBeenCalled()
      expect(mockStorage['barazo_mute_explained']).toBeUndefined()
    })

    it('skips dialog when localStorage flag is set for mute', async () => {
      mockStorage['barazo_mute_explained'] = '1'
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

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(true)
      })
    })

    it('never shows dialog for unmute', async () => {
      const onToggle = vi.fn()
      render(
        <BlockMuteButton
          targetDid="did:plc:target123"
          action="mute"
          isActive={true}
          onToggle={onToggle}
        />
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('Unmute'))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(false)
      })
    })
  })
})
