import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import ThreadError from './error'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/jay.bsky.team/abc123',
}))

describe('ThreadError', () => {
  const error = new Error('Thread not found')
  const reset = vi.fn()

  beforeEach(() => {
    reset.mockClear()
  })

  it('renders topic error heading', () => {
    render(<ThreadError error={error} reset={reset} />)
    expect(screen.getByRole('heading', { name: 'Could not load topic' })).toBeInTheDocument()
  })

  it('renders an alert region', () => {
    render(<ThreadError error={error} reset={reset} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders try again button that calls reset', async () => {
    const user = userEvent.setup()
    render(<ThreadError error={error} reset={reset} />)
    const button = screen.getByRole('button', { name: /try again/i })
    await user.click(button)
    expect(reset).toHaveBeenCalledOnce()
  })

  it('renders a return to forum link', () => {
    render(<ThreadError error={error} reset={reset} />)
    const link = screen.getByRole('link', { name: /return to forum/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<ThreadError error={error} reset={reset} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
