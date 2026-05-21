import { createTheme } from '@mui/material/styles';

const marriottTheme = createTheme({
  palette: {
    primary: {
      main: '#C8102E',
      dark: '#9B0B22',
      light: '#E03348',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#B5975A',
      dark: '#8A7040',
      light: '#CEAF78',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#5C5C5C',
    },
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    body1: {
      fontFamily: '"Arial", "Helvetica", sans-serif',
    },
    body2: {
      fontFamily: '"Arial", "Helvetica", sans-serif',
    },
    button: {
      fontFamily: '"Arial", "Helvetica", sans-serif',
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '8px 20px',
          '&:hover': {
            backgroundColor: '#9B0B22',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default marriottTheme;
