/**
 * Tests for reply tree builder utility.
 */

import { describe, it, expect } from 'vitest'
import type { Reply } from '@/lib/api/types'
import { buildReplyTree, flattenReplyTree, countDescendants } from './build-reply-tree'

const TOPIC_URI = 'at://did:plc:user-001/forum.barazo.topic.post/abc123'
const TOPIC_CID = 'bafyreib1'
const COMMUNITY_DID = 'did:plc:community-001'

function makeReply(
  overrides: Partial<Reply> & { uri: string; parentUri: string; depth: number }
): Reply {
  return {
    rkey: overrides.uri.split('/').pop()!,
    authorDid: 'did:plc:user-001',
    content: 'Test reply',
    rootUri: TOPIC_URI,
    rootCid: TOPIC_CID,
    parentCid: 'bafyreir0',
    communityDid: COMMUNITY_DID,
    cid: `cid-${overrides.uri}`,
    reactionCount: 0,
    isAuthorDeleted: false,
    isModDeleted: false,
    createdAt: '2026-02-14T12:00:00.000Z',
    indexedAt: '2026-02-14T12:00:00.000Z',
    ...overrides,
  }
}

describe('buildReplyTree', () => {
  it('returns empty roots for empty array', () => {
    const result = buildReplyTree([], TOPIC_URI)
    expect(result).toEqual([])
  })

  it('places direct reply to topic as root', () => {
    const reply = makeReply({
      uri: 'at://user/reply/aaa',
      parentUri: TOPIC_URI,
      depth: 1,
    })

    const result = buildReplyTree([reply], TOPIC_URI)
    expect(result).toHaveLength(1)
    expect(result[0]!.reply.uri).toBe(reply.uri)
    expect(result[0]!.children).toEqual([])
  })

  it('nests child reply under its parent', () => {
    const parent = makeReply({
      uri: 'at://user/reply/aaa',
      parentUri: TOPIC_URI,
      depth: 1,
    })
    const child = makeReply({
      uri: 'at://user/reply/bbb',
      parentUri: 'at://user/reply/aaa',
      depth: 2,
    })

    const result = buildReplyTree([parent, child], TOPIC_URI)
    expect(result).toHaveLength(1)
    expect(result[0]!.children).toHaveLength(1)
    expect(result[0]!.children[0]!.reply.uri).toBe(child.uri)
  })

  it('treats orphaned reply (parent not in array) as root', () => {
    const orphan = makeReply({
      uri: 'at://user/reply/bbb',
      parentUri: 'at://user/reply/missing',
      depth: 2,
    })

    const result = buildReplyTree([orphan], TOPIC_URI)
    expect(result).toHaveLength(1)
    expect(result[0]!.reply.uri).toBe(orphan.uri)
  })

  it('maintains chronological order for multiple root-level replies', () => {
    const first = makeReply({
      uri: 'at://user/reply/aaa',
      parentUri: TOPIC_URI,
      depth: 1,
      createdAt: '2026-02-14T10:00:00.000Z',
    })
    const second = makeReply({
      uri: 'at://user/reply/bbb',
      parentUri: TOPIC_URI,
      depth: 1,
      createdAt: '2026-02-14T11:00:00.000Z',
    })
    const third = makeReply({
      uri: 'at://user/reply/ccc',
      parentUri: TOPIC_URI,
      depth: 1,
      createdAt: '2026-02-14T12:00:00.000Z',
    })

    const result = buildReplyTree([first, second, third], TOPIC_URI)
    expect(result).toHaveLength(3)
    expect(result[0]!.reply.uri).toBe(first.uri)
    expect(result[1]!.reply.uri).toBe(second.uri)
    expect(result[2]!.reply.uri).toBe(third.uri)
  })

  it('handles deep nesting (5+ levels)', () => {
    const replies: Reply[] = []
    for (let i = 1; i <= 6; i++) {
      replies.push(
        makeReply({
          uri: `at://user/reply/${String(i).padStart(3, '0')}`,
          parentUri: i === 1 ? TOPIC_URI : `at://user/reply/${String(i - 1).padStart(3, '0')}`,
          depth: i,
        })
      )
    }

    const result = buildReplyTree(replies, TOPIC_URI)
    expect(result).toHaveLength(1)

    let node = result[0]!
    for (let i = 0; i < 5; i++) {
      expect(node.children).toHaveLength(1)
      node = node.children[0]!
    }
    expect(node.children).toHaveLength(0)
  })

  it('handles mixed order input (children before parents)', () => {
    const child = makeReply({
      uri: 'at://user/reply/bbb',
      parentUri: 'at://user/reply/aaa',
      depth: 2,
    })
    const parent = makeReply({
      uri: 'at://user/reply/aaa',
      parentUri: TOPIC_URI,
      depth: 1,
    })

    // child comes before parent in input
    const result = buildReplyTree([child, parent], TOPIC_URI)
    expect(result).toHaveLength(1)
    expect(result[0]!.reply.uri).toBe(parent.uri)
    expect(result[0]!.children).toHaveLength(1)
    expect(result[0]!.children[0]!.reply.uri).toBe(child.uri)
  })
})

describe('countDescendants', () => {
  it('returns 0 for a leaf node', () => {
    const leaf = makeReply({ uri: 'at://user/reply/aaa', parentUri: TOPIC_URI, depth: 1 })
    expect(countDescendants({ reply: leaf, children: [] })).toBe(0)
  })

  it('counts all descendants recursively', () => {
    const replies = [
      makeReply({ uri: 'at://user/reply/a', parentUri: TOPIC_URI, depth: 1 }),
      makeReply({ uri: 'at://user/reply/b', parentUri: 'at://user/reply/a', depth: 2 }),
      makeReply({ uri: 'at://user/reply/c', parentUri: 'at://user/reply/b', depth: 3 }),
      makeReply({ uri: 'at://user/reply/d', parentUri: 'at://user/reply/c', depth: 4 }),
    ]
    const tree = buildReplyTree(replies, TOPIC_URI)
    // Root node has 3 descendants: b, c, d
    expect(countDescendants(tree[0]!)).toBe(3)
    // Node b has 2 descendants: c, d
    expect(countDescendants(tree[0]!.children[0]!)).toBe(2)
    // Node c has 1 descendant: d
    expect(countDescendants(tree[0]!.children[0]!.children[0]!)).toBe(1)
  })

  it('counts branching descendants', () => {
    const replies = [
      makeReply({ uri: 'at://user/reply/a', parentUri: TOPIC_URI, depth: 1 }),
      makeReply({ uri: 'at://user/reply/b', parentUri: 'at://user/reply/a', depth: 2 }),
      makeReply({ uri: 'at://user/reply/c', parentUri: 'at://user/reply/a', depth: 2 }),
      makeReply({ uri: 'at://user/reply/d', parentUri: 'at://user/reply/b', depth: 3 }),
    ]
    const tree = buildReplyTree(replies, TOPIC_URI)
    // Root has 3 descendants: b, c, d
    expect(countDescendants(tree[0]!)).toBe(3)
  })
})

describe('flattenReplyTree', () => {
  it('returns empty array for empty roots', () => {
    expect(flattenReplyTree([])).toEqual([])
  })

  it('returns depth-first order', () => {
    const root = makeReply({
      uri: 'at://user/reply/aaa',
      parentUri: TOPIC_URI,
      depth: 1,
    })
    const child = makeReply({
      uri: 'at://user/reply/bbb',
      parentUri: 'at://user/reply/aaa',
      depth: 2,
    })
    const grandchild = makeReply({
      uri: 'at://user/reply/ccc',
      parentUri: 'at://user/reply/bbb',
      depth: 3,
    })
    const root2 = makeReply({
      uri: 'at://user/reply/ddd',
      parentUri: TOPIC_URI,
      depth: 1,
    })

    const tree = buildReplyTree([root, child, grandchild, root2], TOPIC_URI)
    const flat = flattenReplyTree(tree)

    expect(flat.map((r) => r.uri)).toEqual([root.uri, child.uri, grandchild.uri, root2.uri])
  })
})
