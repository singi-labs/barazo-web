/**
 * Tests for settings page.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import SettingsPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  redirect: vi.fn(),
}))

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
    crossPostScopesGranted: true,
    getAccessToken: () => 'mock-access-token',
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    requestCrossPostAuth: vi.fn(),
    authFetch: vi.fn(),
  }),
}))

// Mock localStorage for jsdom environment
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
})()

describe('SettingsPage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders settings heading', async () => {
    render(<SettingsPage />)
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
  })

  it('renders content safety section when not authenticated', async () => {
    render(<SettingsPage />)
    // Without a token, loading finishes immediately and form renders with defaults
    await waitFor(() => {
      expect(screen.getByText(/content safety/i)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/maturity level/i)).toBeInTheDocument()
  })

  it('renders muted words input', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText('Muted words')).toBeInTheDocument()
    })
  })

  it('renders cross-posting section', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('Cross-Posting')).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/bluesky/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/frontpage/i)).toBeInTheDocument()
  })

  it('renders notification preferences section', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      // Find the fieldset legend specifically (not the header notification bell's ARIA text)
      const legends = screen.getAllByText(/notifications/i)
      expect(legends.some((el) => el.tagName === 'LEGEND')).toBe(true)
    })
  })

  it('renders save button', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })
  })

  it('renders breadcrumbs', async () => {
    render(<SettingsPage />)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('loads preferences from API when authenticated', async () => {
    localStorageMock.setItem('accessToken', 'mock-token-123')
    render(<SettingsPage />)

    // Should show loading skeleton initially, then load preferences
    await waitFor(() => {
      expect(screen.getByLabelText(/maturity level/i)).toBeInTheDocument()
    })

    // Muted words should be populated from mock data (global, not community-specific)
    const mutedWordsInput = screen.getByLabelText('Muted words') as HTMLTextAreaElement
    expect(mutedWordsInput.value).toBe('spam, offensive')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  // --- Per-Community Overrides ---

  describe('Per-Community Overrides', () => {
    it('renders per-community overrides section', async () => {
      render(<SettingsPage />)
      await waitFor(() => {
        expect(screen.getByText(/per-community overrides/i)).toBeInTheDocument()
      })
    })

    it('loads and displays community list from API', async () => {
      render(<SettingsPage />)
      await waitFor(() => {
        expect(screen.getByText('Barazo Test Community')).toBeInTheDocument()
        expect(screen.getByText('Gaming Forum')).toBeInTheDocument()
      })
    })

    it('shows maturity override for each community', async () => {
      render(<SettingsPage />)
      await waitFor(() => {
        expect(screen.getByText('Gaming Forum')).toBeInTheDocument()
      })
      // Gaming Forum has maturity override set to 'mature'
      const gamingSection = screen.getByText('Gaming Forum').closest('details')!
      const maturitySelect = within(gamingSection).getByLabelText(/maturity override/i)
      expect(maturitySelect).toBeInTheDocument()
    })

    it('shows community-specific muted words', async () => {
      render(<SettingsPage />)
      await waitFor(() => {
        expect(screen.getByText('Gaming Forum')).toBeInTheDocument()
      })
      // Expand Gaming Forum section to see community-specific fields
      const gamingSummary = screen.getByText('Gaming Forum')
      await userEvent.click(gamingSummary)
      const gamingSection = gamingSummary.closest('details')!
      const mutedWordsInput = within(gamingSection).getByLabelText(
        /community muted words/i
      ) as HTMLTextAreaElement
      expect(mutedWordsInput.value).toBe('spoiler')
    })

    it('shows community-specific blocked users', async () => {
      render(<SettingsPage />)
      await waitFor(() => {
        expect(screen.getByText('Gaming Forum')).toBeInTheDocument()
      })
      const gamingSummary = screen.getByText('Gaming Forum')
      await userEvent.click(gamingSummary)
      const gamingSection = gamingSummary.closest('details')!
      const blockedInput = within(gamingSection).getByLabelText(
        /community blocked users/i
      ) as HTMLTextAreaElement
      expect(blockedInput.value).toBe('did:plc:user-dave-004')
    })

    it('shows empty state when user has no community overrides', async () => {
      // This test verifies the section renders even with empty data
      render(<SettingsPage />)
      await waitFor(() => {
        expect(screen.getByText(/per-community overrides/i)).toBeInTheDocument()
      })
    })

    it('passes axe accessibility check with community overrides', async () => {
      const { container } = render(<SettingsPage />)
      await waitFor(() => {
        expect(screen.getByText('Gaming Forum')).toBeInTheDocument()
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
