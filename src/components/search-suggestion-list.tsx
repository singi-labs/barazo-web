/**
 * SearchSuggestionList - Listbox of search suggestions with keyboard navigation.
 * @see specs/prd-web.md Section M9 (Search)
 */

import { cn } from '@/lib/utils'
import type { SearchSuggestion } from '@/components/search-input'

interface SearchSuggestionListProps {
  id: string
  baseId: string
  suggestions: SearchSuggestion[]
  activeIndex: number
  onSelect: (rkey: string, authorHandle: string) => void
}

export function SearchSuggestionList({
  id,
  baseId,
  suggestions,
  activeIndex,
  onSelect,
}: SearchSuggestionListProps) {
  return (
    <div
      id={id}
      role="listbox"
      aria-label="Search suggestions"
      className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-card py-1 shadow-lg"
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion.rkey}
          id={`${baseId}-option-${index}`}
          role="option"
          tabIndex={-1}
          aria-selected={index === activeIndex}
          className={cn(
            'cursor-pointer px-3 py-2 text-sm',
            index === activeIndex
              ? 'bg-primary/10 text-foreground'
              : 'text-foreground hover:bg-muted'
          )}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(suggestion.rkey, suggestion.authorHandle)
          }}
        >
          <span className="font-medium">{suggestion.title}</span>
          <span className="ml-2 text-xs text-muted-foreground capitalize">{suggestion.type}</span>
        </div>
      ))}
    </div>
  )
}
