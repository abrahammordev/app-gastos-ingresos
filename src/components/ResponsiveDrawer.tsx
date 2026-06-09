'use client'
import { RefreshContext } from '@/contexts/RefreshContext'
import { getTheme } from '@/theme'
import { Add, Calculate, CurrencyExchange, Home, Logout, Settings, DarkMode, LightMode } from '@mui/icons-material'
import MenuIcon from '@mui/icons-material/Menu'
import { Fab, ThemeProvider as MuiThemeProvider, Switch, Box } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import TransactionModal from './modal/TransactionModal'
import MobileBottomNav from './MobileBottomNav'

const drawerWidth = 248

const NAV_ITEMS = [
  { label: 'Inicio', href: '/', icon: Home },
  { label: 'Transacciones', href: '/transactions', icon: CurrencyExchange },
  { label: 'Presupuesto', href: '/budget', icon: Calculate },
  { label: 'Configuración', href: '/settings', icon: Settings }
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'Inicio',
  '/transactions': 'Transacciones',
  '/budget': 'Presupuesto',
  '/settings': 'Configuración'
}

export default function ResponsiveDrawer({
  children
}: Readonly<{
  children: ReactNode
}>) {
  const { darkMode, toggleDarkMode } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const [addTransaction, setAddTransaction] = useState(false)

  const [refreshKeyTransactions, setRefreshKeyTransactions] = useState(0)
  const [refreshKeyCategories, setRefreshKeyCategories] = useState(0)

  const refreshTransactions = useCallback(() => {
    setRefreshKeyTransactions(prev => prev + 1)
  }, [])

  const refreshCategories = useCallback(() => {
    setRefreshKeyCategories(prev => prev + 1)
  }, [])

  const handleDrawerClose = () => {
    setIsClosing(true)
    setMobileOpen(false)
  }

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false)
  }

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('apiKey') && pathname !== '/login') {
      window.location.href = '/login'
      return
    }

    if (localStorage.getItem('apiKey') && pathname === '/login') {
      window.location.href = '/'
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const safeDark = mounted && darkMode

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          height: 64,
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--brand-soft)'
          }}
        >
          <Image src='/images/file.png' alt='logo' width={22} height={22} />
        </Box>
        <Box>
          <Typography variant="body1" fontWeight={700} lineHeight={1.1} color="var(--text-primary)">
            Mis gastos
          </Typography>
          <Typography variant="caption" color="var(--text-secondary)" lineHeight={1}>
            Control financiero
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box component="nav" sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={() => setMobileOpen(false)}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2.5,
                  fontSize: 14,
                  fontWeight: 600,
                  position: 'relative',
                  color: active ? 'var(--brand)' : 'var(--text-secondary)',
                  backgroundColor: active ? 'var(--brand-soft)' : 'transparent',
                  transition: 'background-color .15s, color .15s',
                  '&:hover': {
                    backgroundColor: active ? 'var(--brand-soft)' : 'rgba(127,127,127,0.08)',
                    color: active ? 'var(--brand)' : 'var(--text-primary)'
                  }
                }}
              >
                {active && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -6,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: 3,
                      backgroundColor: 'var(--brand)'
                    }}
                  />
                )}
                <Icon sx={{ fontSize: 20 }} />
                <span>{label}</span>
              </Box>
            </Link>
          )
        })}
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid var(--border-color)', p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1,
            borderRadius: 2.5
          }}
        >
          {mounted && darkMode ? (
            <DarkMode sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
          ) : (
            <LightMode sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
          )}
          <Typography variant="body2" fontWeight={600} sx={{ flex: 1, color: 'var(--text-secondary)' }}>
            Modo oscuro
          </Typography>
          <Switch
            checked={safeDark}
            onChange={(e) => toggleDarkMode(e.target.checked)}
            color="primary"
            size="small"
          />
        </Box>
        <Link
          href="/login"
          onClick={() => localStorage.removeItem('apiKey')}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1.25,
              borderRadius: 2.5,
              color: 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 600,
              transition: 'background-color .15s, color .15s',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                color: '#f44336'
              }
            }}
          >
            <Logout sx={{ fontSize: 20 }} />
            <span>Cerrar sesión</span>
          </Box>
        </Link>
      </Box>
    </Box>
  )

  const isLogin = pathname === '/login'
  const pageTitle = PAGE_TITLES[pathname] ?? '404'

  return (
    <MuiThemeProvider theme={getTheme(safeDark)}>
      <RefreshContext.Provider
        value={{ refreshKeyTransactions, refreshTransactions, refreshKeyCategories, refreshCategories }}
      >
        {isLogin ? (
          children
        ) : (
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
              position="fixed"
              elevation={0}
              sx={{
                display: { xs: 'block', sm: 'block', md: 'none' },
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` },
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)',
                backdropFilter: 'saturate(180%) blur(8px)'
              }}
            >
              <Toolbar sx={{ minHeight: 56, gap: 1 }}>
                <IconButton
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ color: 'var(--text-primary)', display: { md: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ color: 'var(--text-primary)', fontWeight: 700 }}
                >
                  {pageTitle}
                </Typography>
              </Toolbar>
            </AppBar>
            <Box
              component="nav"
              sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
              aria-label="navegación principal"
            >
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onTransitionEnd={handleDrawerTransitionEnd}
                onClose={handleDrawerClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                  display: { xs: 'block', sm: 'block', md: 'none' },
                  '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                    border: 'none'
                  }
                }}
              >
                {drawer}
              </Drawer>
              <Drawer
                variant="permanent"
                sx={{
                  display: { xs: 'none', sm: 'none', md: 'block' },
                  '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth
                  }
                }}
                open
              >
                {drawer}
              </Drawer>
            </Box>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: { xs: 2, md: 3 },
                width: { md: `calc(100% - ${drawerWidth}px)` },
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-primary)',
                minHeight: '100vh'
              }}
            >
              <Toolbar sx={{ display: { xs: 'block', sm: 'block', md: 'none' }, minHeight: 56 }} />
              {children}
            </Box>
            {pathname !== '/transactions' && (
              <Fab
                aria-label="Añadir nueva transacción"
                sx={{
                  position: 'fixed',
                  right: { xs: 16, md: 24 },
                  bottom: { xs: 88, md: 24 }
                }}
                color="primary"
                onClick={() => setAddTransaction(true)}
              >
                <Add />
              </Fab>
            )}
            <MobileBottomNav />
            <TransactionModal open={addTransaction} handleClose={() => setAddTransaction(false)} />
          </Box>
        )}
      </RefreshContext.Provider>
    </MuiThemeProvider>
  )
}
