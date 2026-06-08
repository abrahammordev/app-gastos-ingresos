'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import useAppSettings from '@/hooks/useAppSettings'

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Lee el mismo orden que el script anti-FOUC del layout: localStorage > prefers-color-scheme > false
const getInitialDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings, loading } = useAppSettings()
  const [darkMode, setDarkMode] = useState<boolean>(getInitialDarkMode)

  // Mantén la clase .dark sincronizada con el estado
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }, [darkMode])

  // Sincroniza con la preferencia almacenada en la API una vez que llega
  useEffect(() => {
    if (settings && !loading && settings.darkMode !== darkMode) {
      setDarkMode(settings.darkMode)
    }
  }, [settings, loading])

  const toggleDarkMode = (value: boolean) => {
    setDarkMode(value)
    // No bloqueamos UI esperando a la API
    void updateSettings({ darkMode: value })
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
