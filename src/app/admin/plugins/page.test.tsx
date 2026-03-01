/**
 * Tests for admin plugins page.
 * @see specs/prd-web.md Section M13
 */

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import AdminPluginsPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/plugins',
}))

vi.mock('@/hooks/use-auth', () => {
  const mockAuth = {
    user: {
      did: 'did:plc:user-jay-001',
      handle: 'jay.bsky.team',
      displayName: 'Jay',
      avatarUrl: null,
    },
    isAuthenticated: true,
    isLoading: false,
    getAccessToken: () => 'mock-access-token',
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
  }
  return { useAuth: () => mockAuth }
})

describe('AdminPluginsPage', () => {
  it('renders page heading', async () => {
    render(<AdminPluginsPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /plugins/i, level: 1 })).toBeInTheDocument()
    })
  })

  it('renders plugin list from API', async () => {
    render(<AdminPluginsPage />)
    await waitFor(() => {
      expect(screen.getByText('Full-Text Search')).toBeInTheDocument()
    })
    expect(screen.getByText('Markdown Editor')).toBeInTheDocument()
    expect(screen.getByText('Code Highlighting')).toBeInTheDocument()
    expect(screen.getByText('Community Analytics')).toBeInTheDocument()
    expect(screen.getByText('Webhook Notifications')).toBeInTheDocument()
  })

  it('shows source badges (Core, Official, Community, Experimental)', async () => {
    render(<AdminPluginsPage />)
    await waitFor(() => {
      expect(screen.getAllByText('Core').length).toBeGreaterThanOrEqual(2)
    })
    expect(screen.getByText('Official')).toBeInTheDocument()
    expect(screen.getByText('Community')).toBeInTheDocument()
    expect(screen.getByText('Experimental')).toBeInTheDocument()
  })

  it('shows version numbers', async () => {
    render(<AdminPluginsPage />)
    await waitFor(() => {
      expect(screen.getByText('v1.0.0')).toBeInTheDocument()
    })
    expect(screen.getByText('v1.2.0')).toBeInTheDocument()
    expect(screen.getByText('v0.2.0-beta')).toBeInTheDocument()
  })

  it('shows enabled/disabled state for plugins', async () => {
    render(<AdminPluginsPage />)
    await waitFor(() => {
      expect(screen.getByText('Full-Text Search')).toBeInTheDocument()
    })
    // Find toggle buttons - enabled plugins should have checked toggles
    const toggles = screen.getAllByRole('switch')
    expect(toggles.length).toBeGreaterThanOrEqual(5)
  })

  it('shows dependency warning when attempting to disable a plugin with dependents', async () => {
    const user = userEvent.setup()
    render(<AdminPluginsPage />)
    await waitFor(() => {
      expect(screen.getByText('Markdown Editor')).toBeInTheDocument()
    })

    // Markdown Editor has dependents: ['barazo-plugin-code-highlight']
    // Find the Markdown Editor card and its toggle
    const markdownCard = screen.getByText('Markdown Editor').closest('article')
    expect(markdownCard).toBeTruthy()
    const toggle = within(markdownCard!).getByRole('switch')
    await user.click(toggle)

    // Should show dependency warning dialog
    await waitFor(() => {
      expect(screen.getByText('Dependency Warning')).toBeInTheDocument()
    })
    expect(screen.getByText('Disable Anyway')).toBeInTheDocument()
  })

  it('opens settings modal when settings button is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminPluginsPage />)
    await waitFor(() => {
      expect(screen.getByText('Full-Text Search')).toBeInTheDocument()
    })

    // Click settings button on Full-Text Search plugin
    const searchCard = screen.getByText('Full-Text Search').closest('article')
    expect(searchCard).toBeTruthy()
    const settingsBtn = within(searchCard!).getByRole('button', { name: /settings/i })
    await user.click(settingsBtn)

    // Should show settings modal with schema fields
    await waitFor(() => {
      expect(screen.getByText('Enable semantic search')).toBeInTheDocument()
    })
  })

  it('shows plugin descriptions', async () => {
    render(<AdminPluginsPage />)
    await waitFor(() => {
      expect(screen.getByText(/full-text search for topics and replies/i)).toBeInTheDocument()
    })
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminPluginsPage />)
    await waitFor(() => {
      expect(screen.getByText('Full-Text Search')).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
