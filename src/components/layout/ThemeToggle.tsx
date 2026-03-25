'use client';

import { useTheme } from '@/components/layout/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-brand-bg-2 dark:bg-dark-bg-2 border border-transparent hover:border-brand-stroke dark:hover:border-dark-stroke hover:scale-110 active:scale-95 transition-all shadow-sm"
      aria-label="Alternar tema"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-brand-ink-soft dark:text-dark-ink-soft" />
      ) : (
        <Sun className="w-5 h-5 text-brand-ink-soft dark:text-dark-ink-soft" />
      )}
    </button>
  );
}
