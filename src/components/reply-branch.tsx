/**
 * ReplyBranch - Recursive tree renderer for threaded replies.
 * Renders an <ol> of replies, each containing a ReplyCard and
 * a nested <ReplyBranch> for children. Thread lines appear next
 * to replies with children for collapse/expand. Reply-to badges
 * show when a reply's parent isn't visually adjacent.
 * Respects visual indent cap — stops nesting beyond the cap.
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
import { ReplyCard } from './reply-card'
import { ThreadLine } from './thread-line'
import { ReplyToBadge } from './reply-to-badge'
import { ShowMoreReplies } from './show-more-replies'

interface ReplyBranchProps {
  nodes: ReplyTreeNode[]
  postNumberMap: Map<string, number>
  topicUri: string
  allReplies: Map<string, Reply>
  visualIndentCap: number
  currentVisualDepth: number
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
  visualIndentCap,
  currentVisualDepth,
  treeParentUri,
  onReply,
  onDeleteReply,
  currentUserDid,
}: ReplyBranchProps) {
  // Auto-collapse: nodes at depth >= DEFAULT_EXPANDED_LEVELS with children start collapsed
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const node of nodes) {
      if (node.reply.depth >= DEFAULT_EXPANDED_LEVELS && node.children.length > 0) {
        initial.add(node.reply.uri)
      }
    }
    return initial
  })

  // Sibling limiting: 5+ siblings at depth 2+ show only first 3
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

  if (nodes.length === 0) return null

  // At root level, the expected parent is the topic itself
  const expectedParentUri = treeParentUri ?? topicUri
  const atVisualCap = currentVisualDepth >= visualIndentCap

  // Determine sibling limiting: depth 1 (direct replies) never limited
  const siblingDepth = nodes[0]?.reply.depth ?? 1
  const shouldLimitSiblings =
    !showAllSiblings && siblingDepth >= 2 && nodes.length >= AUTO_COLLAPSE_SIBLING_THRESHOLD
  const visibleNodes = shouldLimitSiblings ? nodes.slice(0, AUTO_COLLAPSE_SHOW_COUNT) : nodes
  const hiddenSiblingCount = nodes.length - visibleNodes.length

  return (
    <ol className="list-none space-y-3 pl-0 first:pl-0 [&_&]:mt-3 [&_&]:pl-0">
      {visibleNodes.map((node) => {
        const postNumber = postNumberMap.get(node.reply.uri) ?? 0
        const hasChildren = node.children.length > 0
        const isCollapsed = collapsedNodes.has(node.reply.uri)
        const authorName =
          node.reply.author?.displayName ?? node.reply.author?.handle ?? node.reply.authorDid

        // Show reply-to badge when the reply's actual parent differs from
        // the structural parent in the tree (orphan or depth-capped)
        const needsBadge = node.reply.parentUri !== expectedParentUri
        const parentReply = needsBadge ? allReplies.get(node.reply.parentUri) : undefined
        const parentHandle = parentReply?.author?.handle ?? parentReply?.authorDid
        const parentPostNumber = parentReply ? (postNumberMap.get(parentReply.uri) ?? 0) : 0

        return (
          <li key={node.reply.uri} aria-level={node.reply.depth}>
            {needsBadge && parentHandle && parentPostNumber > 0 && (
              <ReplyToBadge authorHandle={parentHandle} parentPostNumber={parentPostNumber} />
            )}
            <div className="flex gap-0">
              {hasChildren && (
                <ThreadLine
                  expanded={!isCollapsed}
                  onToggle={() => toggleCollapse(node.reply.uri)}
                  authorName={authorName}
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
            {hasChildren &&
              !isCollapsed &&
              (atVisualCap ? (
                /* At the visual indent cap: render children flat at this level */
                <ReplyBranch
                  nodes={node.children}
                  postNumberMap={postNumberMap}
                  topicUri={topicUri}
                  allReplies={allReplies}
                  visualIndentCap={visualIndentCap}
                  currentVisualDepth={currentVisualDepth}
                  treeParentUri={node.reply.uri}
                  onReply={onReply}
                  onDeleteReply={onDeleteReply}
                  currentUserDid={currentUserDid}
                />
              ) : (
                /* Below the cap: nest normally with indentation */
                <div className="ml-5 border-l border-border pl-3 sm:ml-[22px] sm:pl-4">
                  <ReplyBranch
                    nodes={node.children}
                    postNumberMap={postNumberMap}
                    topicUri={topicUri}
                    allReplies={allReplies}
                    visualIndentCap={visualIndentCap}
                    currentVisualDepth={currentVisualDepth + 1}
                    treeParentUri={node.reply.uri}
                    onReply={onReply}
                    currentUserDid={currentUserDid}
                  />
                </div>
              ))}
            {hasChildren &&
              isCollapsed &&
              (() => {
                const totalHidden = countDescendants(node)
                return (
                  <p className="ml-12 mt-1 text-xs text-muted-foreground" aria-live="polite">
                    {totalHidden} {totalHidden === 1 ? 'reply' : 'replies'} hidden
                  </p>
                )
              })()}
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
