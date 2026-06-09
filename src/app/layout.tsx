import ClientLayout from '@/components/ClientLayout'
import type { Metadata, Viewport } from 'next'
import { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mi app de gastos',
  description: 'Una app para llevar el control de tus gastos',
  icons: [
    {
      url: '/images/file.png',
      href: '/images/file.png',
    }
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
}

// Aplica .dark ANTES del primer paint para evitar FOUC.
// Lee localStorage primero, cae a prefers-color-scheme si no hay preferencia guardada.
const themeInitScript = `(function(){try{var s=localStorage.getItem('darkMode');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s!==null?s==='true':p;if(d){document.documentElement.classList.add('dark');}}catch(e){}})();`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning={true}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
