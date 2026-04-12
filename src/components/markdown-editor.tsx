/**
 * MarkdownEditor - Textarea with WAI-ARIA Toolbar for markdown formatting.
 * Supports bold, italic, link, code, quote, and list formatting.
 * Implements roving tabindex for toolbar keyboard navigation.
 * @see specs/prd-web.md Section 4 (Editor Components)
 */

'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { FormLabel } from '@/components/ui/form-label'
import { TOOLBAR_ACTIONS } from '@/components/markdown-toolbar-actions'
import type { ToolbarAction } from '@/components/markdown-toolbar-actions'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  id: string
  label: string
  required?: boolean
  optional?: boolean
  error?: string
  className?: string
  placeholder?: string
}

export function MarkdownEditor({
  value,
  onChange,
  id,
  label,
  required,
  optional,
  error,
  className,
  placeholder,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  const handleAction = useCallback(
    (action: ToolbarAction) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const { result, cursor } = action.apply(value, start, end)

      onChange(result)

      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(cursor, cursor)
      })
    },
    [value, onChange]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      if (start === end) return // No selection — let default paste happen

      const pasted = e.clipboardData.getData('text/plain')
      if (!/^https?:\/\/\S+$/.test(pasted)) return // Not a URL

      e.preventDefault()
      const before = value.slice(0, start)
      const selected = value.slice(start, end)
      const after = value.slice(end)
      const link = `[${selected}](${pasted})`
      onChange(before + link + after)

      const cursorPos = start + link.length
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(cursorPos, cursorPos)
      })
    },
    [value, onChange]
  )

  const handleToolbarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const buttons = toolbarRef.current?.querySelectorAll<HTMLButtonElement>('button')
      if (!buttons?.length) return

      let newIndex = focusedIndex

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        newIndex = (focusedIndex + 1) % buttons.length
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        newIndex = (focusedIndex - 1 + buttons.length) % buttons.length
      } else if (e.key === 'Home') {
        e.preventDefault()
        newIndex = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        newIndex = buttons.length - 1
      } else {
        return
      }

      setFocusedIndex(newIndex)
      buttons[newIndex]?.focus()
    },
    [focusedIndex]
  )

  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn('space-y-1', className)}>
      <FormLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FormLabel>

      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label="Formatting"
        aria-controls={id}
        onKeyDown={handleToolbarKeyDown}
        className="flex items-center gap-0.5 rounded-t-md border border-b-0 border-border bg-muted/50 px-1 py-1"
      >
        {TOOLBAR_ACTIONS.map((action, index) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              type="button"
              aria-label={action.label}
              tabIndex={index === focusedIndex ? 0 : -1}
              onClick={() => handleAction(action)}
              onFocus={() => setFocusedIndex(index)}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="h-4 w-4" weight="bold" aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder ?? 'Write your content using Markdown...'}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        className={cn(
          'block w-full rounded-b-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'min-h-[200px] resize-y font-mono',
          error && 'border-destructive'
        )}
      />

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
