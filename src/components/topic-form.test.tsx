/**
 * Tests for TopicForm component.
 */

import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'
import { TopicForm } from './topic-form'

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    crossPostScopesGranted: true,
    requestCrossPostAuth: vi.fn(),
  }),
}))

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('TopicForm', () => {
  it('renders title input', () => {
    render(<TopicForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument()
  })

  it('renders category select', () => {
    render(<TopicForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeInTheDocument()
  })

  it('renders tag input', () => {
    render(<TopicForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: /Tags/ })).toBeInTheDocument()
  })

  it('renders content editor', () => {
    render(<TopicForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: 'Content' })).toBeInTheDocument()
  })

  it('renders cross-post checkboxes', () => {
    render(<TopicForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Share on Bluesky')).toBeInTheDocument()
    expect(screen.getByLabelText('Share on Frontpage')).toBeInTheDocument()
  })

  it('defaults Bluesky cross-post to checked', () => {
    render(<TopicForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Share on Bluesky')).toBeChecked()
  })

  it('defaults Frontpage cross-post to unchecked', () => {
    render(<TopicForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Share on Frontpage')).not.toBeChecked()
  })

  it('renders submit button', () => {
    render(<TopicForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Create Topic' })).toBeInTheDocument()
  })

  it('shows edit mode submit button text', () => {
    render(
      <TopicForm
        onSubmit={vi.fn()}
        initialValues={{
          title: 'Test',
          content: 'Content',
          category: 'general',
        }}
        mode="edit"
      />
    )
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('validates required title', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TopicForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Create Topic' }))
    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('validates required content', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TopicForm onSubmit={onSubmit} />)

    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Test Title')
    await user.click(screen.getByRole('button', { name: 'Create Topic' }))
    expect(screen.getByText('Content is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('validates required category', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TopicForm onSubmit={onSubmit} />)

    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Test Title')
    await user.type(screen.getByRole('textbox', { name: 'Content' }), 'Test content')
    await user.click(screen.getByRole('button', { name: 'Create Topic' }))
    expect(screen.getByText('Category is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('validates title length', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TopicForm onSubmit={onSubmit} />)

    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'AB')
    await user.click(screen.getByRole('button', { name: 'Create Topic' }))
    expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders preview tab', async () => {
    const user = userEvent.setup()
    render(<TopicForm onSubmit={vi.fn()} />)

    const previewTab = screen.getByRole('tab', { name: 'Preview' })
    expect(previewTab).toBeInTheDocument()

    await user.click(previewTab)
    expect(screen.getByText('Nothing to preview')).toBeInTheDocument()
  })

  it('pre-populates form in edit mode', () => {
    render(
      <TopicForm
        onSubmit={vi.fn()}
        initialValues={{
          title: 'Existing Topic',
          content: 'Existing content',
          category: 'general',
          tags: ['test', 'edit'],
        }}
        mode="edit"
      />
    )
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Existing Topic')
    expect(screen.getByRole('textbox', { name: 'Content' })).toHaveValue('Existing content')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<TopicForm onSubmit={vi.fn()} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
