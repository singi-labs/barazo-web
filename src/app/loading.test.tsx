import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import RootLoading from './loading'

describe('RootLoading', () => {
  it('renders a loading status region', () => {
    render(<RootLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders accessible loading text for screen readers', () => {
    render(<RootLoading />)
    expect(screen.getByText('Loading forum content')).toBeInTheDocument()
  })

  it('renders skeleton placeholders', () => {
    const { container } = render(<RootLoading />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<RootLoading />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
