'use client'

import { createContext, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ToastProvider as RadixToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from '@/components/ui/toast'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  action?: {
    label: string
    onClick: () => void
    altText: string
  }
}

export interface ToastContextValue {
  toast: (message: Omit<ToastMessage, 'id'>) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

let toastCount = 0

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = String(++toastCount)
    setToasts((prev) => [...prev, { ...message, id }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      <RadixToastProvider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id)
            }}
          >
            <div className="flex-1">
              <ToastTitle>{t.title}</ToastTitle>
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>
            {t.action && (
              <ToastAction altText={t.action.altText} onClick={t.action.onClick}>
                {t.action.label}
              </ToastAction>
            )}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  )
}
