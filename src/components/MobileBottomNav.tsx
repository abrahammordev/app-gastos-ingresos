'use client'
import {
  Calculate,
  CurrencyExchange,
  Home,
  Settings
} from '@mui/icons-material'
import { BottomNavigation, BottomNavigationAction, Paper, useTheme as useMuiTheme } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'

const ROUTES = [
  { label: 'Inicio', icon: <Home />, value: '/' },
  { label: 'Transacciones', icon: <CurrencyExchange />, value: '/transactions' },
  { label: 'Presupuesto', icon: <Calculate />, value: '/budget' },
  { label: 'Ajustes', icon: <Settings />, value: '/settings' }
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'

  const value = ROUTES.find(r => r.value === pathname)?.value ?? '/'

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        display: { xs: 'block', md: 'none' },
        backgroundColor: isDark ? '#1e1e1e' : '#fff',
        borderTop: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
      role="navigation"
      aria-label="Navegación principal"
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => router.push(newValue as string)}
        showLabels
        sx={{
          backgroundColor: 'transparent',
          height: 64,
          '& .Mui-selected': { color: '#257CA3' }
        }}
      >
        {ROUTES.map(route => (
          <BottomNavigationAction
            key={route.value}
            label={route.label}
            value={route.value}
            icon={route.icon}
            aria-label={route.label}
            sx={{
              minWidth: 'auto',
              padding: '6px 8px',
              color: isDark ? '#b0b0b0' : '#666',
              '& .MuiBottomNavigationAction-label': {
                fontSize: 11,
                '&.Mui-selected': { fontSize: 12 }
              }
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
