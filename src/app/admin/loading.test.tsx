import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import AdminLoading from './loading'

describe('AdminLoading', () => {
  it('renders a loading status region', () => {
    render(<AdminLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders accessible loading text for screen readers', () => {
    render(<AdminLoading />)
    expect(screen.getByText('Loading admin dashboard')).toBeInTheDocument()
  })

  it('renders four stat card skeletons', () => {
    const { container } = render(<AdminLoading />)
    const cards = container.querySelectorAll('.rounded-lg.border')
    expect(cards.length).toBe(4)
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminLoading />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
