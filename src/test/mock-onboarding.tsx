/**
 * Shared test utility for mocking onboarding context.
 * Use createMockOnboardingContext() to get default overrides for tests
 * that render components gated by onboarding.
 */

import { vi } from 'vitest'
import type { OnboardingContextValue } from '@/context/onboarding-context'

export function createMockOnboardingContext(
  overrides: Partial<OnboardingContextValue> = {}
): OnboardingContextValue {
  return {
    loading: false,
    complete: true,
    showModal: false,
    status: {
      complete: true,
      fields: [],
      responses: {},
      missingFields: [],
    },
    ensureOnboarded: vi.fn(() => true),
    submit: vi.fn().mockResolvedValue(true),
    closeModal: vi.fn(),
    ...overrides,
  }
}

export function createIncompleteOnboardingContext(
  overrides: Partial<OnboardingContextValue> = {}
): OnboardingContextValue {
  return {
    loading: false,
    complete: false,
    showModal: false,
    status: {
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
      missingFields: [
        { id: 'age-field', label: 'Confirm your age', fieldType: 'age_confirmation' },
      ],
    },
    ensureOnboarded: vi.fn(() => false),
    submit: vi.fn().mockResolvedValue(true),
    closeModal: vi.fn(),
    ...overrides,
  }
}
