'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import useAppSettings from '@/hooks/useAppSettings'

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings, loading } = useAppSettings()

  // Initialize from localStorage to prevent flash
  const getInitialDarkMode = (): boolean => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('darkMode')
      if (stored !== null) {
        return stored === 'true'
      }
    }
    return false
  }

  const [darkMode, setDarkMode] = useState<boolean>(getInitialDarkMode)

  // Apply dark class to document whenever darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }, [darkMode])

  // Sync with settings from API
  useEffect(() => {
    if (settings && !loading) {
      // Only update if different to avoid unnecessary re-renders
      if (settings.darkMode !== darkMode) {
        setDarkMode(settings.darkMode)
      }
    }
  }, [settings, loading])

  const toggleDarkMode = async (value: boolean) => {
    setDarkMode(value)
    // Update in localStorage immediately
    localStorage.setItem('darkMode', value.toString())
    // Update in database
    await updateSettings({ darkMode: value })
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
