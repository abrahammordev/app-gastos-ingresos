'use client'

import CommandPalette from '@/components/CommandPalette'
import ResponsiveDrawer from '@/components/ResponsiveDrawer'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ReactNode, useEffect } from 'react'

function ClientLayoutInner({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      const originalWarn = console.error
      // eslint-disable-next-line no-console
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' && args[0].includes(
            'Support for defaultProps will be removed from function components in a future major release.'
          )
        ) {
          return
        }
        originalWarn(...args)
      }
    }

    const unwantedAttributes = ['class', 'cz-shortcut-listen', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed']
    unwantedAttributes.forEach(attr => document.body.removeAttribute(attr))
  }, [])

  return (
    <>
      <CommandPalette />
      <ResponsiveDrawer>{children}</ResponsiveDrawer>
    </>
  )
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ClientLayoutInner>{children}</ClientLayoutInner>
      </ToastProvider>
    </ThemeProvider>
  )
}
