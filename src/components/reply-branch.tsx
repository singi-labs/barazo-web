/**
 * ReplyBranch - Recursive tree renderer for threaded replies.
 * Renders an <ol> of replies, each containing a ReplyCard and
 * a nested <ReplyBranch> for children. Thread lines appear next
 * to replies with children for collapse/expand. Reply-to badges
 * show when a reply's parent isn't visually adjacent.
 * Respects visual indent cap — stops nesting beyond the cap.
 */

'use client'

import { useState, useCallback } from 'react'
import type { Reply } from '@/lib/api/types'
import type { ReplyTreeNode } from '@/lib/build-reply-tree'
import { ReplyCard } from './reply-card'
import { ThreadLine } from './thread-line'
import { ReplyToBadge } from './reply-to-badge'

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
  currentUserDid,
}: ReplyBranchProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())

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

  return (
    <ol className="list-none space-y-3 pl-0 first:pl-0 [&_&]:mt-3 [&_&]:pl-0">
      {nodes.map((node) => {
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
            {hasChildren && isCollapsed && (
              <p className="ml-12 mt-1 text-xs text-muted-foreground" aria-live="polite">
                {node.children.length} {node.children.length === 1 ? 'reply' : 'replies'} hidden
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
