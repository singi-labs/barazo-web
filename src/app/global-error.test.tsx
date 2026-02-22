import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import GlobalError from './global-error'

describe('GlobalError', () => {
  const error = new Error('Root layout exploded')
  const reset = vi.fn()

  it('renders error heading', () => {
    render(<GlobalError error={error} reset={reset} />)
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
  })

  it('renders an alert region', () => {
    render(<GlobalError error={error} reset={reset} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders a try again button that calls reset', async () => {
    const user = userEvent.setup()
    render(<GlobalError error={error} reset={reset} />)
    const button = screen.getByRole('button', { name: 'Try again' })
    await user.click(button)
    expect(reset).toHaveBeenCalledOnce()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<GlobalError error={error} reset={reset} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
