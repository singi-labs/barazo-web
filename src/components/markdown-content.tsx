/**
 * MarkdownContent - Renders markdown content with DOMPurify sanitization.
 * Used for topic and reply content display.
 * @see specs/prd-web.md Section 4 (Topic Components)
 */

import { sanitize } from 'isomorphic-dompurify'
import { marked } from 'marked'
import { cn } from '@/lib/utils'

interface MarkdownContentProps {
  content: string
  className?: string
}

// Configure marked for safe defaults
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Configure marked renderer for links
const renderer = new marked.Renderer()
renderer.link = ({ href, text }: { href: string; text: string }) => {
  return `<a href="${href}" rel="noopener noreferrer">${text}</a>`
}

marked.use({ renderer })

/**
 * Renders markdown content, sanitized against XSS.
 * Supports: headings, bold, italic, links, code blocks, lists, blockquotes.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const rawHtml = marked.parse(content, { async: false }) as string

  const cleanHtml = sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'a',
      'code',
      'pre',
      'blockquote',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hr',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'del',
      'sup',
      'sub',
      'span',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'rel', 'target'],
    ALLOW_DATA_ATTR: false,
  })

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-headings:text-foreground prose-p:text-foreground',
        'prose-a:text-primary prose-a:underline prose-a:decoration-primary/50 hover:prose-a:decoration-primary',
        'prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-sm',
        'prose-pre:bg-muted prose-pre:rounded-lg',
        'prose-blockquote:border-l-primary',
        className
      )}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}
