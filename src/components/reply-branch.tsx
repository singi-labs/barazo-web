/**
 * ReplyBranch - Recursive tree renderer for threaded replies.
 * Renders an <ol> of replies, each containing a ReplyCard and
 * a nested <ReplyBranch> for children. Thread lines appear next
 * to replies with children for collapse/expand.
 */

'use client'

import { useState, useCallback } from 'react'
import type { ReplyTreeNode } from '@/lib/build-reply-tree'
import { ReplyCard } from './reply-card'
import { ThreadLine } from './thread-line'

interface ReplyBranchProps {
  nodes: ReplyTreeNode[]
  postNumberMap: Map<string, number>
  onReply?: (target: { uri: string; cid: string; authorHandle: string; snippet: string }) => void
  currentUserDid?: string
}

export function ReplyBranch({ nodes, postNumberMap, onReply, currentUserDid }: ReplyBranchProps) {
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

  return (
    <ol className="list-none space-y-3 pl-0 first:pl-0 [&_&]:mt-3 [&_&]:pl-0">
      {nodes.map((node) => {
        const postNumber = postNumberMap.get(node.reply.uri) ?? 0
        const hasChildren = node.children.length > 0
        const isCollapsed = collapsedNodes.has(node.reply.uri)
        const authorName =
          node.reply.author?.displayName ?? node.reply.author?.handle ?? node.reply.authorDid

        return (
          <li key={node.reply.uri} aria-level={node.reply.depth}>
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
            {hasChildren && !isCollapsed && (
              <div className="ml-5 border-l border-border pl-3 sm:ml-[22px] sm:pl-4">
                <ReplyBranch
                  nodes={node.children}
                  postNumberMap={postNumberMap}
                  onReply={onReply}
                  currentUserDid={currentUserDid}
                />
              </div>
            )}
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
