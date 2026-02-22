import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import ThreadLoading from './loading'

describe('ThreadLoading', () => {
  it('renders a loading status region', () => {
    render(<ThreadLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders accessible loading text for screen readers', () => {
    render(<ThreadLoading />)
    expect(screen.getByText('Loading topic and replies')).toBeInTheDocument()
  })

  it('renders skeleton placeholders', () => {
    const { container } = render(<ThreadLoading />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<ThreadLoading />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
