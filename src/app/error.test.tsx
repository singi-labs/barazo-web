import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import RootError from './error'

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('RootError', () => {
  const error = new Error('Something broke')
  const reset = vi.fn()

  beforeEach(() => {
    reset.mockClear()
  })

  it('renders error heading', () => {
    render(<RootError error={error} reset={reset} />)
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
  })

  it('renders an alert region', () => {
    render(<RootError error={error} reset={reset} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders try again button that calls reset', async () => {
    const user = userEvent.setup()
    render(<RootError error={error} reset={reset} />)
    const button = screen.getByRole('button', { name: /try again/i })
    await user.click(button)
    expect(reset).toHaveBeenCalledOnce()
  })

  it('renders a go home link', () => {
    render(<RootError error={error} reset={reset} />)
    const link = screen.getByRole('link', { name: /go home/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('shows error message in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    render(<RootError error={error} reset={reset} />)
    expect(screen.getByText('Something broke')).toBeInTheDocument()
    vi.unstubAllEnvs()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<RootError error={error} reset={reset} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
