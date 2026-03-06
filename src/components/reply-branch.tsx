/**
 * ReplyBranch - Recursive tree renderer for threaded replies.
 * Uses a unified line system: one interactive ThreadLine per depth level.
 * Ancestor lines continue through descendants for collapse-from-anywhere.
 * Pixel-based indent steps replace Tailwind margin classes.
 * Auto-collapses depth 3+ threads and limits 5+ siblings at depth 2+.
 */

'use client'

import { useState, useCallback } from 'react'
import type { Reply } from '@/lib/api/types'
import { type ReplyTreeNode, countDescendants } from '@/lib/build-reply-tree'
import {
  DEFAULT_EXPANDED_LEVELS,
  AUTO_COLLAPSE_SIBLING_THRESHOLD,
  AUTO_COLLAPSE_SHOW_COUNT,
} from '@/lib/threading-constants'
import type { AncestorInfo } from './ancestor-lines'
import { AncestorLines } from './ancestor-lines'
import { ReplyCard } from './reply-card'
import { ThreadLine } from './thread-line'
import { ReplyToBadge } from './reply-to-badge'
import { ShowMoreReplies } from './show-more-replies'

interface ReplyBranchProps {
  nodes: ReplyTreeNode[]
  postNumberMap: Map<string, number>
  topicUri: string
  allReplies: Map<string, Reply>
  indentStep: number
  showChevron: boolean
  /** Ancestor line data passed through recursion. Outermost first. */
  ancestors?: AncestorInfo[]
  /** Callback to collapse/expand an ancestor thread from anywhere. */
  onToggleAncestor?: (uri: string) => void
  /** URI of the parent node in the tree (topicUri for root level) */
  treeParentUri?: string
  onReply?: (target: { uri: string; cid: string; authorHandle: string; snippet: string }) => void
  onDeleteReply?: () => void
  currentUserDid?: string
}

export function ReplyBranch({
  nodes,
  postNumberMap,
  topicUri,
  allReplies,
  indentStep,
  showChevron,
  ancestors = [],
  onToggleAncestor,
  treeParentUri,
  onReply,
  onDeleteReply,
  currentUserDid,
}: ReplyBranchProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const node of nodes) {
      if (node.reply.depth >= DEFAULT_EXPANDED_LEVELS && node.children.length > 0) {
        initial.add(node.reply.uri)
      }
    }
    return initial
  })

  const [showAllSiblings, setShowAllSiblings] = useState(false)

  const toggleCollapse = useCallback((uri: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(uri)) {
        next.delete(uri)
      } else {
        next.add(uri)
      }
      return next
    })
  }, [])

  const handleToggle = useCallback(
    (uri: string) => {
      if (collapsedNodes.has(uri) || nodes.some((n) => n.reply.uri === uri)) {
        toggleCollapse(uri)
      } else {
        onToggleAncestor?.(uri)
      }
    },
    [collapsedNodes, nodes, toggleCollapse, onToggleAncestor]
  )

  if (nodes.length === 0) return null

  const expectedParentUri = treeParentUri ?? topicUri

  const siblingDepth = nodes[0]?.reply.depth ?? 1
  const shouldLimitSiblings =
    !showAllSiblings && siblingDepth >= 2 && nodes.length >= AUTO_COLLAPSE_SIBLING_THRESHOLD
  const visibleNodes = shouldLimitSiblings ? nodes.slice(0, AUTO_COLLAPSE_SHOW_COUNT) : nodes
  const hiddenSiblingCount = nodes.length - visibleNodes.length

  return (
    <ol className="list-none space-y-3 pl-0">
      {visibleNodes.map((node) => {
        const postNumber = postNumberMap.get(node.reply.uri) ?? 0
        const hasChildren = node.children.length > 0
        const isCollapsed = collapsedNodes.has(node.reply.uri)
        const authorName =
          node.reply.author?.displayName ?? node.reply.author?.handle ?? node.reply.authorDid
        const descendantCount = hasChildren ? countDescendants(node) : 0

        const needsBadge = node.reply.parentUri !== expectedParentUri
        const parentReply = needsBadge ? allReplies.get(node.reply.parentUri) : undefined
        const parentHandle = parentReply?.author?.handle ?? parentReply?.authorDid
        const parentPostNumber = parentReply ? (postNumberMap.get(parentReply.uri) ?? 0) : 0

        const childAncestors: AncestorInfo[] = hasChildren
          ? [
              ...ancestors,
              {
                uri: node.reply.uri,
                authorName,
                replyCount: descendantCount,
                expanded: !isCollapsed,
              },
            ]
          : ancestors

        return (
          <li key={node.reply.uri} aria-level={node.reply.depth}>
            {needsBadge && parentHandle && parentPostNumber > 0 && (
              <div style={{ marginLeft: ancestors.length * indentStep }}>
                <ReplyToBadge authorHandle={parentHandle} parentPostNumber={parentPostNumber} />
              </div>
            )}
            <div className="flex gap-0">
              <AncestorLines
                ancestors={ancestors}
                onToggle={handleToggle}
                showChevron={false}
                lineWidth={indentStep}
              />
              {hasChildren && (
                <ThreadLine
                  expanded={!isCollapsed}
                  onToggle={() => toggleCollapse(node.reply.uri)}
                  authorName={authorName}
                  replyCount={descendantCount}
                  ancestorUri={node.reply.uri}
                  opacity={1}
                  showChevron={showChevron}
                  width={indentStep}
                />
              )}
              <div className="min-w-0 flex-1">
                <ReplyCard
                  reply={node.reply}
                  postNumber={postNumber}
                  onReply={onReply}
                  canEdit={currentUserDid ? node.reply.authorDid === currentUserDid : false}
                  canDelete={currentUserDid ? node.reply.authorDid === currentUserDid : false}
                  onDelete={onDeleteReply}
                />
              </div>
            </div>
            {hasChildren && isCollapsed && (
              <button
                type="button"
                onClick={() => toggleCollapse(node.reply.uri)}
                className="mt-1 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                style={{ marginLeft: (ancestors.length + 1) * indentStep }}
                aria-live="polite"
              >
                {descendantCount} {descendantCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
            {hasChildren && !isCollapsed && (
              <ReplyBranch
                nodes={node.children}
                postNumberMap={postNumberMap}
                topicUri={topicUri}
                allReplies={allReplies}
                indentStep={indentStep}
                showChevron={showChevron}
                ancestors={childAncestors}
                onToggleAncestor={handleToggle}
                treeParentUri={node.reply.uri}
                onReply={onReply}
                onDeleteReply={onDeleteReply}
                currentUserDid={currentUserDid}
              />
            )}
          </li>
        )
      })}
      {hiddenSiblingCount > 0 && (
        <li>
          <ShowMoreReplies count={hiddenSiblingCount} onShow={() => setShowAllSiblings(true)} />
        </li>
      )}
    </ol>
  )
}
