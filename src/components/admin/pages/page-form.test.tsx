/**
 * Tests for PageForm component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { PageForm } from './page-form'
import type { PageFormProps } from './page-form'
import type { PageTreeNode } from '@/lib/api/types'

const mockParents: PageTreeNode[] = [
  {
    id: 'page-about',
    slug: 'about',
    title: 'About This Community',
    content: '# About',
    status: 'published',
    metaDescription: 'About page',
    parentId: null,
    sortOrder: 0,
    communityDid: 'did:plc:test-community-123',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    children: [],
  },
  {
    id: 'page-privacy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: '# Privacy',
    status: 'published',
    metaDescription: 'Privacy page',
    parentId: null,
    sortOrder: 1,
    communityDid: 'did:plc:test-community-123',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    children: [],
  },
]

function renderPageForm(overrides: Partial<PageFormProps> = {}) {
  const defaultProps: PageFormProps = {
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    parentId: null,
    metaDescription: '',
    isEditMode: false,
    availableParents: mockParents,
    onTitleChange: vi.fn(),
    onSlugChange: vi.fn(),
    onContentChange: vi.fn(),
    onStatusChange: vi.fn(),
    onParentIdChange: vi.fn(),
    onMetaDescriptionChange: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    saving: false,
    ...overrides,
  }
  return { ...render(<PageForm {...defaultProps} />), props: defaultProps }
}

describe('PageForm', () => {
  it('renders title input', () => {
    renderPageForm()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
  })

  it('renders slug input', () => {
    renderPageForm()
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument()
  })

  it('renders status select with draft and published options', () => {
    renderPageForm()
    const select = screen.getByLabelText(/status/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Published' })).toBeInTheDocument()
  })

  it('renders parent page select with available parents', () => {
    renderPageForm()
    const select = screen.getByLabelText(/parent page/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'None (top-level)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'About This Community' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Privacy Policy' })).toBeInTheDocument()
  })

  it('renders meta description textarea with character count', () => {
    renderPageForm({ metaDescription: 'Test description' })
    expect(screen.getByLabelText(/meta description/i)).toBeInTheDocument()
    expect(screen.getByText('16/320')).toBeInTheDocument()
  })

  it('renders save and cancel buttons', () => {
    renderPageForm()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows "Saving..." text when saving is true', () => {
    renderPageForm({ saving: true })
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('does not render delete button in create mode', () => {
    renderPageForm({ isEditMode: false })
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('renders delete button in edit mode', () => {
    renderPageForm({ isEditMode: true, onDelete: vi.fn() })
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('calls onTitleChange when title is typed', async () => {
    const onTitleChange = vi.fn()
    const user = userEvent.setup()
    renderPageForm({ onTitleChange })
    await user.type(screen.getByLabelText(/title/i), 'H')
    expect(onTitleChange).toHaveBeenCalledWith('H')
  })

  it('calls onSlugChange when slug is typed', async () => {
    const onSlugChange = vi.fn()
    const user = userEvent.setup()
    renderPageForm({ onSlugChange })
    await user.type(screen.getByLabelText(/slug/i), 'h')
    expect(onSlugChange).toHaveBeenCalledWith('h')
  })

  it('calls onSave when save button is clicked', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    renderPageForm({ onSave })
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    renderPageForm({ onCancel })
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    renderPageForm({ isEditMode: true, onDelete })
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('calls onStatusChange when status is changed', async () => {
    const onStatusChange = vi.fn()
    const user = userEvent.setup()
    renderPageForm({ onStatusChange })
    await user.selectOptions(screen.getByLabelText(/status/i), 'published')
    expect(onStatusChange).toHaveBeenCalledWith('published')
  })

  it('calls onParentIdChange when parent is changed', async () => {
    const onParentIdChange = vi.fn()
    const user = userEvent.setup()
    renderPageForm({ onParentIdChange })
    await user.selectOptions(screen.getByLabelText(/parent page/i), 'page-about')
    expect(onParentIdChange).toHaveBeenCalledWith('page-about')
  })

  it('calls onParentIdChange with null when "None" is selected', async () => {
    const onParentIdChange = vi.fn()
    const user = userEvent.setup()
    renderPageForm({ onParentIdChange, parentId: 'page-about' })
    await user.selectOptions(screen.getByLabelText(/parent page/i), '')
    expect(onParentIdChange).toHaveBeenCalledWith(null)
  })

  it('passes axe accessibility check', async () => {
    const { container } = renderPageForm()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
