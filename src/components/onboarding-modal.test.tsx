/**
 * Tests for OnboardingModal component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { OnboardingModal } from './onboarding-modal'
import type { OnboardingField } from '@/lib/api/types'

const NOW = '2026-02-15T12:00:00.000Z'

function makeField(overrides: Partial<OnboardingField> = {}): OnboardingField {
  return {
    id: 'field-1',
    communityDid: 'did:plc:test',
    fieldType: 'custom_text',
    label: 'Tell us about yourself',
    description: 'A brief introduction.',
    isMandatory: true,
    sortOrder: 0,
    source: 'admin',
    config: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }
}

const defaultProps = {
  open: true,
  fields: [makeField()],
  onSubmit: vi.fn().mockResolvedValue(true),
  onCancel: vi.fn(),
}

describe('OnboardingModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<OnboardingModal {...defaultProps} open={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog with title when open', () => {
    render(<OnboardingModal {...defaultProps} />)
    expect(
      screen.getByRole('heading', { name: /complete community onboarding/i })
    ).toBeInTheDocument()
  })

  it('renders a text input for custom_text fields', () => {
    render(<OnboardingModal {...defaultProps} />)
    expect(screen.getByLabelText(/tell us about yourself/i)).toBeInTheDocument()
  })

  it('renders a checkbox for tos_acceptance fields', () => {
    render(
      <OnboardingModal
        {...defaultProps}
        fields={[makeField({ id: 'tos', fieldType: 'tos_acceptance', label: 'Accept Terms' })]}
      />
    )
    expect(screen.getByLabelText(/accept terms/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders age dropdown for age_confirmation fields', () => {
    render(
      <OnboardingModal
        {...defaultProps}
        fields={[makeField({ id: 'age', fieldType: 'age_confirmation', label: 'Your age' })]}
      />
    )
    expect(screen.getByLabelText(/your age/i)).toBeInTheDocument()
    expect(screen.getByText('13+')).toBeInTheDocument()
    expect(screen.getByText('18+')).toBeInTheDocument()
  })

  it('renders email input for newsletter_email fields', () => {
    render(
      <OnboardingModal
        {...defaultProps}
        fields={[
          makeField({ id: 'email', fieldType: 'newsletter_email', label: 'Newsletter email' }),
        ]}
      />
    )
    const input = screen.getByLabelText(/newsletter email/i)
    expect(input).toHaveAttribute('type', 'email')
  })

  it('renders select for custom_select fields', () => {
    render(
      <OnboardingModal
        {...defaultProps}
        fields={[
          makeField({
            id: 'role',
            fieldType: 'custom_select',
            label: 'Your role',
            config: { options: ['Developer', 'Designer', 'Other'] },
          }),
        ]}
      />
    )
    expect(screen.getByLabelText(/your role/i)).toBeInTheDocument()
    expect(screen.getByText('Developer')).toBeInTheDocument()
  })

  it('renders checkbox for custom_checkbox fields', () => {
    render(
      <OnboardingModal
        {...defaultProps}
        fields={[
          makeField({
            id: 'agree',
            fieldType: 'custom_checkbox',
            label: 'I agree to participate',
          }),
        ]}
      />
    )
    expect(screen.getByLabelText(/i agree to participate/i)).toBeInTheDocument()
  })

  it('disables submit when mandatory fields are empty', () => {
    render(<OnboardingModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  })

  it('enables submit when mandatory fields are filled', async () => {
    const user = userEvent.setup()
    render(<OnboardingModal {...defaultProps} />)

    await user.type(screen.getByLabelText(/tell us about yourself/i), 'Hello!')
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })

  it('requires tos_acceptance to be checked for submit to enable', async () => {
    const user = userEvent.setup()
    render(
      <OnboardingModal
        {...defaultProps}
        fields={[makeField({ id: 'tos', fieldType: 'tos_acceptance', label: 'Accept Terms' })]}
      />
    )

    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
    await user.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })

  it('calls onSubmit with responses when submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    const user = userEvent.setup()
    render(<OnboardingModal {...defaultProps} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/tell us about yourself/i), 'Hello!')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(onSubmit).toHaveBeenCalledWith([{ fieldId: 'field-1', response: 'Hello!' }])
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<OnboardingModal {...defaultProps} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows error when submit fails', async () => {
    const onSubmit = vi.fn().mockResolvedValue(false)
    const user = userEvent.setup()
    render(<OnboardingModal {...defaultProps} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/tell us about yourself/i), 'Hello!')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/failed to submit/i)
  })

  it('shows required indicator for mandatory fields', () => {
    render(<OnboardingModal {...defaultProps} />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('shows field descriptions', () => {
    render(<OnboardingModal {...defaultProps} />)
    expect(screen.getByText('A brief introduction.')).toBeInTheDocument()
  })

  it('does not disable submit when only optional fields are empty', () => {
    render(<OnboardingModal {...defaultProps} fields={[makeField({ isMandatory: false })]} />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })

  it('renders a ToS link when config.tosUrl is set', () => {
    render(
      <OnboardingModal
        {...defaultProps}
        fields={[
          makeField({
            id: 'tos',
            fieldType: 'tos_acceptance',
            label: 'Accept Terms',
            config: { tosUrl: 'https://example.com/tos' },
          }),
        ]}
      />
    )
    const link = screen.getByRole('link', { name: /read full terms of service/i })
    expect(link).toHaveAttribute('href', 'https://example.com/tos')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render a link when config.tosUrl is absent', () => {
    render(
      <OnboardingModal
        {...defaultProps}
        fields={[
          makeField({
            id: 'tos',
            fieldType: 'tos_acceptance',
            label: 'Accept Terms',
            config: null,
          }),
        ]}
      />
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('passes axe accessibility check for tos_acceptance with tosUrl', async () => {
    const { container } = render(
      <OnboardingModal
        {...defaultProps}
        fields={[
          makeField({
            id: 'tos',
            fieldType: 'tos_acceptance',
            label: 'Accept Terms',
            config: { tosUrl: 'https://example.com/tos' },
          }),
        ]}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<OnboardingModal {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
