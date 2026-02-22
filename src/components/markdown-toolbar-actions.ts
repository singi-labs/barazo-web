/**
 * Markdown toolbar actions configuration.
 * Each action defines how to wrap/insert markdown formatting.
 * @see specs/prd-web.md Section 4 (Editor Components)
 */

import { TextB, TextItalic, Link as LinkIcon, Code, Quotes, List } from '@phosphor-icons/react'

export interface ToolbarAction {
  label: string
  icon: typeof TextB
  apply: (value: string, start: number, end: number) => { result: string; cursor: number }
}

export const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    label: 'Bold',
    icon: TextB,
    apply: (value, start, end) => {
      const selected = value.slice(start, end)
      const replacement = selected ? `**${selected}**` : '**text**'
      return {
        result: value.slice(0, start) + replacement + value.slice(end),
        cursor: selected ? start + replacement.length : start + 2,
      }
    },
  },
  {
    label: 'Italic',
    icon: TextItalic,
    apply: (value, start, end) => {
      const selected = value.slice(start, end)
      const replacement = selected ? `*${selected}*` : '*text*'
      return {
        result: value.slice(0, start) + replacement + value.slice(end),
        cursor: selected ? start + replacement.length : start + 1,
      }
    },
  },
  {
    label: 'Link',
    icon: LinkIcon,
    apply: (value, start, end) => {
      const selected = value.slice(start, end)
      const replacement = selected ? `[${selected}](url)` : '[text](url)'
      return {
        result: value.slice(0, start) + replacement + value.slice(end),
        cursor: selected ? start + selected.length + 3 : start + 1,
      }
    },
  },
  {
    label: 'Code',
    icon: Code,
    apply: (value, start, end) => {
      const selected = value.slice(start, end)
      const replacement = selected ? `\`${selected}\`` : '`code`'
      return {
        result: value.slice(0, start) + replacement + value.slice(end),
        cursor: selected ? start + replacement.length : start + 1,
      }
    },
  },
  {
    label: 'Quote',
    icon: Quotes,
    apply: (value, start, end) => {
      const selected = value.slice(start, end)
      const replacement = `> ${selected || 'quote'}`
      return {
        result: value.slice(0, start) + replacement + value.slice(end),
        cursor: start + replacement.length,
      }
    },
  },
  {
    label: 'List',
    icon: List,
    apply: (value, start, end) => {
      const selected = value.slice(start, end)
      const replacement = `- ${selected || 'item'}`
      return {
        result: value.slice(0, start) + replacement + value.slice(end),
        cursor: start + replacement.length,
      }
    },
  },
]
