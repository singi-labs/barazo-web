import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import AuthError from './error'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('AuthError', () => {
  const error = new Error('OAuth token expired')
  const reset = vi.fn()

  beforeEach(() => {
    reset.mockClear()
  })

  it('renders authentication error heading', () => {
    render(<AuthError error={error} reset={reset} />)
    expect(screen.getByRole('heading', { name: 'Authentication error' })).toBeInTheDocument()
  })

  it('renders an alert region', () => {
    render(<AuthError error={error} reset={reset} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders try again button that calls reset', async () => {
    const user = userEvent.setup()
    render(<AuthError error={error} reset={reset} />)
    const button = screen.getByRole('button', { name: /try again/i })
    await user.click(button)
    expect(reset).toHaveBeenCalledOnce()
  })

  it('renders a log in again link', () => {
    render(<AuthError error={error} reset={reset} />)
    const link = screen.getByRole('link', { name: /log in again/i })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AuthError error={error} reset={reset} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
