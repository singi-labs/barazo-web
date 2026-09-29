/**
 * Tests for MarkdownEditor component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { MarkdownEditor } from './markdown-editor'

describe('MarkdownEditor', () => {
  it('renders a labeled textarea', () => {
    render(<MarkdownEditor value="" onChange={vi.fn()} id="content" label="Content" />)
    expect(screen.getByRole('textbox', { name: 'Content' })).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MarkdownEditor value="" onChange={onChange} id="content" label="Content" />)
    await user.type(screen.getByRole('textbox', { name: 'Content' }), 'Hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders toolbar with formatting buttons', () => {
    render(<MarkdownEditor value="" onChange={vi.fn()} id="content" label="Content" />)
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' })
    expect(toolbar).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Code' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quote' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument()
  })

  it('wraps selected text with bold markers', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MarkdownEditor value="hello world" onChange={onChange} id="content" label="Content" />)
    const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

    // Select "world"
    textarea.setSelectionRange(6, 11)
    await user.click(screen.getByRole('button', { name: 'Bold' }))
    expect(onChange).toHaveBeenCalledWith('hello **world**')
  })

  it('wraps selected text with italic markers', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MarkdownEditor value="hello world" onChange={onChange} id="content" label="Content" />)
    const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

    textarea.setSelectionRange(6, 11)
    await user.click(screen.getByRole('button', { name: 'Italic' }))
    expect(onChange).toHaveBeenCalledWith('hello *world*')
  })

  it('inserts link template when no selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MarkdownEditor value="hello " onChange={onChange} id="content" label="Content" />)
    const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

    textarea.setSelectionRange(6, 6)
    await user.click(screen.getByRole('button', { name: 'Link' }))
    expect(onChange).toHaveBeenCalledWith('hello [text](url)')
  })

  it('wraps selected text with code markers', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MarkdownEditor value="hello code" onChange={onChange} id="content" label="Content" />)
    const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

    textarea.setSelectionRange(6, 10)
    await user.click(screen.getByRole('button', { name: 'Code' }))
    expect(onChange).toHaveBeenCalledWith('hello `code`')
  })

  it('prefixes line with quote marker', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MarkdownEditor value="hello" onChange={onChange} id="content" label="Content" />)
    const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

    textarea.setSelectionRange(0, 5)
    await user.click(screen.getByRole('button', { name: 'Quote' }))
    expect(onChange).toHaveBeenCalledWith('> hello')
  })

  it('prefixes line with list marker', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MarkdownEditor value="hello" onChange={onChange} id="content" label="Content" />)
    const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

    textarea.setSelectionRange(0, 5)
    await user.click(screen.getByRole('button', { name: 'List' }))
    expect(onChange).toHaveBeenCalledWith('- hello')
  })

  it('supports roving tabindex on toolbar buttons', async () => {
    const user = userEvent.setup()
    render(<MarkdownEditor value="" onChange={vi.fn()} id="content" label="Content" />)

    const boldBtn = screen.getByRole('button', { name: 'Bold' })
    const italicBtn = screen.getByRole('button', { name: 'Italic' })

    // First button is tabbable, others have tabindex -1
    expect(boldBtn).toHaveAttribute('tabindex', '0')
    expect(italicBtn).toHaveAttribute('tabindex', '-1')

    // Focus first button, arrow right to move focus
    boldBtn.focus()
    await user.keyboard('{ArrowRight}')
    expect(italicBtn).toHaveFocus()
  })

  it('shows error message when provided', () => {
    render(
      <MarkdownEditor
        value=""
        onChange={vi.fn()}
        id="content"
        label="Content"
        error="Content is required"
      />
    )
    expect(screen.getByText('Content is required')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Content' })).toHaveAttribute('aria-invalid', 'true')
  })

  describe('smart link paste', () => {
    function pasteUrl(textarea: HTMLTextAreaElement, url: string) {
      const event = new Event('paste', { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'clipboardData', {
        value: { getData: (type: string) => (type === 'text/plain' ? url : '') },
      })
      textarea.dispatchEvent(event)
      return event
    }

    it('wraps selected text as markdown link when pasting a URL', () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor value="check this out" onChange={onChange} id="content" label="Content" />
      )
      const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

      // Select "this"
      textarea.setSelectionRange(6, 10)
      pasteUrl(textarea, 'https://example.com')

      expect(onChange).toHaveBeenCalledWith('check [this](https://example.com) out')
    })

    it('does not intercept paste when no text is selected', () => {
      const onChange = vi.fn()
      render(<MarkdownEditor value="hello " onChange={onChange} id="content" label="Content" />)
      const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

      textarea.setSelectionRange(6, 6)
      const event = pasteUrl(textarea, 'https://example.com')

      // Event should not be prevented — default paste behavior
      expect(event.defaultPrevented).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not intercept paste when pasted text is not a URL', () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor value="hello world" onChange={onChange} id="content" label="Content" />
      )
      const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

      textarea.setSelectionRange(6, 11)
      const event = pasteUrl(textarea, 'not a url')

      expect(event.defaultPrevented).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('handles http:// URLs', () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor
          value="click here please"
          onChange={onChange}
          id="content"
          label="Content"
        />
      )
      const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

      textarea.setSelectionRange(6, 10)
      pasteUrl(textarea, 'http://example.com')

      expect(onChange).toHaveBeenCalledWith('click [here](http://example.com) please')
    })

    it('places cursor after the inserted link', () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor value="see docs now" onChange={onChange} id="content" label="Content" />
      )
      const textarea = screen.getByRole('textbox', { name: 'Content' }) as HTMLTextAreaElement

      textarea.setSelectionRange(4, 8)
      pasteUrl(textarea, 'https://docs.example.com')

      expect(onChange).toHaveBeenCalledWith('see [docs](https://docs.example.com) now')
    })
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(
      <MarkdownEditor value="Some content" onChange={vi.fn()} id="content" label="Content" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
