/**
 * Tests for login page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'

const mockLogin = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
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
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false,
  }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockClear()
  })

  it('renders login heading', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
  })

  it('renders handle input', () => {
    render(<LoginPage />)
    const input = screen.getByLabelText(/handle/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'jay.bsky.team')
  })

  it('renders continue button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('shows error when submitting empty handle', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter your handle')
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login with handle on submit', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/handle/i), 'test.bsky.social')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('test.bsky.social')
  })

  it('strips leading @ from handle before login', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/handle/i), '@test.bsky.social')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('test.bsky.social')
  })

  it('extracts handle from bsky.app profile URL', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/handle/i), 'https://bsky.app/profile/test.bsky.social')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('test.bsky.social')
  })

  it('lowercases handle before login', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/handle/i), 'Jay.Bsky.Team')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('jay.bsky.team')
  })

  it('strips trailing dot from handle', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/handle/i), 'test.bsky.social.')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('test.bsky.social')
  })

  it('strips at:// prefix from AT-URI with handle', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/handle/i), 'at://ngerakines.me')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('ngerakines.me')
  })

  it('strips at:// prefix from AT-URI with DID', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/handle/i), 'at://did:plc:cbkjy5n7bk3ax2wplmtjofq2')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('did:plc:cbkjy5n7bk3ax2wplmtjofq2')
  })

  it('passes plain DID through without lowercasing', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/handle/i), 'did:plc:CbKjY5N7Bk3Ax2WplmTjOfQ2')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('did:plc:CbKjY5N7Bk3Ax2WplmTjOfQ2')
  })

  it('passes did:web identifier through without lowercasing', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/handle/i), 'did:web:Example.Com')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('did:web:Example.Com')
  })

  it('extracts DID from bsky.app profile URL', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(
      screen.getByLabelText(/handle/i),
      'https://bsky.app/profile/did:plc:cbkjy5n7bk3ax2wplmtjofq2'
    )
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('did:plc:cbkjy5n7bk3ax2wplmtjofq2')
  })

  it('strips AT-URI path segments after authority', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(
      screen.getByLabelText(/handle/i),
      'at://ngerakines.me/app.bsky.feed.post/abc123'
    )
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockLogin).toHaveBeenCalledWith('ngerakines.me')
  })

  it('shows user-friendly error for unknown handle (502)', async () => {
    const { ApiError } = await import('@/lib/api/client')
    mockLogin.mockRejectedValueOnce(new ApiError(502, 'API 502: Bad Gateway'))

    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/handle/i), 'nonexistent.bsky.social')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/couldn't find an account/i)
    expect(alert).toHaveTextContent('nonexistent.bsky.social')
  })

  it('has links to create accounts on PDS hosts', () => {
    render(<LoginPage />)

    const blueskyLink = screen.getByRole('link', { name: /bluesky/i })
    expect(blueskyLink).toHaveAttribute('href', 'https://bsky.app')
    expect(blueskyLink).toHaveAttribute('target', '_blank')

    const blackskyLink = screen.getByRole('link', { name: /blacksky/i })
    expect(blackskyLink).toHaveAttribute('href', 'https://blacksky.community')
    expect(blackskyLink).toHaveAttribute('target', '_blank')

    const euroskyLink = screen.getByRole('link', { name: /eurosky/i })
    expect(euroskyLink).toHaveAttribute('href', 'https://www.eurosky.tech/register')
    expect(euroskyLink).toHaveAttribute('target', '_blank')
  })
})
