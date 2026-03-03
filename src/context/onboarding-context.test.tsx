/**
 * Tests for OnboardingProvider context.
 * Validates onboarding status fetching, ensureOnboarded gate logic,
 * modal rendering, and submission flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingProvider, useOnboardingContext } from './onboarding-context'

// --- Mocks ---

const mockGetAccessToken = vi.fn<() => string | null>(() => 'mock-access-token')
let mockIsAuthenticated = true
let mockAuthLoading = false

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: mockIsAuthenticated ? { did: 'did:plc:user-test-001', handle: 'test.bsky.social' } : null,
    isAuthenticated: mockIsAuthenticated,
    isLoading: mockAuthLoading,
    getAccessToken: mockGetAccessToken,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
    crossPostScopesGranted: false,
    requestCrossPostAuth: vi.fn(),
  }),
}))

const mockGetOnboardingStatus = vi.fn()
const mockSubmitOnboarding = vi.fn()

vi.mock('@/lib/api/client', () => ({
  getOnboardingStatus: (...args: unknown[]) => mockGetOnboardingStatus(...args),
  submitOnboarding: (...args: unknown[]) => mockSubmitOnboarding(...args),
}))

const completeStatus = {
  complete: true,
  fields: [],
  responses: {},
  missingFields: [],
}

const incompleteStatus = {
  complete: false,
  fields: [
    {
      id: 'age-field',
      communityDid: 'did:plc:community-001',
      fieldType: 'age_confirmation',
      label: 'Confirm your age',
      description: null,
      isMandatory: true,
      sortOrder: 0,
      config: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  responses: {},
  missingFields: [{ id: 'age-field', label: 'Confirm your age', fieldType: 'age_confirmation' }],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockIsAuthenticated = true
  mockAuthLoading = false
  mockGetAccessToken.mockReturnValue('mock-access-token')
  mockGetOnboardingStatus.mockResolvedValue(completeStatus)
  mockSubmitOnboarding.mockResolvedValue({ success: true })
})

/** Test consumer that exposes context values */
function TestConsumer() {
  const ctx = useOnboardingContext()
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="complete">{String(ctx.complete)}</span>
      <span data-testid="showModal">{String(ctx.showModal)}</span>
      <button type="button" onClick={() => ctx.ensureOnboarded()} data-testid="ensure-btn">
        Ensure
      </button>
      <button
        type="button"
        onClick={() => void ctx.submit([{ fieldId: 'age-field', response: true }])}
        data-testid="submit-btn"
      >
        Submit
      </button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <OnboardingProvider>
      <TestConsumer />
    </OnboardingProvider>
  )
}

describe('OnboardingProvider', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <OnboardingProvider>
          <span>child content</span>
        </OnboardingProvider>
      )
      expect(screen.getByText('child content')).toBeInTheDocument()
    })
  })

  describe('fetching status', () => {
    it('fetches onboarding status when authenticated', async () => {
      renderWithProvider()

      await waitFor(() => {
        expect(mockGetOnboardingStatus).toHaveBeenCalledWith('mock-access-token')
      })
    })

    it('does not fetch status when unauthenticated', async () => {
      mockIsAuthenticated = false
      mockGetAccessToken.mockReturnValue(null)

      renderWithProvider()

      await act(async () => {
        await new Promise((r) => setTimeout(r, 50))
      })

      expect(mockGetOnboardingStatus).not.toHaveBeenCalled()
    })

    it('does not fetch status while auth is loading', async () => {
      mockAuthLoading = true

      renderWithProvider()

      await act(async () => {
        await new Promise((r) => setTimeout(r, 50))
      })

      expect(mockGetOnboardingStatus).not.toHaveBeenCalled()
    })

    it('sets complete to true when status.complete is true', async () => {
      mockGetOnboardingStatus.mockResolvedValue(completeStatus)

      renderWithProvider()

      await waitFor(() => {
        expect(screen.getByTestId('complete')).toHaveTextContent('true')
      })
    })

    it('sets complete to false when status.complete is false', async () => {
      mockGetOnboardingStatus.mockResolvedValue(incompleteStatus)

      renderWithProvider()

      await waitFor(() => {
        expect(screen.getByTestId('complete')).toHaveTextContent('false')
      })
    })

    it('sets loading to false after fetch completes', async () => {
      renderWithProvider()

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })
    })
  })

  describe('ensureOnboarded', () => {
    it('returns true when onboarding is complete', async () => {
      mockGetOnboardingStatus.mockResolvedValue(completeStatus)

      let result: boolean | undefined
      function Consumer() {
        const ctx = useOnboardingContext()
        return (
          <button
            type="button"
            onClick={() => {
              result = ctx.ensureOnboarded()
            }}
          >
            Check
          </button>
        )
      }

      render(
        <OnboardingProvider>
          <Consumer />
        </OnboardingProvider>
      )

      await waitFor(() => {
        expect(mockGetOnboardingStatus).toHaveBeenCalled()
      })

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Check' }))

      expect(result).toBe(true)
    })

    it('returns true when loading (fail-open)', async () => {
      mockGetOnboardingStatus.mockImplementation(() => new Promise(() => {}))

      let result: boolean | undefined
      function Consumer() {
        const ctx = useOnboardingContext()
        return (
          <button
            type="button"
            onClick={() => {
              result = ctx.ensureOnboarded()
            }}
          >
            Check
          </button>
        )
      }

      render(
        <OnboardingProvider>
          <Consumer />
        </OnboardingProvider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Check' }))

      expect(result).toBe(true)
    })

    it('returns true when unauthenticated (fail-open)', async () => {
      mockIsAuthenticated = false
      mockGetAccessToken.mockReturnValue(null)

      let result: boolean | undefined
      function Consumer() {
        const ctx = useOnboardingContext()
        return (
          <button
            type="button"
            onClick={() => {
              result = ctx.ensureOnboarded()
            }}
          >
            Check
          </button>
        )
      }

      render(
        <OnboardingProvider>
          <Consumer />
        </OnboardingProvider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Check' }))

      expect(result).toBe(true)
    })

    it('returns false and opens modal when incomplete', async () => {
      mockGetOnboardingStatus.mockResolvedValue(incompleteStatus)

      let result: boolean | undefined
      function Consumer() {
        const ctx = useOnboardingContext()
        return (
          <>
            <span data-testid="modal-state">{String(ctx.showModal)}</span>
            <button
              type="button"
              onClick={() => {
                result = ctx.ensureOnboarded()
              }}
            >
              Check
            </button>
          </>
        )
      }

      render(
        <OnboardingProvider>
          <Consumer />
        </OnboardingProvider>
      )

      await waitFor(() => {
        expect(mockGetOnboardingStatus).toHaveBeenCalled()
      })

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10))
      })

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Check' }))

      expect(result).toBe(false)
      expect(screen.getByTestId('modal-state')).toHaveTextContent('true')
    })
  })

  describe('submit', () => {
    it('calls API, refreshes status, and closes modal on success', async () => {
      mockGetOnboardingStatus
        .mockResolvedValueOnce(incompleteStatus)
        .mockResolvedValueOnce(completeStatus)

      renderWithProvider()

      await waitFor(() => {
        expect(screen.getByTestId('complete')).toHaveTextContent('false')
      })

      const user = userEvent.setup()
      await user.click(screen.getByTestId('ensure-btn'))

      expect(screen.getByTestId('showModal')).toHaveTextContent('true')

      await user.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(mockSubmitOnboarding).toHaveBeenCalledWith(
          { responses: [{ fieldId: 'age-field', response: true }] },
          'mock-access-token'
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('complete')).toHaveTextContent('true')
        expect(screen.getByTestId('showModal')).toHaveTextContent('false')
      })
    })
  })

  describe('useOnboardingContext outside provider', () => {
    it('throws when used outside OnboardingProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      function BadConsumer() {
        useOnboardingContext()
        return null
      }

      expect(() => render(<BadConsumer />)).toThrow(
        'useOnboardingContext must be used within an OnboardingProvider'
      )

      consoleSpy.mockRestore()
    })
  })
})
