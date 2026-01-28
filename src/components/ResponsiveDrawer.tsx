'use client'
import { RefreshContext } from '@/contexts/RefreshContext'
import { getTheme } from '@/theme'
import { Add, Calculate, CurrencyExchange, Home, Logout, Settings, DarkMode, LightMode } from '@mui/icons-material'
import MenuIcon from '@mui/icons-material/Menu'
import { Fab, ThemeProvider as MuiThemeProvider, Switch, Box } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import TransactionModal from './modal/TransactionModal'

const drawerWidth = 240

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

  // Set mounted on client side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const navActiveColor = mounted && darkMode ? '#ffffff' : '#000000'
  const navInactiveColor = mounted && darkMode ? '#b0b0b0' : 'gray'
  const navActiveBg = mounted && darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
  const headerColor = mounted && darkMode ? '#ffffff' : '#000000'

  const drawer = (
    <div>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <Image src='/images/file.png' alt='logo' width={30} height={30} /> Mi app de gastos
      </Toolbar>
      <Divider />
      <List>
        <ListItem key="Inicio" disablePadding>
          <ListItemButton
            style={{
              backgroundColor: pathname === '/' ? navActiveBg : 'inherit',
              color: pathname === '/' ? navActiveColor : navInactiveColor
            }}
            href="/"
          >
            <ListItemIcon>
              <Home style={{ color: pathname === '/' ? navActiveColor : navInactiveColor }} />
            </ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItemButton>
        </ListItem>
        <ListItem key="Transacciones" disablePadding>
          <ListItemButton
            style={{
              backgroundColor: pathname === '/transactions' ? navActiveBg : 'inherit',
              color: pathname === '/transactions' ? navActiveColor : navInactiveColor
            }}
            href="/transactions"
          >
            <ListItemIcon>
              <CurrencyExchange style={{ color: pathname === '/transactions' ? navActiveColor : navInactiveColor }} />
            </ListItemIcon>
            <ListItemText primary="Transacciones" />
          </ListItemButton>
        </ListItem>
        <ListItem key="Presupuesto" disablePadding>
          <ListItemButton
            style={{
              backgroundColor: pathname === '/budget' ? navActiveBg : 'inherit',
              color: pathname === '/budget' ? navActiveColor : navInactiveColor
            }}
            href="/budget"
          >
            <ListItemIcon>
              <Calculate style={{ color: pathname === '/budget' ? navActiveColor : navInactiveColor }} />
            </ListItemIcon>
            <ListItemText primary="Presupuesto" />
          </ListItemButton>
        </ListItem>
        <ListItem key="Configuración" disablePadding>
          <ListItemButton
            style={{
              backgroundColor: pathname === '/settings' ? navActiveBg : 'inherit',
              color: pathname === '/settings' ? navActiveColor : navInactiveColor
            }}
            href="/settings"
          >
            <ListItemIcon>
              <Settings style={{ color: pathname === '/settings' ? navActiveColor : navInactiveColor }} />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
          </ListItemButton>
        </ListItem>
        <Divider />
        {/* Dark mode toggle in sidebar */}
        <ListItem key="Modo oscuro" disablePadding>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, gap: 1 }}>
            <ListItemIcon sx={{ minWidth: 'unset', pr: 2 }}>
              {mounted && darkMode ? <DarkMode style={{ color: navInactiveColor }} /> : <LightMode style={{ color: navInactiveColor }} />}
            </ListItemIcon>
            <ListItemText primary="Modo oscuro" />
            <Switch
              checked={mounted ? darkMode : false}
              onChange={(e) => toggleDarkMode(e.target.checked)}
              color="primary"
              size="small"
            />
          </Box>
        </ListItem>
        <Divider />
        <ListItem key="Cerrar sesión" disablePadding>
          <ListItemButton
            style={{
              backgroundColor: 'inherit',
              color: navInactiveColor
            }}
            href="/login"
            onClick={() => {
              localStorage.removeItem('apiKey')
            }}
          >
            <ListItemIcon>
              <Logout style={{ color: navInactiveColor }} />
            </ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  )

  const isLogin = pathname === '/login'

  return (
    <MuiThemeProvider theme={getTheme(mounted ? darkMode : false)}>
      <RefreshContext.Provider
        value={{ refreshKeyTransactions, refreshTransactions, refreshKeyCategories, refreshCategories }}
      >
        {isLogin ? (
          children
        ) : (
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
              color="inherit"
              position="fixed"
              sx={{
                display: { xs: 'block', sm: 'block', md: 'none' },
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` }
              }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { md: 'none' } }}
                >
                  <MenuIcon style={{ color: headerColor }} />
                </IconButton>
                <Typography variant="h6" noWrap component="div" color={headerColor}>
                  {pathname === '/'
                    ? 'Inicio'
                    : pathname === '/transactions'
                      ? 'Transacciones'
                      : pathname === '/budget'
                        ? 'Presupuesto'
                        : pathname === '/settings'
                          ? 'Configuración'
                          : '404'}
                </Typography>
              </Toolbar>
            </AppBar>
            <Box
              component="nav"
              sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
              aria-label="mailbox folders"
            >
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onTransitionEnd={handleDrawerTransitionEnd}
                onClose={handleDrawerClose}
                ModalProps={{
                  keepMounted: true
                }}
                sx={{
                  display: { xs: 'block', sm: 'block', md: 'none' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                }}
              >
                {drawer}
              </Drawer>
              <Drawer
                variant="permanent"
                sx={{
                  display: { xs: 'none', sm: 'none', md: 'block' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                }}
                open
              >
                {drawer}
              </Drawer>
            </Box>
            <Box
              component="main"
              sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)`, backgroundColor: mounted && darkMode ? '#121212' : '#F7F9FB' } }}
            >
              <Toolbar
                sx={{
                  display: { xs: 'block', sm: 'block', md: 'none' }
                }}
              />
              {children}
            </Box>
            {pathname !== '/transactions' && (
              <Fab
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  right: '20px'
                }}
                color="primary"
                onClick={() => setAddTransaction(true)}
              >
                <Add />
              </Fab>
            )}
            <TransactionModal open={addTransaction} handleClose={() => setAddTransaction(false)} />
          </Box>
        )}
      </RefreshContext.Provider>
    </MuiThemeProvider>
  )
}
