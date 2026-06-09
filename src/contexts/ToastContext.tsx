'use client'
import { Alert, Snackbar } from '@mui/material'
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

type ToastSeverity = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  message: string
  severity: ToastSeverity
}

interface ToastContextValue {
  show: (message: string, severity?: ToastSeverity) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      show: () => undefined,
      success: () => undefined,
      error: () => undefined,
      info: () => undefined,
      warning: () => undefined
    }
  }
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const show = useCallback((message: string, severity: ToastSeverity = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, severity }])
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (m: string) => show(m, 'success'),
      error: (m: string) => show(m, 'error'),
      info: (m: string) => show(m, 'info'),
      warning: (m: string) => show(m, 'warning')
    }),
    [show]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom) + 16px)',
          right: 16,
          left: 16,
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: 'flex-end',
          gap: 8,
          pointerEvents: 'none',
          zIndex: 1400
        }}
      >
        {toasts.map(toast => (
          <Snackbar
            key={toast.id}
            open
            autoHideDuration={toast.severity === 'error' ? 6000 : 4000}
            onClose={() => dismiss(toast.id)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{
              position: 'static',
              transform: 'none',
              pointerEvents: 'auto',
              maxWidth: 420,
              '& .MuiPaper-root': { width: '100%' }
            }}
          >
            <Alert
              onClose={() => dismiss(toast.id)}
              severity={toast.severity}
              variant="filled"
              sx={{
                borderRadius: 2.5,
                fontWeight: 500,
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.18)'
              }}
            >
              {toast.message}
            </Alert>
          </Snackbar>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
