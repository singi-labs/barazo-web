/**
 * Tests for admin page editor.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import AdminPageEditorPage from './page'

const mockPush = vi.fn()
let mockParams = { id: 'new' }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/admin/pages/new',
  useParams: () => mockParams,
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

describe('AdminPageEditorPage', () => {
  beforeEach(() => {
    mockParams = { id: 'new' }
    mockPush.mockClear()
  })

  describe('create mode (id === "new")', () => {
    it('renders create page heading', () => {
      render(<AdminPageEditorPage />)
      expect(screen.getByRole('heading', { name: /create page/i })).toBeInTheDocument()
    })

    it('renders title input', () => {
      render(<AdminPageEditorPage />)
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    it('renders slug input', () => {
      render(<AdminPageEditorPage />)
      expect(screen.getByLabelText(/slug/i)).toBeInTheDocument()
    })

    it('renders status select', () => {
      render(<AdminPageEditorPage />)
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    })

    it('renders meta description textarea', () => {
      render(<AdminPageEditorPage />)
      expect(screen.getByLabelText(/meta description/i)).toBeInTheDocument()
    })

    it('renders save and cancel buttons', () => {
      render(<AdminPageEditorPage />)
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('does not render delete button in create mode', () => {
      render(<AdminPageEditorPage />)
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    })

    it('auto-generates slug from title in create mode', async () => {
      const user = userEvent.setup()
      render(<AdminPageEditorPage />)
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Hello World')
      const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement
      expect(slugInput.value).toBe('hello-world')
    })

    it('shows character count for meta description', async () => {
      const user = userEvent.setup()
      render(<AdminPageEditorPage />)
      const metaInput = screen.getByLabelText(/meta description/i)
      await user.type(metaInput, 'Test description')
      expect(screen.getByText('16/320')).toBeInTheDocument()
    })

    it('navigates back on cancel', async () => {
      const user = userEvent.setup()
      render(<AdminPageEditorPage />)
      await user.click(screen.getByRole('button', { name: /cancel/i }))
      expect(mockPush).toHaveBeenCalledWith('/admin/pages')
    })

    it('passes axe accessibility check', async () => {
      const { container } = render(<AdminPageEditorPage />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('edit mode (id !== "new")', () => {
    beforeEach(() => {
      mockParams = { id: 'page-about' }
    })

    it('renders edit page heading', async () => {
      render(<AdminPageEditorPage />)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /edit page/i })).toBeInTheDocument()
      })
    })

    it('populates form with existing page data', async () => {
      render(<AdminPageEditorPage />)
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
        expect(titleInput.value).toBe('About This Community')
      })
    })

    it('renders delete button in edit mode', async () => {
      render(<AdminPageEditorPage />)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      })
    })
  })
})
