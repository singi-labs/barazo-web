/**
 * Tests for admin onboarding fields page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import AdminOnboardingPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/onboarding',
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

describe('AdminOnboardingPage', () => {
  it('renders onboarding fields heading', () => {
    render(<AdminOnboardingPage />)
    expect(screen.getByRole('heading', { name: /onboarding fields/i })).toBeInTheDocument()
  })

  it('renders fields from API', async () => {
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    expect(screen.getByText('Introduce yourself')).toBeInTheDocument()
  })

  it('renders field type badges', async () => {
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    expect(screen.getByText('ToS Acceptance')).toBeInTheDocument()
    expect(screen.getByText('Text Input')).toBeInTheDocument()
  })

  it('shows required badge for mandatory fields', async () => {
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('renders add field button', () => {
    render(<AdminOnboardingPage />)
    expect(screen.getByRole('button', { name: /add field/i })).toBeInTheDocument()
  })

  it('shows create form when add field button is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    expect(screen.getByLabelText(/field type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^label$/i)).toBeInTheDocument()
  })

  it('shows edit form when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0]!)
    expect(screen.getByLabelText(/^label$/i)).toBeInTheDocument()
  })

  it('hides field type selector when editing existing field', async () => {
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0]!)
    expect(screen.queryByLabelText(/field type/i)).not.toBeInTheDocument()
  })

  it('shows validation error when saving with empty label', async () => {
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.click(screen.getByRole('button', { name: /^save$/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Label is required')
  })

  it('closes form when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    expect(screen.getByLabelText(/^label$/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByLabelText(/^label$/i)).not.toBeInTheDocument()
  })

  it('renders reorder buttons for each field', async () => {
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    expect(screen.getAllByRole('button', { name: /move.*up/i })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: /move.*down/i })).toHaveLength(2)
  })

  it('disables move up on first field and move down on last field', async () => {
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    const moveUpButtons = screen.getAllByRole('button', { name: /move.*up/i })
    const moveDownButtons = screen.getAllByRole('button', { name: /move.*down/i })
    expect(moveUpButtons[0]).toBeDisabled()
    expect(moveDownButtons[moveDownButtons.length - 1]).toBeDisabled()
  })

  it('renders description text', () => {
    render(<AdminOnboardingPage />)
    expect(screen.getByText(/configure fields that users must complete/i)).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
