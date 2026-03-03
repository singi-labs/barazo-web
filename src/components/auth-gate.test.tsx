/**
 * Tests for AuthGate component.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { AuthGate } from './auth-gate'

describe('AuthGate', () => {
  it('renders the message text', () => {
    render(<AuthGate message="Sign in to join the discussion" />)
    expect(screen.getByText('Sign in to join the discussion')).toBeInTheDocument()
  })

  it('renders a link to /login with "Sign in" text', () => {
    render(<AuthGate message="Sign in to reply" />)
    const link = screen.getByRole('link', { name: /sign in/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/login')
  })

  it('renders the SignIn icon with aria-hidden', () => {
    const { container } = render(<AuthGate message="Sign in to reply" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies custom className', () => {
    const { container } = render(
      <AuthGate message="Sign in" className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(
      <AuthGate message="Sign in to join the discussion" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
