/**
 * Tests for SaveButton component.
 * Renders button with state-driven text/icon for idle, saving, and saved states.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { SaveButton } from './save-button'

describe('SaveButton', () => {
  it('renders default label in idle state', () => {
    render(<SaveButton status="idle" onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeEnabled()
  })

  it('renders custom label in idle state', () => {
    render(<SaveButton status="idle" onClick={vi.fn()} label="Save Settings" />)
    expect(screen.getByRole('button', { name: /save settings/i })).toBeInTheDocument()
  })

  it('renders saving label and is disabled in saving state', () => {
    render(<SaveButton status="saving" onClick={vi.fn()} />)
    const button = screen.getByRole('button', { name: /saving/i })
    expect(button).toBeDisabled()
  })

  it('renders custom saving label', () => {
    render(<SaveButton status="saving" onClick={vi.fn()} savingLabel="Recomputing..." />)
    expect(screen.getByRole('button', { name: /recomputing/i })).toBeDisabled()
  })

  it('renders saved label with check icon in saved state', () => {
    render(<SaveButton status="saved" onClick={vi.fn()} />)
    const button = screen.getByRole('button', { name: /saved/i })
    expect(button).toBeEnabled()
  })

  it('renders custom saved label', () => {
    render(<SaveButton status="saved" onClick={vi.fn()} savedLabel="Started" />)
    expect(screen.getByRole('button', { name: /started/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked in idle state', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<SaveButton status="idle" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled in saving state', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<SaveButton status="saving" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('has aria-live status region for screen readers', () => {
    const { rerender } = render(<SaveButton status="idle" onClick={vi.fn()} />)
    const liveRegion = screen.getByRole('status')
    expect(liveRegion).toBeInTheDocument()
    expect(liveRegion).toHaveTextContent('')

    rerender(<SaveButton status="saved" onClick={vi.fn()} />)
    expect(liveRegion).toHaveTextContent('Saved.')
  })

  it('announces custom saved label to screen readers', () => {
    render(<SaveButton status="saved" onClick={vi.fn()} savedLabel="Started" />)
    expect(screen.getByRole('status')).toHaveTextContent('Started.')
  })

  it('applies custom className', () => {
    render(<SaveButton status="idle" onClick={vi.fn()} className="mt-4" />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('mt-4')
  })

  it('passes axe accessibility check in idle state', async () => {
    const { container } = render(<SaveButton status="idle" onClick={vi.fn()} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('passes axe accessibility check in saved state', async () => {
    const { container } = render(<SaveButton status="saved" onClick={vi.fn()} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
