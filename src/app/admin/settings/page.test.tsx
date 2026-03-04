/**
 * Tests for admin community settings page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import AdminSettingsPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/settings',
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

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn() }),
}))

describe('AdminSettingsPage', () => {
  it('renders community settings heading', () => {
    render(<AdminSettingsPage />)
    expect(screen.getByRole('heading', { name: /community settings/i })).toBeInTheDocument()
  })

  it('renders community name input with value', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      const input = screen.getByLabelText(/community name/i) as HTMLInputElement
      expect(input.value).toBe('Barazo Test Community')
    })
  })

  it('renders community description textarea', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })
  })

  it('renders maturity rating select', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/community maturity rating/i)).toBeInTheDocument()
    })
  })

  it('renders reaction set configuration', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/reaction set/i)).toBeInTheDocument()
    })
  })

  it('renders save button', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })
  })

  // --- Max Reply Depth ---

  it('renders max reply depth input with current value', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      const input = screen.getByLabelText(/max reply depth/i) as HTMLInputElement
      expect(input.value).toBe('9999')
    })
  })

  it('enforces minimum value of 1 for max reply depth', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      const input = screen.getByLabelText(/max reply depth/i) as HTMLInputElement
      expect(input).toHaveAttribute('min', '1')
      expect(input).toHaveAttribute('max', '9999')
    })
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/community name/i)).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  // --- PDS Provider Trust section ---

  it('renders PDS Provider Trust heading and help text', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /pds provider trust/i })).toBeInTheDocument()
    })
    expect(screen.getByText(/higher trust factors earn reputation faster/i)).toBeInTheDocument()
  })

  it('renders PDS providers table with trust factors', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('bsky.social')).toBeInTheDocument()
    })
    expect(screen.getByText('northsky.app')).toBeInTheDocument()
    expect(screen.getByText('custom-pds.example')).toBeInTheDocument()
  })

  it('shows Default badge on default providers', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('bsky.social')).toBeInTheDocument()
    })
    const defaultBadges = screen.getAllByText('Default')
    expect(defaultBadges.length).toBe(2) // bsky.social and northsky.app
  })

  it('shows Add Override button that opens dialog', async () => {
    const user = userEvent.setup()
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('bsky.social')).toBeInTheDocument()
    })
    const addBtn = screen.getByRole('button', { name: /add override/i })
    await user.click(addBtn)
    await waitFor(() => {
      expect(screen.getByLabelText(/pds hostname/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/trust factor/i)).toBeInTheDocument()
    })
  })

  it('submits Add Override dialog with hostname and trust factor', async () => {
    const user = userEvent.setup()
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('bsky.social')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /add override/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/pds hostname/i)).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText(/pds hostname/i), 'my-pds.example.org')
    // Adjust the slider via fireEvent (range inputs)
    const slider = screen.getByLabelText(/trust factor/i)
    fireEvent.change(slider, { target: { value: '0.8' } })
    await user.click(screen.getByRole('button', { name: /^add$/i }))
    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByLabelText(/pds hostname/i)).not.toBeInTheDocument()
    })
  })

  it('allows editing trust factor on override providers', async () => {
    const user = userEvent.setup()
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('custom-pds.example')).toBeInTheDocument()
    })
    // Only override (non-default) providers have Edit buttons
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    expect(editButtons.length).toBeGreaterThan(0)
    await user.click(editButtons[0]!)
    // The dialog should open with a slider input and a Save button
    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
  })

  it('allows removing override providers with confirm', async () => {
    const user = userEvent.setup()
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('custom-pds.example')).toBeInTheDocument()
    })
    // Only override providers have Remove buttons
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    expect(removeButtons.length).toBeGreaterThan(0)
    await user.click(removeButtons[0]!)
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /^confirm$/i }))
    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
    })
  })

  it('does not render color fields (moved to /admin/design)', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/community name/i)).toBeInTheDocument()
    })
    expect(screen.queryByLabelText(/primary color/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/accent color/i)).not.toBeInTheDocument()
  })

  it('PDS Provider Trust section passes axe accessibility check', async () => {
    const { container } = render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('bsky.social')).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
