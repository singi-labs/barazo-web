/**
 * Tests for admin moderation page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import AdminModerationPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/moderation',
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
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
    getAccessToken: () => 'mock-access-token',
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
  }),
}))

describe('AdminModerationPage', () => {
  it('renders moderation heading', () => {
    render(<AdminModerationPage />)
    expect(screen.getByRole('heading', { name: /moderation/i })).toBeInTheDocument()
  })

  it('renders tab navigation', () => {
    render(<AdminModerationPage />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /reports/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /first post/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /action log/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /reported users/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /thresholds/i })).toBeInTheDocument()
  })

  it('shows reports queue by default', async () => {
    render(<AdminModerationPage />)
    await waitFor(() => {
      expect(screen.getAllByText(/misleading/i).length).toBeGreaterThan(0)
    })
  })

  it('highlights potentially illegal reports', async () => {
    render(<AdminModerationPage />)
    await waitFor(() => {
      expect(screen.getAllByText(/potentially illegal/i).length).toBeGreaterThan(0)
    })
  })

  it('shows resolve actions on reports', async () => {
    render(<AdminModerationPage />)
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /dismiss/i }).length).toBeGreaterThan(0)
    })
  })

  it('switches to first post queue tab', async () => {
    const user = userEvent.setup()
    render(<AdminModerationPage />)
    const firstPostTab = screen.getByRole('tab', { name: /first post/i })
    await user.click(firstPostTab)
    await waitFor(() => {
      expect(screen.getByText(/newbie\.bsky\.social/i)).toBeInTheDocument()
    })
  })

  it('shows account age for first post queue items', async () => {
    const user = userEvent.setup()
    render(<AdminModerationPage />)
    await user.click(screen.getByRole('tab', { name: /first post/i }))
    await waitFor(() => {
      expect(screen.getByText(/2 days/i)).toBeInTheDocument()
    })
  })

  it('shows cross-community count for first post items', async () => {
    const user = userEvent.setup()
    render(<AdminModerationPage />)
    await user.click(screen.getByRole('tab', { name: /first post/i }))
    await waitFor(() => {
      expect(screen.getByText(/active in 3 other communities/i)).toBeInTheDocument()
    })
  })

  it('switches to action log tab', async () => {
    const user = userEvent.setup()
    render(<AdminModerationPage />)
    await user.click(screen.getByRole('tab', { name: /action log/i }))
    await waitFor(() => {
      expect(screen.getByText(/pinned/i)).toBeInTheDocument()
    })
  })

  it('switches to reported users tab', async () => {
    const user = userEvent.setup()
    render(<AdminModerationPage />)
    await user.click(screen.getByRole('tab', { name: /reported users/i }))
    await waitFor(() => {
      expect(screen.getByText(/dave\.bsky\.social/i)).toBeInTheDocument()
    })
  })

  it('shows cross-community ban warning for reported users', async () => {
    const user = userEvent.setup()
    render(<AdminModerationPage />)
    await user.click(screen.getByRole('tab', { name: /reported users/i }))
    await waitFor(() => {
      expect(screen.getByText(/banned from 2 other communities/i)).toBeInTheDocument()
    })
  })

  it('switches to thresholds tab', async () => {
    const user = userEvent.setup()
    render(<AdminModerationPage />)
    await user.click(screen.getByRole('tab', { name: /thresholds/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/auto-block/i)).toBeInTheDocument()
    })
  })

  it('shows batch action controls in first post queue', async () => {
    const user = userEvent.setup()
    render(<AdminModerationPage />)
    await user.click(screen.getByRole('tab', { name: /first post/i }))
    await waitFor(() => {
      expect(screen.getByText(/newbie\.bsky\.social/i)).toBeInTheDocument()
    })
    // Select all checkbox
    const selectAll = screen.getByRole('checkbox', { name: /select all/i })
    expect(selectAll).toBeInTheDocument()
    // Individual checkboxes for each item
    const itemCheckboxes = screen.getAllByRole('checkbox').filter((cb) => cb !== selectAll)
    expect(itemCheckboxes.length).toBe(2)
  })

  it('shows batch approve/reject buttons when items are selected', async () => {
    const user = userEvent.setup()
    render(<AdminModerationPage />)
    await user.click(screen.getByRole('tab', { name: /first post/i }))
    await waitFor(() => {
      expect(screen.getByText(/newbie\.bsky\.social/i)).toBeInTheDocument()
    })
    // Batch buttons should not be visible when nothing is selected
    expect(screen.queryByRole('button', { name: /approve selected/i })).not.toBeInTheDocument()
    // Select all items
    await user.click(screen.getByRole('checkbox', { name: /select all/i }))
    // Batch buttons should now be visible
    expect(screen.getByRole('button', { name: /approve selected/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject selected/i })).toBeInTheDocument()
  })

  it('shows cross-community ban warning in first post queue', async () => {
    const user = userEvent.setup()
    render(<AdminModerationPage />)
    await user.click(screen.getByRole('tab', { name: /first post/i }))
    await waitFor(() => {
      expect(screen.getByText(/banned from 1 other community/i)).toBeInTheDocument()
    })
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminModerationPage />)
    await waitFor(() => {
      expect(screen.getAllByText(/misleading/i).length).toBeGreaterThan(0)
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
