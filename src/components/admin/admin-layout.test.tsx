/**
 * Tests for admin layout component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { AdminLayout } from './admin-layout'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin',
}))

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

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('AdminLayout', () => {
  it('renders sidebar navigation', () => {
    render(
      <AdminLayout>
        <p>Admin content</p>
      </AdminLayout>
    )
    expect(screen.getByRole('navigation', { name: /admin/i })).toBeInTheDocument()
  })

  it('renders main content area', () => {
    render(
      <AdminLayout>
        <p>Admin content</p>
      </AdminLayout>
    )
    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(
      <AdminLayout>
        <p>Content</p>
      </AdminLayout>
    )
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /categories/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /moderation/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /content ratings/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /users/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /plugins/i })).toBeInTheDocument()
  })

  it('highlights current page link', () => {
    render(
      <AdminLayout>
        <p>Content</p>
      </AdminLayout>
    )
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveAttribute('aria-current', 'page')
  })

  it('renders back to forum link', () => {
    render(
      <AdminLayout>
        <p>Content</p>
      </AdminLayout>
    )
    expect(screen.getByRole('link', { name: /back to forum/i })).toHaveAttribute('href', '/')
  })

  it('renders main landmark', () => {
    render(
      <AdminLayout>
        <p>Content</p>
      </AdminLayout>
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(
      <AdminLayout>
        <h1>Admin Page</h1>
        <p>Content</p>
      </AdminLayout>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  describe('mobile sidebar drawer', () => {
    it('renders a menu button for opening the mobile sidebar', () => {
      render(
        <AdminLayout>
          <p>Content</p>
        </AdminLayout>
      )
      expect(screen.getByRole('button', { name: /open admin menu/i })).toBeInTheDocument()
    })

    it('opens the drawer when the menu button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AdminLayout>
          <p>Content</p>
        </AdminLayout>
      )

      const menuButton = screen.getByRole('button', { name: /open admin menu/i })
      await user.click(menuButton)

      // The drawer should show an accessible dialog with the navigation
      expect(screen.getByRole('dialog', { name: /admin menu/i })).toBeInTheDocument()
    })

    it('closes the drawer when a nav link is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AdminLayout>
          <p>Content</p>
        </AdminLayout>
      )

      await user.click(screen.getByRole('button', { name: /open admin menu/i }))
      expect(screen.getByRole('dialog', { name: /admin menu/i })).toBeInTheDocument()

      // Click a nav link inside the drawer
      const drawerNav = screen.getByRole('dialog', { name: /admin menu/i })
      const categoriesLink = drawerNav.querySelector('a[href="/admin/categories"]')
      expect(categoriesLink).not.toBeNull()
      await user.click(categoriesLink!)

      expect(screen.queryByRole('dialog', { name: /admin menu/i })).not.toBeInTheDocument()
    })

    it('closes the drawer when the close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AdminLayout>
          <p>Content</p>
        </AdminLayout>
      )

      await user.click(screen.getByRole('button', { name: /open admin menu/i }))
      expect(screen.getByRole('dialog', { name: /admin menu/i })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /close admin menu/i }))
      expect(screen.queryByRole('dialog', { name: /admin menu/i })).not.toBeInTheDocument()
    })

    it('renders back to forum link in the mobile drawer', async () => {
      const user = userEvent.setup()
      render(
        <AdminLayout>
          <p>Content</p>
        </AdminLayout>
      )

      await user.click(screen.getByRole('button', { name: /open admin menu/i }))
      const drawer = screen.getByRole('dialog', { name: /admin menu/i })
      const backLink = drawer.querySelector('a[href="/"]')
      expect(backLink).not.toBeNull()
    })

    it('passes axe accessibility check with drawer open', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <AdminLayout>
          <h1>Admin Page</h1>
          <p>Content</p>
        </AdminLayout>
      )

      await user.click(screen.getByRole('button', { name: /open admin menu/i }))
      expect(screen.getByRole('dialog', { name: /admin menu/i })).toBeInTheDocument()

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
