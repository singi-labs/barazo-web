import type { CategoryTreeNode } from '@/lib/api/types'

export interface FlatCategory {
  category: CategoryTreeNode
  depth: number
}

interface FlattenOptions {
  /** Exclude this category ID and all its descendants. */
  excludeId?: string
}

export function flattenCategoryTree(
  tree: CategoryTreeNode[],
  options: FlattenOptions = {}
): FlatCategory[] {
  const result: FlatCategory[] = []

  function walk(nodes: CategoryTreeNode[], depth: number): void {
    for (const node of nodes) {
      if (options.excludeId && node.id === options.excludeId) continue
      result.push({ category: node, depth })
      walk(node.children, depth + 1)
    }
  }

  walk(tree, 0)
  return result
}
