import { createTheme, Theme } from '@mui/material/styles'

export function getTheme(darkMode: boolean): Theme {
  return createTheme({
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
              default: '#121212',
              paper: '#1e1e1e'
            },
            text: {
              primary: '#ffffff',
              secondary: '#b0b0b0',
              disabled: '#6b6b6b'
            },
            divider: '#333333',
            action: {
              active: '#ffffff',
              hover: 'rgba(255,255,255,0.08)',
              selected: 'rgba(255,255,255,0.12)',
              disabled: 'rgba(255,255,255,0.3)',
              disabledBackground: 'rgba(255,255,255,0.12)'
            }
          }
        : {
            background: {
              default: '#F7F9FB',
              paper: '#FFFFFF'
            },
            text: {
              primary: '#1a1a1a',
              secondary: '#555555',
              disabled: '#999999'
            },
            divider: '#e0e0e0'
          })
    },
    components: {
      MuiTablePagination: {
        styleOverrides: {
          root: { margin: '0 10px 0 5px' },
          actions: { margin: 0 },
          toolbar: { padding: 0 }
        }
      },
      MuiModal: {
        styleOverrides: {
          root: { borderRadius: 4 }
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { backgroundColor: '#257CA3' }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            '&.Mui-selected': { color: '#257CA3' }
          }
        }
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&:hover': { backgroundColor: 'transparent' },
            '&.Mui-selected': { backgroundColor: 'transparent' },
            '&.Mui-focusVisible': { backgroundColor: 'transparent' }
          }
        }
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: darkMode ? '#121212' : '#F7F9FB',
            color: darkMode ? '#ffffff' : '#1a1a1a'
          }
        }
      }
    }
  })
}
