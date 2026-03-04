import type { Reply } from '@/lib/api/types'

export interface ReplyTreeNode {
  reply: Reply
  children: ReplyTreeNode[]
}

/**
 * Build a tree of replies from a flat array.
 *
 * Direct replies to the topic (parentUri matches topicUri or rootUri)
 * become root nodes. Others attach to their parent. If a reply's parent
 * is not in the array, it becomes a root (orphan promotion).
 *
 * Input order is preserved: children appear in the same relative order
 * they had in the flat array.
 */
export function buildReplyTree(replies: Reply[], topicUri: string): ReplyTreeNode[] {
  if (replies.length === 0) return []

  const nodeMap = new Map<string, ReplyTreeNode>()
  const roots: ReplyTreeNode[] = []

  // First pass: create all nodes
  for (const reply of replies) {
    nodeMap.set(reply.uri, { reply, children: [] })
  }

  // Second pass: link children to parents
  for (const reply of replies) {
    const node = nodeMap.get(reply.uri)!
    const isDirectReply = reply.parentUri === topicUri || reply.parentUri === reply.rootUri

    if (isDirectReply) {
      roots.push(node)
    } else {
      const parent = nodeMap.get(reply.parentUri)
      if (parent) {
        parent.children.push(node)
      } else {
        // Orphan: parent not in array, promote to root
        roots.push(node)
      }
    }
  }

  return roots
}

/**
 * Count all descendants (children, grandchildren, etc.) of a node.
 */
export function countDescendants(node: ReplyTreeNode): number {
  let count = node.children.length
  for (const child of node.children) {
    count += countDescendants(child)
  }
  return count
}

/**
 * Flatten a reply tree into depth-first order.
 * Useful for rendering a flat list with indentation or for counting.
 */
export function flattenReplyTree(roots: ReplyTreeNode[]): Reply[] {
  const result: Reply[] = []

  function walk(nodes: ReplyTreeNode[]) {
    for (const node of nodes) {
      result.push(node.reply)
      walk(node.children)
    }
  }

  walk(roots)
  return result
}
