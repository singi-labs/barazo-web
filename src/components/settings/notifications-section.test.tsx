/**
 * Tests for NotificationsSection component.
 * Verifies the radio-based notification level UI with WCAG 2.2 AA compliance.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { NotificationsSection } from './notifications-section'

describe('NotificationsSection', () => {
  it('renders the notifications fieldset with legend', () => {
    render(<NotificationsSection notificationLevel="mentions_only" onLevelChange={vi.fn()} />)
    expect(screen.getByRole('group', { name: /notifications/i })).toBeInTheDocument()
  })

  it('renders three radio options', () => {
    render(<NotificationsSection notificationLevel="mentions_only" onLevelChange={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /all notifications/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /mentions only/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /none/i })).toBeInTheDocument()
  })

  it('selects the correct radio for "mentions_only" level', () => {
    render(<NotificationsSection notificationLevel="mentions_only" onLevelChange={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /mentions only/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /all notifications/i })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /none/i })).not.toBeChecked()
  })

  it('selects the correct radio for "all" level', () => {
    render(<NotificationsSection notificationLevel="all" onLevelChange={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /all notifications/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /mentions only/i })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /none/i })).not.toBeChecked()
  })

  it('selects the correct radio for "none" level', () => {
    render(<NotificationsSection notificationLevel="none" onLevelChange={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /none/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /all notifications/i })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /mentions only/i })).not.toBeChecked()
  })

  it('calls onLevelChange with "all" when All notifications radio is selected', async () => {
    const onLevelChange = vi.fn()
    render(<NotificationsSection notificationLevel="mentions_only" onLevelChange={onLevelChange} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('radio', { name: /all notifications/i }))
    expect(onLevelChange).toHaveBeenCalledWith('all')
  })

  it('calls onLevelChange with "mentions_only" when Mentions only radio is selected', async () => {
    const onLevelChange = vi.fn()
    render(<NotificationsSection notificationLevel="all" onLevelChange={onLevelChange} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('radio', { name: /mentions only/i }))
    expect(onLevelChange).toHaveBeenCalledWith('mentions_only')
  })

  it('calls onLevelChange with "none" when None radio is selected', async () => {
    const onLevelChange = vi.fn()
    render(<NotificationsSection notificationLevel="mentions_only" onLevelChange={onLevelChange} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('radio', { name: /none/i }))
    expect(onLevelChange).toHaveBeenCalledWith('none')
  })

  it('radio inputs are keyboard-navigable (all have accessible names)', () => {
    render(<NotificationsSection notificationLevel="mentions_only" onLevelChange={vi.fn()} />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
    radios.forEach((radio) => {
      expect(radio).toHaveAccessibleName()
    })
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(
      <NotificationsSection notificationLevel="mentions_only" onLevelChange={vi.fn()} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
