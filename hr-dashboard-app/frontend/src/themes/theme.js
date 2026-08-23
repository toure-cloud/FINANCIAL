import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2F6F5E',
      light: '#4A8F7E',
      dark: '#1F4F42',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C08A3E',
      light: '#D4A85C',
      dark: '#A0722E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F6F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#16233D',
      secondary: '#5B6577',
    },
    error: {
      main: '#B4483C',
    },
    success: {
      main: '#2F6F5E',
    },
    warning: {
      main: '#C08A3E',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(22, 35, 61, 0.08)',
          borderRadius: 16,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(22, 35, 61, 0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(47, 111, 94, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(22, 35, 61, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          padding: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E4E7ED',
        },
        head: {
          fontWeight: 700,
          color: '#5B6577',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
        },
      },
    },
  },
});
