/**
 * Tests for NewTopicButton component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { NewTopicButton } from './new-topic-button'

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Default: authenticated user
const mockUseAuth = vi.fn(() => ({
  isAuthenticated: true,
  isLoading: false,
  user: { did: 'did:plc:test', handle: 'test.bsky.social' } as Record<string, unknown> | null,
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('NewTopicButton', () => {
  describe('header variant', () => {
    it('renders a link to /new', () => {
      render(<NewTopicButton variant="header" />)
      const link = screen.getByRole('link', { name: /new discussion/i })
      expect(link).toHaveAttribute('href', '/new')
    })

    it('displays "New Discussion" text', () => {
      render(<NewTopicButton variant="header" />)
      expect(screen.getByText('New Discussion')).toBeInTheDocument()
    })

    it('renders an icon', () => {
      const { container } = render(<NewTopicButton variant="header" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('passes axe accessibility check', async () => {
      const { container } = render(<NewTopicButton variant="header" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('category variant', () => {
    it('renders a link with category query param', () => {
      render(<NewTopicButton variant="category" categorySlug="general" categoryName="General" />)
      const link = screen.getByRole('link', { name: /new in general/i })
      expect(link).toHaveAttribute('href', '/new?category=general')
    })

    it('displays category name in button text', () => {
      render(
        <NewTopicButton
          variant="category"
          categorySlug="help-support"
          categoryName="Help & Support"
        />
      )
      expect(screen.getByText('New in Help & Support')).toBeInTheDocument()
    })

    it('encodes category slug in URL', () => {
      render(
        <NewTopicButton
          variant="category"
          categorySlug="help & support"
          categoryName="Help & Support"
        />
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/new?category=help%20%26%20support')
    })

    it('falls back to header variant when categorySlug is missing', () => {
      render(<NewTopicButton variant="category" categoryName="General" />)
      const link = screen.getByRole('link', { name: /new discussion/i })
      expect(link).toHaveAttribute('href', '/new')
    })

    it('falls back to header variant when categoryName is missing', () => {
      render(<NewTopicButton variant="category" categorySlug="general" />)
      const link = screen.getByRole('link', { name: /new discussion/i })
      expect(link).toHaveAttribute('href', '/new')
    })

    it('passes axe accessibility check', async () => {
      const { container } = render(
        <NewTopicButton variant="category" categorySlug="general" categoryName="General" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('auth state', () => {
    it('returns null when not authenticated', () => {
      mockUseAuth.mockReturnValueOnce({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })
      const { container } = render(<NewTopicButton variant="header" />)
      expect(container.innerHTML).toBe('')
    })

    it('returns null while auth is loading', () => {
      mockUseAuth.mockReturnValueOnce({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      })
      const { container } = render(<NewTopicButton variant="header" />)
      expect(container.innerHTML).toBe('')
    })
  })

  describe('className prop', () => {
    it('applies custom className to header variant', () => {
      render(<NewTopicButton variant="header" className="ml-4" />)
      const link = screen.getByRole('link')
      expect(link.className).toContain('ml-4')
    })

    it('applies custom className to category variant', () => {
      render(
        <NewTopicButton
          variant="category"
          categorySlug="general"
          categoryName="General"
          className="mt-2"
        />
      )
      const link = screen.getByRole('link')
      expect(link.className).toContain('mt-2')
    })
  })
})
