/**
 * Tests for settings page.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
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

vi.mock('@/hooks/use-auth', () => {
  const mockAuth = {
    user: {
      did: 'did:plc:user-jay-001',
      handle: 'jay.bsky.team',
      displayName: 'Jay',
      avatarUrl: null,
      role: 'user' as const,
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
  }
  return { useAuth: () => mockAuth }
})

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

  it('renders account settings heading', async () => {
    render(<SettingsPage />)
    expect(screen.getByRole('heading', { name: /account settings/i })).toBeInTheDocument()
  })

  it('renders content safety section', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByText(/content safety/i)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/maturity level/i)).toBeInTheDocument()
  })

  it('renders age bracket dropdown in community section', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/age bracket/i)).toBeInTheDocument()
    })
    // Age is AppView-specific (not stored in PDS), so it belongs in the community section
    const communitySection = screen
      .getByRole('heading', { name: /your .+ settings/i, level: 2 })
      .closest('section')!
    expect(within(communitySection).getByLabelText(/age bracket/i)).toBeInTheDocument()
  })

  it('renders muted words input', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText('Muted words')).toBeInTheDocument()
    })
  })

  it('renders blocked users section with handle-based input', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('Blocked users')).toBeInTheDocument()
    })
    const safetyFieldset = screen.getByText('Content safety').closest('fieldset')!
    expect(within(safetyFieldset).getByLabelText('Handle to block')).toBeInTheDocument()
    expect(within(safetyFieldset).getByText('No users blocked.')).toBeInTheDocument()
  })

  it('renders cross-posting section', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('Cross-posting')).toBeInTheDocument()
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

  it('renders two save buttons (community and global)', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save community settings/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save global settings/i })).toBeInTheDocument()
    })
  })

  it('renders breadcrumbs', async () => {
    render(<SettingsPage />)
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toHaveTextContent('Home')
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

  // --- Section Layout ---

  describe('Scope-grouped layout', () => {
    it('renders community section heading containing community name', async () => {
      render(<SettingsPage />)
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /your .+ settings/i, level: 2 })
        expect(heading).toBeInTheDocument()
      })
      expect(screen.getByText(/these settings only affect this community/i)).toBeInTheDocument()
    })

    it('renders global section heading with Barazo intro text', async () => {
      render(<SettingsPage />)
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: /your settings across all barazo forums/i,
            level: 2,
          })
        ).toBeInTheDocument()
      })
      // Intro paragraph with links to barazo.forum and atproto.com
      expect(screen.getByText(/built with/i)).toBeInTheDocument()
      const barazoLinks = screen.getAllByRole('link', { name: /barazo/i })
      const barazoForumLink = barazoLinks.find(
        (link) => link.getAttribute('href') === 'https://barazo.forum'
      )
      expect(barazoForumLink).toBeDefined()
      expect(screen.getByRole('link', { name: /at protocol/i })).toHaveAttribute(
        'href',
        'https://atproto.com/'
      )
    })

    it('renders sections in correct DOM order (community first, global second)', async () => {
      render(<SettingsPage />)
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /your .+ settings/i, level: 2 })
        ).toBeInTheDocument()
      })

      const communitySection = screen
        .getByRole('heading', { name: /your .+ settings/i, level: 2 })
        .closest('section')!
      const globalSection = screen
        .getByRole('heading', { name: /your settings across all barazo forums/i, level: 2 })
        .closest('section')!

      // Community section comes before global section in DOM order
      expect(
        communitySection.compareDocumentPosition(globalSection) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
    })

    it('renders reports link inside the community section', async () => {
      render(<SettingsPage />)
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /view my reports/i })).toBeInTheDocument()
      })

      const reportsLink = screen.getByRole('link', { name: /view my reports/i })
      const communitySection = screen
        .getByRole('heading', { name: /your .+ settings/i, level: 2 })
        .closest('section')!

      // Reports link is inside the community section (scoped to this AppView)
      expect(communitySection.contains(reportsLink)).toBe(true)
    })

    it('does not render community overrides content', async () => {
      render(<SettingsPage />)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /account settings/i })).toBeInTheDocument()
      })
      expect(screen.queryByText(/community-specific settings/i)).not.toBeInTheDocument()
      expect(screen.queryByText('Gaming Forum')).not.toBeInTheDocument()
    })

    it('passes axe accessibility check', async () => {
      const { container } = render(<SettingsPage />)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save community settings/i })).toBeInTheDocument()
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
