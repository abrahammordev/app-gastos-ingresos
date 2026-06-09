import { createTheme, Theme } from '@mui/material/styles'

export function getTheme(darkMode: boolean): Theme {
  return createTheme({
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
      h5: { fontWeight: 700, letterSpacing: -0.2 },
      h6: { fontWeight: 700, letterSpacing: -0.1 }
    },
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#257CA3',
        light: '#4A9ABE',
        dark: '#1B5E7A',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#3f51b5'
      },
      error: {
        main: '#f44336'
      },
      success: {
        main: '#00C49F'
      },
      ...(darkMode
        ? {
            background: {
              default: '#0f0f10',
              paper: '#1a1a1c'
            },
            text: {
              primary: '#f5f5f5',
              secondary: '#a8a8a8',
              disabled: '#6b6b6b'
            },
            divider: 'rgba(255,255,255,0.08)',
            action: {
              active: '#ffffff',
              hover: 'rgba(255,255,255,0.06)',
              selected: 'rgba(255,255,255,0.10)',
              disabled: 'rgba(255,255,255,0.3)',
              disabledBackground: 'rgba(255,255,255,0.08)'
            }
          }
        : {
            background: {
              default: '#F7F9FB',
              paper: '#FFFFFF'
            },
            text: {
              primary: '#0f172a',
              secondary: '#64748b',
              disabled: '#94a3b8'
            },
            divider: 'rgba(15,23,42,0.08)'
          })
    },
    components: {
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' }
        }
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 }
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingInline: 16,
            paddingBlock: 8,
            fontWeight: 600
          },
          containedPrimary: {
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 4px 12px rgba(37, 124, 163, 0.25)' }
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 10 }
        }
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: '0 6px 18px rgba(37, 124, 163, 0.35)',
            '&:hover': { boxShadow: '0 10px 28px rgba(37, 124, 163, 0.45)' }
          }
        }
      },
      MuiTablePagination: {
        styleOverrides: {
          root: { margin: '0 10px 0 5px' },
          actions: { margin: 0 },
          toolbar: { padding: 0 }
        }
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 40 },
          indicator: {
            backgroundColor: '#257CA3',
            height: 3,
            borderRadius: '3px 3px 0 0'
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 40,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 14,
            '&.Mui-selected': { color: '#257CA3' }
          }
        }
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 6px',
            '&:hover': { backgroundColor: 'rgba(37,124,163,0.08)' },
            '&.Mui-selected': { backgroundColor: 'rgba(37,124,163,0.12)' },
            '&.Mui-focusVisible': { backgroundColor: 'rgba(37,124,163,0.10)' }
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.06)',
            backgroundImage: 'none'
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10
          }
        }
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: darkMode ? '#0f0f10' : '#F7F9FB',
            color: darkMode ? '#f5f5f5' : '#0f172a'
          }
        }
      }
    }
  })
}
