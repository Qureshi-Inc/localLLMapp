const THEME_KEY = 'taskpulse_theme';

export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function toggleTheme(current: Theme): Theme {
  return current === 'light' ? 'dark' : 'light';
}
