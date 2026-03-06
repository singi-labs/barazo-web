/**
 * Tests for admin plugins page.
 * @see specs/prd-web.md Section M13
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import AdminPluginsPage from './page'
import { usePluginManagement } from '@/hooks/admin/use-plugin-management'
import type { Plugin } from '@/lib/api/types'

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

vi.mock('@/hooks/admin/use-plugin-management')

const mockPlugin: Plugin = {
  id: '1',
  name: '@barazo/plugin-signatures',
  displayName: 'User Signatures',
  version: '1.0.0',
  description: 'Portable user signatures',
  source: 'core',
  enabled: true,
  category: 'social',
  dependencies: [],
  dependents: [],
  settingsSchema: {},
  settings: {},
  installedAt: '2026-01-01T00:00:00Z',
}

function mockPluginManagement(overrides: Partial<ReturnType<typeof usePluginManagement>> = {}) {
  vi.mocked(usePluginManagement).mockReturnValue({
    plugins: [],
    loading: false,
    settingsPlugin: null,
    setSettingsPlugin: vi.fn(),
    dependencyWarning: null,
    setDependencyWarning: vi.fn(),
    loadError: null,
    actionError: null,
    setActionError: vi.fn(),
    fetchPlugins: vi.fn(),
    handleToggle: vi.fn(),
    confirmDisable: vi.fn(),
    handleSaveSettings: vi.fn(),
    handleUninstall: vi.fn(),
    settingsSaveStatus: 'idle',
    ...overrides,
  })
}

describe('AdminPluginsPage', () => {
  it('renders page heading', () => {
    mockPluginManagement()
    render(<AdminPluginsPage />)
    expect(screen.getByRole('heading', { name: /plugins/i, level: 1 })).toBeInTheDocument()
  })

  it('shows empty state when no plugins installed', () => {
    mockPluginManagement({ plugins: [], loading: false })
    render(<AdminPluginsPage />)
    expect(screen.getByText(/no plugins installed/i)).toBeInTheDocument()
  })

  it('shows loading skeletons', () => {
    mockPluginManagement({ loading: true })
    render(<AdminPluginsPage />)
    expect(screen.getByLabelText(/loading plugins/i)).toBeInTheDocument()
  })

  it('shows plugin list when plugins exist', () => {
    mockPluginManagement({ plugins: [mockPlugin] })
    render(<AdminPluginsPage />)
    expect(screen.getByText('User Signatures')).toBeInTheDocument()
  })

  it('shows load error', () => {
    mockPluginManagement({ loadError: 'Failed to load plugins.' })
    render(<AdminPluginsPage />)
    expect(screen.getByText(/failed to load plugins/i)).toBeInTheDocument()
  })

  it('passes axe accessibility check with empty state', async () => {
    mockPluginManagement()
    const { container } = render(<AdminPluginsPage />)
    await waitFor(async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
