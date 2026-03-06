'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

interface ThreadHoverContextValue {
  hoveredUri: string | null
  setHovered: (uri: string | null) => void
}

const ThreadHoverContext = createContext<ThreadHoverContextValue>({
  hoveredUri: null,
  setHovered: () => {},
})

export function ThreadHoverProvider({ children }: { children: React.ReactNode }) {
  const [hoveredUri, setHoveredUri] = useState<string | null>(null)

  const setHovered = useCallback((uri: string | null) => {
    setHoveredUri(uri)
  }, [])

  const value = useMemo(() => ({ hoveredUri, setHovered }), [hoveredUri, setHovered])

  return <ThreadHoverContext.Provider value={value}>{children}</ThreadHoverContext.Provider>
}

export function useThreadHover() {
  return useContext(ThreadHoverContext)
}
