import type { Metadata } from 'next'
import { Source_Code_Pro } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/context/auth-context'
import { AppToastProvider } from '@/context/toast-context'
import { OnboardingProvider } from '@/context/onboarding-context'
import { SetupGuard } from '@/components/setup-guard'
import { getPublicSettings } from '@/lib/api/client'

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl: string | null = null
  try {
    const settings = await getPublicSettings()
    faviconUrl = settings.faviconUrl
  } catch {
    // Fallback to default favicon if API is unreachable
  }

  return {
    title: {
      default: 'Barazo - Community Forums on the AT Protocol',
      template: '%s | Barazo',
    },
    description:
      'Federated community forums with portable identity, user data ownership, and cross-community reputation.',
    keywords: ['forum', 'community', 'AT Protocol', 'federated', 'discussions'],
    authors: [{ name: 'Barazo' }],
    creator: 'Barazo',
    metadataBase: new URL('https://barazo.forum'),
    icons: {
      icon: faviconUrl ?? '/favicon.ico',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'Barazo',
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@barazoforum',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={sourceCodePro.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppToastProvider>
              <OnboardingProvider>
                <SetupGuard>{children}</SetupGuard>
              </OnboardingProvider>
            </AppToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
