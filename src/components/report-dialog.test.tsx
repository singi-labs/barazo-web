/**
 * Tests for ReportDialog component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ReportDialog } from './report-dialog'

describe('ReportDialog', () => {
  it('renders report button', () => {
    render(<ReportDialog subjectUri="at://test" onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /report/i })).toBeInTheDocument()
  })

  it('opens dialog on button click', async () => {
    const user = userEvent.setup()
    render(<ReportDialog subjectUri="at://test" onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /report/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows reason categories matching AT Protocol types', async () => {
    const user = userEvent.setup()
    render(<ReportDialog subjectUri="at://test" onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /report/i }))
    expect(screen.getByLabelText(/spam/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sexual content/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/harassment/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/rule violation/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/misleading/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/other/i)).toBeInTheDocument()
  })

  it('requires reason selection before submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ReportDialog subjectUri="at://test" onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /report/i }))
    await user.click(screen.getByRole('button', { name: /submit report/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/select a reason/i)).toBeInTheDocument()
  })

  it('submits report with selected reason and optional text', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ReportDialog subjectUri="at://test" onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /report/i }))
    await user.click(screen.getByLabelText(/spam/i))
    await user.type(screen.getByLabelText(/additional details/i), 'This is spam content')
    await user.click(screen.getByRole('button', { name: /submit report/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      subjectUri: 'at://test',
      reason: 'spam',
      details: 'This is spam content',
    })
  })

  it('closes dialog on cancel', async () => {
    const user = userEvent.setup()
    render(<ReportDialog subjectUri="at://test" onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /report/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('hides report button when disabled', () => {
    render(<ReportDialog subjectUri="at://test" onSubmit={vi.fn()} disabled />)
    expect(screen.queryByRole('button', { name: /report/i })).not.toBeInTheDocument()
  })

  it('shows success acknowledgment after report submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ReportDialog subjectUri="at://test" onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /report/i }))
    await user.click(screen.getByLabelText(/spam/i))
    await user.click(screen.getByRole('button', { name: /submit report/i }))
    expect(await screen.findByText(/report submitted/i)).toBeInTheDocument()
    expect(screen.getByText(/moderator will review/i)).toBeInTheDocument()
  })

  it('shows error message when report submission fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('Rate limited'))
    render(<ReportDialog subjectUri="at://test" onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /report/i }))
    await user.click(screen.getByLabelText(/spam/i))
    await user.click(screen.getByRole('button', { name: /submit report/i }))
    expect(await screen.findByText(/failed to submit report/i)).toBeInTheDocument()
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    let resolveSubmit: () => void
    const onSubmit = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSubmit = resolve
      })
    )
    render(<ReportDialog subjectUri="at://test" onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /report/i }))
    await user.click(screen.getByLabelText(/spam/i))
    await user.click(screen.getByRole('button', { name: /submit report/i }))
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
    resolveSubmit!()
  })

  it('passes axe accessibility check when dialog is open', async () => {
    const user = userEvent.setup()
    const { container } = render(<ReportDialog subjectUri="at://test" onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /report/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('passes axe accessibility check when showing success acknowledgment', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<ReportDialog subjectUri="at://test" onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /report/i }))
    await user.click(screen.getByLabelText(/spam/i))
    await user.click(screen.getByRole('button', { name: /submit report/i }))
    await screen.findByText(/report submitted/i)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
