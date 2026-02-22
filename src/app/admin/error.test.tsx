import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import AdminError from './error'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/categories',
}))

describe('AdminError', () => {
  const error = new Error('Admin panel broke')
  const reset = vi.fn()

  beforeEach(() => {
    reset.mockClear()
  })

  it('renders admin error heading', () => {
    render(<AdminError error={error} reset={reset} />)
    expect(screen.getByRole('heading', { name: 'Admin error' })).toBeInTheDocument()
  })

  it('renders an alert region', () => {
    render(<AdminError error={error} reset={reset} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders try again button that calls reset', async () => {
    const user = userEvent.setup()
    render(<AdminError error={error} reset={reset} />)
    const button = screen.getByRole('button', { name: /try again/i })
    await user.click(button)
    expect(reset).toHaveBeenCalledOnce()
  })

  it('renders a dashboard link', () => {
    render(<AdminError error={error} reset={reset} />)
    const link = screen.getByRole('link', { name: /dashboard/i })
    expect(link).toHaveAttribute('href', '/admin')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminError error={error} reset={reset} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
