'use client';

// MUI imports
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useState, useContext, createContext, useEffect } from 'react';
import { createThemeFromConfig } from './ThemeRegistry';
import { createTheme } from '@mui/material/styles';

// Define the context type for our theme
interface ThemeModeContextProps {
  mode: 'light' | 'dark';
  toggleMode: () => void;
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
}

// Create the context with undefined as default
const ThemeModeContext = createContext<ThemeModeContextProps | undefined>(undefined);

/**
 * Custom hook to access the theme mode context
 * Throws an error if used outside of ThemeModeProvider
 */
export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}

/**
 * Material UI theme provider with light/dark mode support
 * Handles theme persistence in localStorage and provides context to the app
 */
export default function MaterialThemeProvider({ children }: { children: React.ReactNode }) {
  // State for theme mode - default to light mode
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  
  // State for the current theme - default to 'modernize'
  const [currentTheme, setCurrentTheme] = useState('modernize');
  
  // State for the actual MUI theme object
  const [theme, setTheme] = useState(() => {
    // Create a basic fallback theme for SSR
    return createTheme({
      palette: { mode: 'light', primary: { main: '#0061EB' } },
      cssVariables: true,
    });
  });

  // On mount, sync with localStorage (SSR-safe)
  // This ensures we respect user preferences between sessions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
      const storedTheme = localStorage.getItem('currentTheme') || 'modernize';

      // Update state if we have stored values that differ from defaults
      if (storedMode && storedMode !== mode) setMode(storedMode);
      if (storedTheme !== currentTheme) setCurrentTheme(storedTheme);
    }
    // We only want this to run once on mount, so we disable the exhaustive-deps rule
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When theme or mode changes, create a new theme object
  useEffect(() => {
    try {
      const newTheme = createThemeFromConfig(currentTheme, mode, { cssVariables: true });
      setTheme(newTheme);
    } catch (error) {
      console.warn('Failed to load theme:', error);
      // Keep using the current theme as fallback
    }
  }, [currentTheme, mode]);

  // Toggle between light and dark mode
  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Update the current theme
  const handleSetCurrentTheme = (theme: string) => {
    setCurrentTheme(theme);
  };

  // Save theme preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', mode);
      localStorage.setItem('currentTheme', currentTheme);
    }
  }, [mode, currentTheme]);

  return (
    <ThemeModeContext.Provider
      value={{
        mode,
        toggleMode,
        currentTheme,
        setCurrentTheme: handleSetCurrentTheme,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}