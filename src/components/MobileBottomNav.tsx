'use client'
import {
  Calculate,
  CurrencyExchange,
  Home,
  Settings
} from '@mui/icons-material'
import { Box, useTheme as useMuiTheme } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ROUTES = [
  { label: 'Inicio', icon: Home, value: '/' },
  { label: 'Transacciones', icon: CurrencyExchange, value: '/transactions' },
  { label: 'Presupuesto', icon: Calculate, value: '/budget' },
  { label: 'Ajustes', icon: Settings, value: '/settings' }
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      role="navigation"
      aria-label="Navegación principal"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        display: { xs: 'flex', md: 'none' },
        justifyContent: 'center',
        backgroundColor: isDark ? 'rgba(26, 26, 28, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'saturate(180%) blur(12px)',
        WebkitBackdropFilter: 'saturate(180%) blur(12px)',
        borderTop: '1px solid var(--border-color)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <Box
        component="ul"
        sx={{
          display: 'flex',
          listStyle: 'none',
          width: '100%',
          maxWidth: 480,
          m: 0,
          px: 1,
          py: 0.75,
          gap: 0.5
        }}
      >
        {ROUTES.map(({ label, icon: Icon, value }) => {
          const active = pathname === value
          return (
            <li key={value} style={{ flex: 1 }}>
              <Link
                href={value}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                style={{ textDecoration: 'none' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.25,
                    py: 0.75,
                    borderRadius: 2.5,
                    color: active ? 'var(--brand)' : 'var(--text-secondary)',
                    backgroundColor: active ? 'var(--brand-soft)' : 'transparent',
                    transition: 'background-color .15s, color .15s',
                    minHeight: 48
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                  <Box
                    component="span"
                    sx={{
                      fontSize: 11,
                      fontWeight: active ? 700 : 500,
                      letterSpacing: 0
                    }}
                  >
                    {label}
                  </Box>
                </Box>
              </Link>
            </li>
          )
        })}
      </Box>
    </Box>
  )
}
