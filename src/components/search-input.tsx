/**
 * SearchInput - WAI-ARIA Combobox with typeahead suggestions.
 * @see specs/prd-web.md Section M9 (Search)
 */

'use client'

import { useState, useRef, useCallback, useEffect, useId } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { SearchSuggestionList } from '@/components/search-suggestion-list'

export interface SearchSuggestion {
  type: 'topic' | 'reply'
  title: string
  rkey: string
}

interface SearchInputProps {
  onSearch?: (query: string) => void
  suggestions?: SearchSuggestion[]
  placeholder?: string
  className?: string
}

const DEBOUNCE_MS = 300

export function SearchInput({
  onSearch,
  suggestions = [],
  placeholder = 'Search topics...',
  className,
}: SearchInputProps) {
  const router = useRouter()
  const id = useId()
  const listboxId = `${id}-listbox`
  const statusId = `${id}-status`

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasQuery = query.length > 0
  const hasSuggestions = suggestions.length > 0
  const showListbox = isOpen && hasQuery && hasSuggestions

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value)
      setActiveIndex(-1)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (value.length > 0) {
        debounceRef.current = setTimeout(() => {
          setIsOpen(true)
          onSearch?.(value)
        }, DEBOUNCE_MS)
      } else {
        setIsOpen(false)
      }
    },
    [onSearch]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setIsOpen(false)
          setActiveIndex(-1)
          break
        case 'Enter':
          if (activeIndex >= 0 && suggestions[activeIndex]) {
            router.push(`/t/-/${suggestions[activeIndex].rkey}`)
          } else if (query) {
            router.push(`/search?q=${encodeURIComponent(query)}`)
          }
          setIsOpen(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          if (showListbox) setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          if (showListbox) setActiveIndex((prev) => Math.max(prev - 1, 0))
          break
      }
    },
    [activeIndex, suggestions, query, router, showListbox]
  )

  const handleClear = useCallback(() => {
    setQuery('')
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }, [])

  const activeDescendant = activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <MagnifyingGlass
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          weight="regular"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          role="combobox"
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (hasQuery && hasSuggestions) setIsOpen(true)
          }}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 150)
          }}
          placeholder={placeholder}
          aria-expanded={showListbox}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-label="Search"
          className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {showListbox && (
        <SearchSuggestionList
          id={listboxId}
          baseId={id}
          suggestions={suggestions}
          activeIndex={activeIndex}
          onSelect={(rkey) => {
            router.push(`/t/-/${rkey}`)
            setIsOpen(false)
          }}
        />
      )}

      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {showListbox ? `${suggestions.length} result${suggestions.length !== 1 ? 's' : ''}` : ''}
      </div>
    </div>
  )
}
