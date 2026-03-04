import { describe, it, expect } from 'vitest'
import { flattenCategoryTree } from './flatten-category-tree'
import type { CategoryTreeNode } from '@/lib/api/types'

const COMMUNITY_DID = 'did:plc:test'
const NOW = '2026-01-01T00:00:00.000Z'

function makeCategory(
  overrides: Partial<CategoryTreeNode> & { id: string; name: string }
): CategoryTreeNode {
  return {
    slug: overrides.id,
    description: null,
    parentId: null,
    sortOrder: 0,
    communityDid: COMMUNITY_DID,
    maturityRating: 'safe',
    createdAt: NOW,
    updatedAt: NOW,
    children: [],
    ...overrides,
  }
}

describe('flattenCategoryTree', () => {
  it('returns empty array for empty input', () => {
    expect(flattenCategoryTree([])).toEqual([])
  })

  it('flattens a single root category', () => {
    const tree = [makeCategory({ id: 'cat-1', name: 'General' })]
    const result = flattenCategoryTree(tree)
    expect(result).toEqual([{ category: tree[0], depth: 0 }])
  })

  it('flattens nested categories in depth-first order', () => {
    const tree: CategoryTreeNode[] = [
      makeCategory({
        id: 'cat-1',
        name: 'Dev',
        children: [
          makeCategory({ id: 'cat-2', name: 'Frontend', parentId: 'cat-1' }),
          makeCategory({
            id: 'cat-3',
            name: 'Backend',
            parentId: 'cat-1',
            children: [
              makeCategory({ id: 'cat-4', name: 'Databases', parentId: 'cat-3' }),
            ],
          }),
        ],
      }),
      makeCategory({ id: 'cat-5', name: 'Meta' }),
    ]
    const result = flattenCategoryTree(tree)
    expect(result.map((r) => ({ id: r.category.id, depth: r.depth }))).toEqual([
      { id: 'cat-1', depth: 0 },
      { id: 'cat-2', depth: 1 },
      { id: 'cat-3', depth: 1 },
      { id: 'cat-4', depth: 2 },
      { id: 'cat-5', depth: 0 },
    ])
  })

  it('excludes a category and all its descendants', () => {
    const tree: CategoryTreeNode[] = [
      makeCategory({
        id: 'cat-1',
        name: 'Dev',
        children: [
          makeCategory({ id: 'cat-2', name: 'Frontend', parentId: 'cat-1' }),
        ],
      }),
      makeCategory({ id: 'cat-3', name: 'Meta' }),
    ]
    const result = flattenCategoryTree(tree, { excludeId: 'cat-1' })
    expect(result).toEqual([{ category: tree[1], depth: 0 }])
  })
})
