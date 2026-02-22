import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import NotFound from './not-found'

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('NotFound', () => {
  it('renders 404 text', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders page not found heading', () => {
    render(<NotFound />)
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('renders a go home link', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: /go home/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders a search link', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: /search/i })
    expect(link).toHaveAttribute('href', '/search')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<NotFound />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
