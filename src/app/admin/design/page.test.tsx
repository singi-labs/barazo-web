/**
 * Tests for admin design page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import AdminDesignPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/design',
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

describe('AdminDesignPage', () => {
  it('renders design heading', () => {
    render(<AdminDesignPage />)
    expect(screen.getByRole('heading', { name: /design/i })).toBeInTheDocument()
  })

  it('renders header logo upload with help text', async () => {
    render(<AdminDesignPage />)
    await waitFor(() => {
      expect(screen.getByText('Header Logo')).toBeInTheDocument()
    })
    expect(screen.getByText(/Wide logo or wordmark for the forum header/)).toBeInTheDocument()
  })

  it('renders logo upload section with help text', async () => {
    render(<AdminDesignPage />)
    await waitFor(() => {
      expect(screen.getByText('Community Logo')).toBeInTheDocument()
    })
    expect(screen.getByText(/512×512px.*JPEG, PNG, WebP, GIF/)).toBeInTheDocument()
  })

  it('renders favicon upload section with help text', async () => {
    render(<AdminDesignPage />)
    await waitFor(() => {
      expect(screen.getByText('Favicon')).toBeInTheDocument()
    })
    expect(screen.getByText(/256×256px.*JPEG, PNG, WebP, GIF/)).toBeInTheDocument()
  })

  it('renders "Show community name" toggle, defaults to checked', async () => {
    render(<AdminDesignPage />)
    await waitFor(() => {
      const toggle = screen.getByRole('checkbox', { name: /show community name/i })
      expect(toggle).toBeInTheDocument()
      expect(toggle).toBeChecked()
    })
  })

  it('renders primary color input', async () => {
    render(<AdminDesignPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/primary color/i)).toBeInTheDocument()
    })
  })

  it('renders accent color input', async () => {
    render(<AdminDesignPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/accent color/i)).toBeInTheDocument()
    })
  })

  it('renders save colors button', async () => {
    render(<AdminDesignPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save colors/i })).toBeInTheDocument()
    })
  })

  it('loads color values from settings', async () => {
    render(<AdminDesignPage />)
    await waitFor(() => {
      const primaryInput = screen.getByLabelText(/primary color/i) as HTMLInputElement
      expect(primaryInput.value).toBe('#31748f')
    })
    const accentInput = screen.getByLabelText(/accent color/i) as HTMLInputElement
    expect(accentInput.value).toBe('#c4a7e7')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminDesignPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/primary color/i)).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
