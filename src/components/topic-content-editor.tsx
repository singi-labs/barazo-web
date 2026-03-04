/**
 * TopicContentEditor - Write/Preview tabs with markdown editor.
 * @see specs/prd-web.md Section 4 (Editor Components)
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MarkdownEditor } from '@/components/markdown-editor'
import { MarkdownPreview } from '@/components/markdown-preview'

interface TopicContentEditorProps {
  content: string
  onChange: (content: string) => void
  error?: string
  required?: boolean
}

export function TopicContentEditor({
  content,
  onChange,
  error,
  required,
}: TopicContentEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

  return (
    <div className="space-y-1">
      <div role="tablist" aria-label="Editor mode" className="flex gap-1 border-b border-border">
        <button
          type="button"
          role="tab"
          id="tab-write"
          aria-selected={activeTab === 'write'}
          aria-controls="tabpanel-write"
          onClick={() => setActiveTab('write')}
          className={cn(
            'px-3 py-1.5 text-sm font-medium transition-colors',
            activeTab === 'write'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Write
        </button>
        <button
          type="button"
          role="tab"
          id="tab-preview"
          aria-selected={activeTab === 'preview'}
          aria-controls="tabpanel-preview"
          onClick={() => setActiveTab('preview')}
          className={cn(
            'px-3 py-1.5 text-sm font-medium transition-colors',
            activeTab === 'preview'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Preview
        </button>
      </div>

      <div
        id="tabpanel-write"
        role="tabpanel"
        aria-labelledby="tab-write"
        hidden={activeTab !== 'write'}
      >
        <MarkdownEditor
          value={content}
          onChange={onChange}
          id="topic-content"
          label="Content"
          required={required}
          error={error}
        />
      </div>

      <div
        id="tabpanel-preview"
        role="tabpanel"
        aria-labelledby="tab-preview"
        hidden={activeTab !== 'preview'}
      >
        <MarkdownPreview content={content} />
      </div>
    </div>
  )
}
