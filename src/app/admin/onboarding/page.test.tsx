/**
 * Tests for admin onboarding fields page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { mockOnboardingFields } from '@/mocks/data'
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
    expect(screen.getByText('Age Declaration')).toBeInTheDocument()
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
    // ToS and Age Declaration are both mandatory
    expect(screen.getAllByText('Required')).toHaveLength(2)
  })

  it('renders add field button', () => {
    render(<AdminOnboardingPage />)
    expect(screen.getByRole('button', { name: /add field/i })).toBeInTheDocument()
  })

  it('shows create form when add field button is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    expect(screen.getByRole('combobox', { name: /field type/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /^label$/i })).toBeInTheDocument()
  })

  it('shows edit form when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0]!)
    expect(screen.getByRole('textbox', { name: /^label$/i })).toBeInTheDocument()
  })

  it('hides field type selector when editing existing field', async () => {
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0]!)
    expect(screen.queryByRole('combobox', { name: /field type/i })).not.toBeInTheDocument()
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
    expect(screen.getByRole('textbox', { name: /^label$/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('textbox', { name: /^label$/i })).not.toBeInTheDocument()
  })

  it('renders reorder buttons for each field', async () => {
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    expect(screen.getAllByRole('button', { name: /move.*up/i })).toHaveLength(3)
    expect(screen.getAllByRole('button', { name: /move.*down/i })).toHaveLength(3)
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

  it('shows Platform badge for platform-sourced fields', async () => {
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Age Declaration')).toBeInTheDocument()
    })
    expect(screen.getByText('Platform')).toBeInTheDocument()
  })

  it('does not show Platform badge for admin-sourced fields', async () => {
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    // Only one Platform badge (for the age_confirmation field)
    const badges = screen.getAllByText('Platform')
    expect(badges).toHaveLength(1)
  })

  it('does not disable controls for platform fields in selfhosted mode', async () => {
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Age Declaration')).toBeInTheDocument()
    })
    // All edit/delete buttons should be enabled in selfhosted mode
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    editButtons.forEach((btn) => expect(btn).not.toBeDisabled())
    deleteButtons.forEach((btn) => expect(btn).not.toBeDisabled())
  })

  it('disables controls for platform fields in SaaS mode', async () => {
    server.use(
      http.get('/api/admin/onboarding-fields', () => {
        return HttpResponse.json({ fields: mockOnboardingFields, hostingMode: 'saas' })
      })
    )
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Age Declaration')).toBeInTheDocument()
    })
    // Platform field buttons should be disabled
    expect(screen.getByRole('button', { name: /edit age declaration/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /delete age declaration/i })).toBeDisabled()
    // Admin field buttons should remain enabled
    expect(screen.getByRole('button', { name: /edit terms of service/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /delete terms of service/i })).not.toBeDisabled()
  })

  it('shows SaaS note for platform fields in SaaS mode', async () => {
    server.use(
      http.get('/api/admin/onboarding-fields', () => {
        return HttpResponse.json({ fields: mockOnboardingFields, hostingMode: 'saas' })
      })
    )
    render(<AdminOnboardingPage />)
    await waitFor(() => {
      expect(screen.getByText('Age Declaration')).toBeInTheDocument()
    })
    expect(screen.getByText(/this field is required by the barazo platform/i)).toBeInTheDocument()
  })

  it('shows ToS URL input when field type is tos_acceptance', async () => {
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    // Default type is custom_text -- no ToS URL input yet
    expect(screen.queryByRole('textbox', { name: /terms of service url/i })).not.toBeInTheDocument()
    // Switch to tos_acceptance
    await user.selectOptions(
      screen.getByRole('combobox', { name: /field type/i }),
      'tos_acceptance'
    )
    expect(screen.getByRole('textbox', { name: /terms of service url/i })).toBeInTheDocument()
  })

  it('hides ToS URL input for other field types', async () => {
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /field type/i }), 'custom_text')
    expect(screen.queryByRole('textbox', { name: /terms of service url/i })).not.toBeInTheDocument()
  })

  it('saves tosUrl in config when provided', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/admin/onboarding-fields', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            id: 'new-field-1',
            communityDid: 'did:plc:test',
            fieldType: 'tos_acceptance',
            label: 'Accept ToS',
            description: '',
            isMandatory: true,
            sortOrder: 3,
            source: 'admin',
            config: capturedBody?.['config'] ?? null,
            createdAt: '2026-02-15T12:00:00.000Z',
            updatedAt: '2026-02-15T12:00:00.000Z',
          },
          { status: 201 }
        )
      })
    )
    const user = userEvent.setup()
    render(<AdminOnboardingPage />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: /field type/i }),
      'tos_acceptance'
    )
    await user.type(screen.getByRole('textbox', { name: /^label$/i }), 'Accept ToS')
    await user.type(
      screen.getByRole('textbox', { name: /terms of service url/i }),
      'https://example.com/tos'
    )
    await user.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => {
      expect(capturedBody).not.toBeNull()
    })
    expect(capturedBody).toMatchObject({
      config: { tosUrl: 'https://example.com/tos' },
    })
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
