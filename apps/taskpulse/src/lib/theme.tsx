'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

const THEME_KEY = 'theme';
const DARK_CLASS = 'dark';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isHydrated, setIsHydrated] = useState(false);

  const applyTheme = useCallback((t: Theme) => {
    if (typeof document === 'undefined') return;
    if (t === 'dark') {
      document.documentElement.classList.add(DARK_CLASS);
    } else {
      document.documentElement.classList.remove(DARK_CLASS);
    }
    localStorage.setItem(THEME_KEY, t);
    setTheme(t);
  }, []);

  useEffect(() => {
    setIsHydrated(true);
    applyTheme(getInitialTheme());
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    if (typeof document === 'undefined') return;
    const current = document.documentElement.classList.contains(DARK_CLASS) ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }, [applyTheme]);

  if (!isHydrated) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: 'light' as Theme, toggleTheme: () => {} };
  }
  return context;
}
