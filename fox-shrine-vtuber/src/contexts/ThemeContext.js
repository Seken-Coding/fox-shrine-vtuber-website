import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const savedTheme = localStorage.getItem('foxshrine_theme');
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
    } catch (error) {
      console.warn('Unable to read theme from localStorage:', error);
    }

    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    return false;
  });

  // Apply theme class to document root
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem('foxshrine_theme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.warn('Unable to persist theme to localStorage:', error);
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if no saved preference exists
      const savedTheme = localStorage.getItem('foxshrine_theme');
      if (savedTheme === null) {
        setIsDarkMode(e.matches);
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prevMode) => !prevMode);
  }, []);

  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  }), [isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
