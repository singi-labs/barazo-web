'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getSetupStatus } from '@/lib/api/client'

const BYPASS_PATHS = ['/setup', '/login', '/auth']

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const isBypassPath = useMemo(
    () => BYPASS_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)),
    [pathname]
  )

  const [checked, setChecked] = useState(isBypassPath)

  useEffect(() => {
    if (isBypassPath || checked) {
      return
    }

    async function check() {
      try {
        const status = await getSetupStatus()
        if (!status.initialized) {
          router.replace('/setup')
          return
        }
      } catch {
        // If status check fails, allow through (API might be down)
      }
      setChecked(true)
    }

    void check()
  }, [isBypassPath, checked, router])

  if (!isBypassPath && !checked) {
    return null
  }

  return <>{children}</>
}
