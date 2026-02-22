import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import CategoryError from './error'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/c/general',
}))

describe('CategoryError', () => {
  const error = new Error('Category not found')
  const reset = vi.fn()

  beforeEach(() => {
    reset.mockClear()
  })

  it('renders category error heading', () => {
    render(<CategoryError error={error} reset={reset} />)
    expect(screen.getByRole('heading', { name: 'Could not load category' })).toBeInTheDocument()
  })

  it('renders an alert region', () => {
    render(<CategoryError error={error} reset={reset} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders try again button that calls reset', async () => {
    const user = userEvent.setup()
    render(<CategoryError error={error} reset={reset} />)
    const button = screen.getByRole('button', { name: /try again/i })
    await user.click(button)
    expect(reset).toHaveBeenCalledOnce()
  })

  it('renders a return to forum link', () => {
    render(<CategoryError error={error} reset={reset} />)
    const link = screen.getByRole('link', { name: /return to forum/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<CategoryError error={error} reset={reset} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
