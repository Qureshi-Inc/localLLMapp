'use client';

import { useEffect } from 'react';
import { getTheme, setTheme } from '@/lib/theme';

export function ThemeInitializer() {
  useEffect(() => {
    const theme = getTheme();
    setTheme(theme);
  }, []);
  return null;
}
