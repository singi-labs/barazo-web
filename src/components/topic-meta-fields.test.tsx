import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { TopicMetaFields } from './topic-meta-fields'
import type { CategoryTreeNode } from '@/lib/api/types'

const COMMUNITY_DID = 'did:plc:test'
const NOW = '2026-01-01T00:00:00.000Z'

const treeCategories: CategoryTreeNode[] = [
  {
    id: 'cat-1',
    slug: 'general',
    name: 'General',
    description: null,
    parentId: null,
    sortOrder: 0,
    communityDid: COMMUNITY_DID,
    maturityRating: 'safe',
    createdAt: NOW,
    updatedAt: NOW,
    children: [],
  },
  {
    id: 'cat-2',
    slug: 'dev',
    name: 'Development',
    description: null,
    parentId: null,
    sortOrder: 1,
    communityDid: COMMUNITY_DID,
    maturityRating: 'safe',
    createdAt: NOW,
    updatedAt: NOW,
    children: [
      {
        id: 'cat-3',
        slug: 'frontend',
        name: 'Frontend',
        description: null,
        parentId: 'cat-2',
        sortOrder: 0,
        communityDid: COMMUNITY_DID,
        maturityRating: 'safe',
        createdAt: NOW,
        updatedAt: NOW,
        children: [],
      },
    ],
  },
]

describe('TopicMetaFields', () => {
  const defaultProps = {
    title: '',
    category: '',
    tagInput: '',
    categories: treeCategories,
    errors: {},
    onTitleChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onTagInputChange: vi.fn(),
  }

  it('renders category options with hierarchy indentation', () => {
    render(<TopicMetaFields {...defaultProps} />)
    const select = screen.getByLabelText(/category/i) as HTMLSelectElement
    const options = Array.from(select.options)
    // First is placeholder
    expect(options[0]).toHaveTextContent('Select a category')
    // "General" at root
    expect(options[1]).toHaveTextContent('General')
    // "Development" at root
    expect(options[2]).toHaveTextContent('Development')
    // "Frontend" indented under Development (contains non-breaking spaces)
    const frontendOption = options[3]
    expect(frontendOption?.textContent).toContain('Frontend')
    expect(frontendOption?.value).toBe('frontend')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<TopicMetaFields {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
