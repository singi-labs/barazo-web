/**
 * Tests for ReplyBranch collapse behavior.
 * Covers auto-collapse by depth, sibling limiting, and thread line toggle.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Reply } from '@/lib/api/types'
import type { ReplyTreeNode } from '@/lib/build-reply-tree'
import { ReplyBranch } from './reply-branch'

// Mock onboarding context (required by LikeButton via ReplyCard)
vi.mock('@/context/onboarding-context', () => ({
  useOnboardingContext: () => ({
    state: { completed: true, dismissed: true, currentStep: null, completedSteps: [] },
    dispatch: vi.fn(),
    completeStep: vi.fn(),
    dismiss: vi.fn(),
    reset: vi.fn(),
    isStepCompleted: () => true,
  }),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    crossPostScopesGranted: false,
    getAccessToken: () => null,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    requestCrossPostAuth: vi.fn(),
    authFetch: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn() }),
}))

vi.mock('@/lib/api/client', () => ({
  getReactions: vi.fn().mockResolvedValue({ reactions: [], cursor: null }),
  createReaction: vi.fn().mockResolvedValue({ uri: 'at://test', cid: 'bafyrei-test' }),
  deleteReaction: vi.fn().mockResolvedValue(undefined),
  updateReply: vi.fn(),
}))

const TOPIC_URI = 'at://did:plc:test/forum.barazo.topic/topic1'

function makeReply(
  overrides: Partial<Reply> & { uri: string; depth: number; parentUri: string }
): Reply {
  return {
    rkey: overrides.uri.split('/').pop()!,
    authorDid: 'did:plc:user-001',
    author: {
      did: 'did:plc:user-001',
      handle: 'user.test',
      displayName: 'Test User',
      avatarUrl: null,
    },
    content: `Reply ${overrides.uri}`,
    contentFormat: null,
    rootUri: TOPIC_URI,
    rootCid: 'bafyrei-root',
    parentCid: 'bafyrei-parent',
    communityDid: 'did:plc:community',
    cid: `cid-${overrides.uri}`,
    reactionCount: 0,
    isAuthorDeleted: false,
    isModDeleted: false,
    createdAt: '2026-03-01T00:00:00.000Z',
    indexedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeNode(reply: Reply, children: ReplyTreeNode[] = []): ReplyTreeNode {
  return { reply, children }
}

function buildPostNumberMap(nodes: ReplyTreeNode[], startAt = 2): Map<string, number> {
  const map = new Map<string, number>()
  let num = startAt
  function walk(n: ReplyTreeNode) {
    map.set(n.reply.uri, num++)
    n.children.forEach(walk)
  }
  nodes.forEach(walk)
  return map
}

function buildAllRepliesMap(nodes: ReplyTreeNode[]): Map<string, Reply> {
  const map = new Map<string, Reply>()
  function walk(n: ReplyTreeNode) {
    map.set(n.reply.uri, n.reply)
    n.children.forEach(walk)
  }
  nodes.forEach(walk)
  return map
}

describe('ReplyBranch collapse behavior', () => {
  // Build a deep tree: depth 1 -> 2 -> 3 -> 4 -> 5
  const depth1 = makeReply({ uri: 'at://test/r/d1', depth: 1, parentUri: TOPIC_URI })
  const depth2 = makeReply({ uri: 'at://test/r/d2', depth: 2, parentUri: depth1.uri })
  const depth3 = makeReply({ uri: 'at://test/r/d3', depth: 3, parentUri: depth2.uri })
  const depth4 = makeReply({ uri: 'at://test/r/d4', depth: 4, parentUri: depth3.uri })
  const depth5 = makeReply({ uri: 'at://test/r/d5', depth: 5, parentUri: depth4.uri })

  const deepTree: ReplyTreeNode[] = [
    makeNode(depth1, [
      makeNode(depth2, [makeNode(depth3, [makeNode(depth4, [makeNode(depth5)])])]),
    ]),
  ]

  const deepPostMap = buildPostNumberMap(deepTree)
  const deepAllReplies = buildAllRepliesMap(deepTree)

  it('renders first 3 levels expanded by default', () => {
    render(
      <ReplyBranch
        nodes={deepTree}
        postNumberMap={deepPostMap}
        topicUri={TOPIC_URI}
        allReplies={deepAllReplies}
        visualIndentCap={10}
        currentVisualDepth={1}
      />
    )
    // Depth 1, 2, 3 should all be visible
    expect(screen.getByText(depth1.content)).toBeInTheDocument()
    expect(screen.getByText(depth2.content)).toBeInTheDocument()
    expect(screen.getByText(depth3.content)).toBeInTheDocument()
  })

  it('auto-collapses depth 4+ by default', () => {
    render(
      <ReplyBranch
        nodes={deepTree}
        postNumberMap={deepPostMap}
        topicUri={TOPIC_URI}
        allReplies={deepAllReplies}
        visualIndentCap={10}
        currentVisualDepth={1}
      />
    )
    // Depth 4 and 5 should be hidden (depth 3 node's children are auto-collapsed)
    expect(screen.queryByText(depth4.content)).not.toBeInTheDocument()
    expect(screen.queryByText(depth5.content)).not.toBeInTheDocument()
  })

  it('shows "N replies hidden" for auto-collapsed threads', () => {
    render(
      <ReplyBranch
        nodes={deepTree}
        postNumberMap={deepPostMap}
        topicUri={TOPIC_URI}
        allReplies={deepAllReplies}
        visualIndentCap={10}
        currentVisualDepth={1}
      />
    )
    expect(screen.getByText(/1 reply hidden/)).toBeInTheDocument()
  })

  it('toggles collapse when ThreadLine is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ReplyBranch
        nodes={deepTree}
        postNumberMap={deepPostMap}
        topicUri={TOPIC_URI}
        allReplies={deepAllReplies}
        visualIndentCap={10}
        currentVisualDepth={1}
      />
    )

    // Depth 3 is visible, depth 4 is hidden (auto-collapsed)
    expect(screen.getByText(depth3.content)).toBeInTheDocument()
    expect(screen.queryByText(depth4.content)).not.toBeInTheDocument()

    // Find the thread line button for depth 3 node (which has children)
    // It should have aria-expanded="false" since its children are auto-collapsed
    const collapseButtons = screen.getAllByRole('button', { expanded: false })
    // Click the last one (depth 3's thread line)
    await user.click(collapseButtons[collapseButtons.length - 1]!)

    // Now depth 4 should be visible
    expect(screen.getByText(depth4.content)).toBeInTheDocument()
  })

  it('direct replies (depth 1) are never auto-collapsed by sibling limiting', () => {
    // Create 7 root-level replies
    const roots: ReplyTreeNode[] = Array.from({ length: 7 }, (_, i) =>
      makeNode(
        makeReply({
          uri: `at://test/r/root${i}`,
          depth: 1,
          parentUri: TOPIC_URI,
          content: `Root reply ${i}`,
        })
      )
    )

    const map = buildPostNumberMap(roots)
    const allReplies = buildAllRepliesMap(roots)

    render(
      <ReplyBranch
        nodes={roots}
        postNumberMap={map}
        topicUri={TOPIC_URI}
        allReplies={allReplies}
        visualIndentCap={10}
        currentVisualDepth={1}
      />
    )

    // All 7 should be visible (no sibling limiting at depth 1)
    for (let i = 0; i < 7; i++) {
      expect(screen.getByText(`Root reply ${i}`)).toBeInTheDocument()
    }
  })

  it('shows "Show N more replies" for 5+ siblings at depth 2+', () => {
    // Create a parent with 6 children at depth 2
    const parent = makeReply({ uri: 'at://test/r/parent', depth: 1, parentUri: TOPIC_URI })
    const children: ReplyTreeNode[] = Array.from({ length: 6 }, (_, i) =>
      makeNode(
        makeReply({
          uri: `at://test/r/child${i}`,
          depth: 2,
          parentUri: parent.uri,
          content: `Child reply ${i}`,
        })
      )
    )

    const tree: ReplyTreeNode[] = [makeNode(parent, children)]
    const map = buildPostNumberMap(tree)
    const allReplies = buildAllRepliesMap(tree)

    render(
      <ReplyBranch
        nodes={tree}
        postNumberMap={map}
        topicUri={TOPIC_URI}
        allReplies={allReplies}
        visualIndentCap={10}
        currentVisualDepth={1}
      />
    )

    // First 3 children visible
    expect(screen.getByText('Child reply 0')).toBeInTheDocument()
    expect(screen.getByText('Child reply 1')).toBeInTheDocument()
    expect(screen.getByText('Child reply 2')).toBeInTheDocument()

    // Remaining 3 hidden with button
    expect(screen.queryByText('Child reply 3')).not.toBeInTheDocument()
    expect(screen.getByText('Show 3 more replies')).toBeInTheDocument()
  })

  it('reveals hidden siblings when "Show more" is clicked', async () => {
    const user = userEvent.setup()

    const parent = makeReply({ uri: 'at://test/r/parent2', depth: 1, parentUri: TOPIC_URI })
    const children: ReplyTreeNode[] = Array.from({ length: 6 }, (_, i) =>
      makeNode(
        makeReply({
          uri: `at://test/r/sib${i}`,
          depth: 2,
          parentUri: parent.uri,
          content: `Sibling ${i}`,
        })
      )
    )

    const tree: ReplyTreeNode[] = [makeNode(parent, children)]
    const map = buildPostNumberMap(tree)
    const allReplies = buildAllRepliesMap(tree)

    render(
      <ReplyBranch
        nodes={tree}
        postNumberMap={map}
        topicUri={TOPIC_URI}
        allReplies={allReplies}
        visualIndentCap={10}
        currentVisualDepth={1}
      />
    )

    // Click "Show 3 more replies"
    await user.click(screen.getByText('Show 3 more replies'))

    // All 6 should now be visible
    for (let i = 0; i < 6; i++) {
      expect(screen.getByText(`Sibling ${i}`)).toBeInTheDocument()
    }

    // Button should be gone
    expect(screen.queryByText(/Show \d+ more/)).not.toBeInTheDocument()
  })
})
