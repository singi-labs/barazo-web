/**
 * TopicList - Paginated list of TopicCard components.
 * Renders topics with optional heading and empty state.
 * Separates pinned topics from regular topics with section headings.
 * @see specs/prd-web.md Section 4 (Topic Components)
 */

import type { Topic } from '@/lib/api/types'
import { TopicCard } from './topic-card'

interface TopicListProps {
  topics: Topic[]
  heading?: string
}

export function TopicList({ topics, heading }: TopicListProps) {
  const pinnedTopics = topics.filter((t) => t.isPinned)
  const regularTopics = topics.filter((t) => !t.isPinned)
  const hasPinned = pinnedTopics.length > 0

  return (
    <section>
      {heading && <h2 className="mb-4 text-xl font-semibold text-foreground">{heading}</h2>}
      {topics.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No topics yet. Be the first to start a discussion!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {hasPinned && (
            <>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pinned
              </h3>
              {pinnedTopics.map((topic) => (
                <TopicCard key={topic.uri} topic={topic} />
              ))}
              <div className="border-b border-border" role="separator" />
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Topics
              </h3>
            </>
          )}
          {regularTopics.map((topic) => (
            <TopicCard key={topic.uri} topic={topic} />
          ))}
        </div>
      )}
    </section>
  )
}
