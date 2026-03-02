/**
 * Tests for UserProfileCard component.
 */

import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { UserProfileCard } from './user-profile-card'

const mockUser = {
  did: 'did:plc:test-user',
  handle: 'jay.bsky.team',
  displayName: 'Jay',
  reputation: 42,
  postCount: 15,
  joinedAt: '2025-01-01T00:00:00Z',
}

describe('UserProfileCard', () => {
  it('renders trigger with user handle', () => {
    render(<UserProfileCard user={mockUser} />)
    expect(screen.getByText('jay.bsky.team')).toBeInTheDocument()
  })

  it('shows card on hover', async () => {
    const user = userEvent.setup()
    render(<UserProfileCard user={mockUser} />)
    await user.hover(screen.getByText('jay.bsky.team'))

    // Wait for hover delay
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250))
    })

    expect(screen.getByText('Jay')).toBeInTheDocument()
    expect(screen.getByLabelText(/reputation/i)).toBeInTheDocument()
  })

  it('shows card on keyboard focus', async () => {
    const user = userEvent.setup()
    render(<UserProfileCard user={mockUser} />)
    await user.tab()

    // Wait for focus delay
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250))
    })

    expect(screen.getByText('Jay')).toBeInTheDocument()
  })

  it('hides card on Escape', async () => {
    const user = userEvent.setup()
    render(<UserProfileCard user={mockUser} />)
    await user.hover(screen.getByText('jay.bsky.team'))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250))
    })
    expect(screen.getByText('Jay')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('Jay')).not.toBeInTheDocument()
  })

  it('shows post count', async () => {
    const user = userEvent.setup()
    render(<UserProfileCard user={mockUser} />)
    await user.hover(screen.getByText('jay.bsky.team'))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250))
    })
    expect(screen.getByText(/15/)).toBeInTheDocument()
  })

  it('renders as link to user profile', () => {
    render(<UserProfileCard user={mockUser} />)
    const link = screen.getByRole('link', { name: /jay\.bsky\.team/i })
    expect(link).toHaveAttribute('href', '/u/jay.bsky.team')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<UserProfileCard user={mockUser} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
