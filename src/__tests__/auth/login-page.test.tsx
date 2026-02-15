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
    expect(input).toHaveAttribute('placeholder', 'alice.bsky.social')
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

  it('has link to create account', () => {
    render(<LoginPage />)
    const link = screen.getByRole('link', { name: /create one on bluesky/i })
    expect(link).toHaveAttribute('href', 'https://bsky.app')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
