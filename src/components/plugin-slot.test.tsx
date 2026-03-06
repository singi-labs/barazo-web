/**
 * Tests for PluginSlot component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { PluginSlot } from './plugin-slot'
import { usePlugins } from '@/hooks/use-plugins'
import { getPluginComponents } from '@/lib/plugins/registry'
import type { PluginRegistration } from '@/lib/plugins/registry'
import type { PluginContextValue } from '@/context/plugin-context'

vi.mock('@/hooks/use-plugins', () => ({
  usePlugins: vi.fn(),
}))

vi.mock('@/lib/plugins/registry', () => ({
  getPluginComponents: vi.fn(),
}))

// Test helper components
function TestPluginComponent({ authorDid }: { authorDid?: string }) {
  return <div data-testid="test-plugin">Plugin content: {authorDid}</div>
}

function CrashingPluginComponent() {
  throw new Error('Plugin crashed!')
}

function createMockPluginContext(
  plugins: PluginContextValue['plugins'] = []
): PluginContextValue {
  return {
    plugins,
    isPluginEnabled: (name: string) => plugins.some((p) => p.name === name && p.enabled),
    getPluginSettings: () => null,
    isLoading: false,
    refreshPlugins: vi.fn(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getPluginComponents).mockReturnValue([])
  vi.mocked(usePlugins).mockReturnValue(createMockPluginContext())
})

describe('PluginSlot', () => {
  it('renders nothing when no plugins are registered for the slot', () => {
    vi.mocked(getPluginComponents).mockReturnValue([])

    const { container } = render(<PluginSlot name="post-content" />)
    expect(container.innerHTML).toBe('')
  })

  it('renders fallback when provided and no plugins registered', () => {
    vi.mocked(getPluginComponents).mockReturnValue([])

    render(<PluginSlot name="post-content" fallback={<div>Fallback content</div>} />)
    expect(screen.getByText('Fallback content')).toBeInTheDocument()
  })

  it('renders fallback when plugins are registered but none are enabled', () => {
    vi.mocked(getPluginComponents).mockReturnValue([
      {
        pluginName: 'disabled-plugin',
        component: TestPluginComponent,
      },
    ] as PluginRegistration[])

    vi.mocked(usePlugins).mockReturnValue(
      createMockPluginContext([
        {
          id: '1',
          name: 'disabled-plugin',
          displayName: 'Disabled Plugin',
          version: '1.0.0',
          description: 'A disabled plugin',
          source: 'builtin',
          enabled: false,
          category: 'content',
          dependencies: [],
          dependents: [],
          settingsSchema: { fields: [] },
          settings: {},
          installedAt: '2026-01-01T00:00:00Z',
        },
      ])
    )

    render(<PluginSlot name="post-content" fallback={<div>Fallback content</div>} />)
    expect(screen.getByText('Fallback content')).toBeInTheDocument()
    expect(screen.queryByTestId('test-plugin')).not.toBeInTheDocument()
  })

  it('renders plugin component when registered and plugin is enabled', () => {
    vi.mocked(getPluginComponents).mockReturnValue([
      {
        pluginName: 'test-plugin',
        component: TestPluginComponent,
      },
    ] as PluginRegistration[])

    vi.mocked(usePlugins).mockReturnValue(
      createMockPluginContext([
        {
          id: '1',
          name: 'test-plugin',
          displayName: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          source: 'builtin',
          enabled: true,
          category: 'content',
          dependencies: [],
          dependents: [],
          settingsSchema: { fields: [] },
          settings: {},
          installedAt: '2026-01-01T00:00:00Z',
        },
      ])
    )

    render(<PluginSlot name="post-content" />)
    expect(screen.getByTestId('test-plugin')).toBeInTheDocument()
  })

  it('does not render plugin component when plugin is disabled', () => {
    vi.mocked(getPluginComponents).mockReturnValue([
      {
        pluginName: 'test-plugin',
        component: TestPluginComponent,
      },
    ] as PluginRegistration[])

    vi.mocked(usePlugins).mockReturnValue(
      createMockPluginContext([
        {
          id: '1',
          name: 'test-plugin',
          displayName: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          source: 'builtin',
          enabled: false,
          category: 'content',
          dependencies: [],
          dependents: [],
          settingsSchema: { fields: [] },
          settings: {},
          installedAt: '2026-01-01T00:00:00Z',
        },
      ])
    )

    render(<PluginSlot name="post-content" />)
    expect(screen.queryByTestId('test-plugin')).not.toBeInTheDocument()
  })

  it('error boundary catches crashing plugin component and shows error message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(getPluginComponents).mockReturnValue([
      {
        pluginName: 'crashing-plugin',
        component: CrashingPluginComponent,
      },
    ] as PluginRegistration[])

    vi.mocked(usePlugins).mockReturnValue(
      createMockPluginContext([
        {
          id: '1',
          name: 'crashing-plugin',
          displayName: 'Crashing Plugin',
          version: '1.0.0',
          description: 'A crashing plugin',
          source: 'builtin',
          enabled: true,
          category: 'content',
          dependencies: [],
          dependents: [],
          settingsSchema: { fields: [] },
          settings: {},
          installedAt: '2026-01-01T00:00:00Z',
        },
      ])
    )

    render(<PluginSlot name="post-content" />)
    expect(screen.getByText(/crashing-plugin/)).toBeInTheDocument()
    expect(screen.getByText(/encountered an error/)).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('passes context props to plugin components', () => {
    vi.mocked(getPluginComponents).mockReturnValue([
      {
        pluginName: 'test-plugin',
        component: TestPluginComponent,
      },
    ] as PluginRegistration[])

    vi.mocked(usePlugins).mockReturnValue(
      createMockPluginContext([
        {
          id: '1',
          name: 'test-plugin',
          displayName: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          source: 'builtin',
          enabled: true,
          category: 'content',
          dependencies: [],
          dependents: [],
          settingsSchema: { fields: [] },
          settings: {},
          installedAt: '2026-01-01T00:00:00Z',
        },
      ])
    )

    render(<PluginSlot name="post-content" context={{ authorDid: 'did:plc:abc123' }} />)
    expect(screen.getByText('Plugin content: did:plc:abc123')).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    vi.mocked(getPluginComponents).mockReturnValue([
      {
        pluginName: 'test-plugin',
        component: TestPluginComponent,
      },
    ] as PluginRegistration[])

    vi.mocked(usePlugins).mockReturnValue(
      createMockPluginContext([
        {
          id: '1',
          name: 'test-plugin',
          displayName: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          source: 'builtin',
          enabled: true,
          category: 'content',
          dependencies: [],
          dependents: [],
          settingsSchema: { fields: [] },
          settings: {},
          installedAt: '2026-01-01T00:00:00Z',
        },
      ])
    )

    const { container } = render(
      <PluginSlot name="post-content" context={{ authorDid: 'did:plc:abc123' }} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('passes axe accessibility check with error boundary fallback', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(getPluginComponents).mockReturnValue([
      {
        pluginName: 'crashing-plugin',
        component: CrashingPluginComponent,
      },
    ] as PluginRegistration[])

    vi.mocked(usePlugins).mockReturnValue(
      createMockPluginContext([
        {
          id: '1',
          name: 'crashing-plugin',
          displayName: 'Crashing Plugin',
          version: '1.0.0',
          description: 'A crashing plugin',
          source: 'builtin',
          enabled: true,
          category: 'content',
          dependencies: [],
          dependents: [],
          settingsSchema: { fields: [] },
          settings: {},
          installedAt: '2026-01-01T00:00:00Z',
        },
      ])
    )

    const { container } = render(<PluginSlot name="post-content" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()

    vi.restoreAllMocks()
  })
})
