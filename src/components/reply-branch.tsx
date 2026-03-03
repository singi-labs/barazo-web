/**
 * ReplyBranch - Recursive tree renderer for threaded replies.
 * Renders an <ol> of replies, each containing a ReplyCard and
 * a nested <ReplyBranch> for children.
 */

import type { ReplyTreeNode } from '@/lib/build-reply-tree'
import { ReplyCard } from './reply-card'

interface ReplyBranchProps {
  nodes: ReplyTreeNode[]
  postNumberMap: Map<string, number>
  onReply?: (target: { uri: string; cid: string; authorHandle: string; snippet: string }) => void
  currentUserDid?: string
}

export function ReplyBranch({ nodes, postNumberMap, onReply, currentUserDid }: ReplyBranchProps) {
  if (nodes.length === 0) return null

  return (
    <ol className="list-none space-y-3 pl-0 first:pl-0 [&_&]:mt-3 [&_&]:border-l [&_&]:border-border [&_&]:pl-4 sm:[&_&]:pl-6">
      {nodes.map((node) => {
        const postNumber = postNumberMap.get(node.reply.uri) ?? 0
        return (
          <li key={node.reply.uri} aria-level={node.reply.depth}>
            <ReplyCard
              reply={node.reply}
              postNumber={postNumber}
              onReply={onReply}
              canEdit={currentUserDid ? node.reply.authorDid === currentUserDid : false}
            />
            {node.children.length > 0 && (
              <ReplyBranch
                nodes={node.children}
                postNumberMap={postNumberMap}
                onReply={onReply}
                currentUserDid={currentUserDid}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
