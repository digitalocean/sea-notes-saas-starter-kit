import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AnimatedThemeToggle } from './AnimatedThemeToggle';

describe('AnimatedThemeToggle', () => {
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      background: { default: '#ffffff' },
    },
  });

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <AnimatedThemeToggle />
      </ThemeProvider>
    );

    // Just check that the component renders without errors
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
  });
});