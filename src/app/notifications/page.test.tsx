/**
 * Tests for notifications page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import NotificationsPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock API client
vi.mock('@/lib/api/client', () => ({
  getNotifications: vi.fn(),
  markNotificationsRead: vi.fn(),
  getPublicSettings: vi.fn().mockResolvedValue({
    communityDid: 'did:plc:test-community-123',
    communityName: 'Test Community',
    maturityRating: 'safe',
    communityDescription: null,
    communityLogoUrl: null,
  }),
}))

vi.mock('@/hooks/use-auth', () => {
  const mockAuth = {
    user: {
      did: 'did:plc:user-alice-001',
      handle: 'alice.bsky.social',
      displayName: 'Alice',
      avatarUrl: null,
    },
    isAuthenticated: true,
    isLoading: false,
    getAccessToken: () => 'mock-access-token',
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
  }
  return { useAuth: () => mockAuth }
})

import { getNotifications, markNotificationsRead } from '@/lib/api/client'

const mockGetNotifications = vi.mocked(getNotifications)
const mockMarkRead = vi.mocked(markNotificationsRead)

const mockNotifications = [
  {
    id: 'notif-1',
    type: 'reply' as const,
    userDid: 'did:plc:user',
    actorDid: 'did:plc:bob',
    actorHandle: 'bob.bsky.social',
    subjectUri: 'at://did:plc:user/forum.barazo.topic.post/abc',
    subjectTitle: 'My Topic',
    message: 'bob.bsky.social replied to your topic',
    read: false,
    createdAt: '2026-02-14T12:00:00Z',
  },
  {
    id: 'notif-2',
    type: 'reaction' as const,
    userDid: 'did:plc:user',
    actorDid: 'did:plc:carol',
    actorHandle: 'carol.example.com',
    subjectUri: 'at://did:plc:user/forum.barazo.topic.post/abc',
    subjectTitle: 'My Topic',
    message: 'carol.example.com reacted to your topic',
    read: true,
    createdAt: '2026-02-13T12:00:00Z',
  },
]

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
    mockGetNotifications.mockResolvedValue({
      notifications: mockNotifications,
      cursor: null,
      unreadCount: 1,
    })
    mockMarkRead.mockResolvedValue(undefined)
  })

  it('renders page heading', async () => {
    render(<NotificationsPage />)
    expect(screen.getByRole('heading', { level: 1, name: /notification/i })).toBeInTheDocument()
  })

  it('displays notifications from API', async () => {
    render(<NotificationsPage />)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    expect(await screen.findByText(/bob\.bsky\.social replied/)).toBeInTheDocument()
    expect(screen.getByText(/carol\.example\.com reacted/)).toBeInTheDocument()
  })

  it('shows unread indicator on unread notifications', async () => {
    render(<NotificationsPage />)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    const items = screen.getAllByRole('article')
    // First notification is unread
    expect(items[0]).toHaveClass('border-l-primary')
  })

  it('renders mark all read button', async () => {
    render(<NotificationsPage />)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    expect(screen.getByRole('button', { name: /mark all read/i })).toBeInTheDocument()
  })

  it('calls markNotificationsRead on mark all', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    const button = screen.getByRole('button', { name: /mark all read/i })
    await user.click(button)

    expect(mockMarkRead).toHaveBeenCalled()
  })

  it('shows empty state when no notifications', async () => {
    mockGetNotifications.mockResolvedValue({
      notifications: [],
      cursor: null,
      unreadCount: 0,
    })

    render(<NotificationsPage />)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    expect(await screen.findByText(/no notifications/i)).toBeInTheDocument()
  })

  it('renders breadcrumbs', () => {
    render(<NotificationsPage />)
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<NotificationsPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
