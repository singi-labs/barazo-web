/**
 * Tests for PageRow component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { PageRow } from './page-row'
import type { PageTreeNode } from '@/lib/api/types'

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

const mockPage: PageTreeNode = {
  id: 'page-about',
  slug: 'about',
  title: 'About This Community',
  content: '# About\n\nWelcome.',
  status: 'published',
  metaDescription: 'About page description.',
  parentId: null,
  sortOrder: 0,
  communityDid: 'did:plc:test-community-123',
  createdAt: '2026-02-12T12:00:00.000Z',
  updatedAt: '2026-02-13T12:00:00.000Z',
  children: [],
}

const mockDraftPage: PageTreeNode = {
  ...mockPage,
  id: 'page-draft',
  slug: 'draft-page',
  title: 'Draft Page',
  status: 'draft',
  children: [],
}

describe('PageRow', () => {
  it('renders page title', () => {
    render(<PageRow page={mockPage} depth={0} onDelete={vi.fn()} />)
    expect(screen.getByText('About This Community')).toBeInTheDocument()
  })

  it('renders slug in muted text', () => {
    render(<PageRow page={mockPage} depth={0} onDelete={vi.fn()} />)
    expect(screen.getByText('/p/about')).toBeInTheDocument()
  })

  it('renders Published status badge for published page', () => {
    render(<PageRow page={mockPage} depth={0} onDelete={vi.fn()} />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('renders Draft status badge for draft page', () => {
    render(<PageRow page={mockDraftPage} depth={0} onDelete={vi.fn()} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('makes the whole card a link to the edit page', () => {
    render(<PageRow page={mockPage} depth={0} onDelete={vi.fn()} />)
    const editLink = screen.getByRole('link', { name: /edit about this community/i })
    expect(editLink).toHaveAttribute('href', '/admin/pages/page-about')
  })

  it('renders view link that opens public page in new tab', () => {
    render(<PageRow page={mockPage} depth={0} onDelete={vi.fn()} />)
    const viewLink = screen.getByRole('link', { name: /view about this community/i })
    expect(viewLink).toHaveAttribute('href', '/p/about')
    expect(viewLink).toHaveAttribute('target', '_blank')
  })

  it('renders delete button', () => {
    render(<PageRow page={mockPage} depth={0} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /delete about this community/i })).toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<PageRow page={mockPage} depth={0} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /delete about this community/i }))
    expect(onDelete).toHaveBeenCalledWith('page-about')
  })

  it('indents children with increased depth', () => {
    render(<PageRow page={mockPage} depth={1} onDelete={vi.fn()} />)
    const container = screen.getByText('About This Community').closest('[data-depth]')
    expect(container).toHaveAttribute('data-depth', '1')
  })

  it('renders children recursively', () => {
    const parentPage: PageTreeNode = {
      ...mockPage,
      id: 'page-parent',
      title: 'Parent Page',
      children: [
        {
          ...mockPage,
          id: 'page-child',
          title: 'Child Page',
          parentId: 'page-parent',
          children: [],
        },
      ],
    }
    render(<PageRow page={parentPage} depth={0} onDelete={vi.fn()} />)
    expect(screen.getByText('Parent Page')).toBeInTheDocument()
    expect(screen.getByText('Child Page')).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<PageRow page={mockPage} depth={0} onDelete={vi.fn()} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
