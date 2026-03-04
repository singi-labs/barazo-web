import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Breadcrumbs } from './breadcrumbs'

describe('Breadcrumbs', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Development', href: '/c/development' },
    { label: 'Current Page' },
  ]

  it('renders all breadcrumb items in desktop layout', () => {
    render(<Breadcrumbs items={items} />)
    const desktopList = screen.getByRole('list')
    expect(desktopList).toHaveTextContent('Home')
    expect(desktopList).toHaveTextContent('Development')
    expect(desktopList).toHaveTextContent('Current Page')
  })

  it('renders links for non-last items in desktop layout', () => {
    render(<Breadcrumbs items={items} />)
    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders mobile back-link with last navigable item', () => {
    render(<Breadcrumbs items={items} />)
    // Mobile link uses the last item with an href ("Development")
    const devLinks = screen.getAllByRole('link', { name: /Development/i })
    const mobileLink = devLinks.find((el) => el.classList.contains('md:hidden'))
    expect(mobileLink).toBeDefined()
    expect(mobileLink).toHaveAttribute('href', '/c/development')
  })

  it('renders CaretLeft icon with aria-hidden in mobile back-link', () => {
    const { container } = render(<Breadcrumbs items={items} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
    const caretIcon = svgs[0]
    expect(caretIcon).toHaveAttribute('aria-hidden', 'true')
  })

  it('has accessible navigation landmark', () => {
    render(<Breadcrumbs items={items} />)
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
  })

  it('renders separator between items in desktop layout', () => {
    render(<Breadcrumbs items={items} />)
    const separators = screen.getAllByText('/')
    expect(separators).toHaveLength(2)
  })

  it('includes JSON-LD structured data from items', () => {
    const { container } = render(<Breadcrumbs items={items} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeInTheDocument()
    const jsonLd = JSON.parse(script!.textContent!)
    expect(jsonLd['@type']).toBe('BreadcrumbList')
    // Only items with href are included in JSON-LD
    expect(jsonLd.itemListElement).toHaveLength(2)
    expect(jsonLd.itemListElement[0].name).toBe('Home')
    expect(jsonLd.itemListElement[1].name).toBe('Development')
  })

  it('uses jsonLdItems for JSON-LD when provided', () => {
    const jsonLdItems = [
      { label: 'Home', href: '/' },
      { label: 'Development', href: '/c/development' },
      { label: 'My Topic Title', href: '/t/my-topic/abc123' },
    ]
    const visualItems = [
      { label: 'Home', href: '/' },
      { label: 'Development', href: '/c/development' },
    ]
    const { container } = render(<Breadcrumbs items={visualItems} jsonLdItems={jsonLdItems} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const jsonLd = JSON.parse(script!.textContent!)
    expect(jsonLd.itemListElement).toHaveLength(3)
    expect(jsonLd.itemListElement[2].name).toBe('My Topic Title')
  })

  it('desktop layout is hidden on mobile via hidden md:flex', () => {
    render(<Breadcrumbs items={items} />)
    const desktopList = screen.getByRole('list')
    expect(desktopList).toHaveClass('hidden')
    expect(desktopList).toHaveClass('md:flex')
  })

  it('returns null for empty items', () => {
    const { container } = render(<Breadcrumbs items={[]} />)
    expect(container.querySelector('nav')).not.toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<Breadcrumbs items={items} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
