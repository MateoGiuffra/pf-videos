'use client';

import { useTheme } from '@/components/layout/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface ThemeToggleProps {
  /** "panel" = bare icon button intended for grouped header panel; "standalone" = own bg+border. */
  variant?: 'panel' | 'standalone';
}

export function ThemeToggle({ variant = 'panel' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
      className={clsx(
        'relative flex items-center justify-center transition-[color,background-color,border-color,transform] active:scale-90 overflow-hidden',
        variant === 'standalone'
          ? 'w-10 h-10 rounded-xl bg-brand-bg-2/70 dark:bg-dark-bg-2/70 border border-brand-stroke dark:border-dark-stroke text-brand-ink dark:text-dark-ink hover:border-brand-accent/40 dark:hover:border-dark-accent/40'
          : 'w-8 h-8 rounded-full text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:bg-brand-accent-soft dark:hover:bg-dark-accent-soft',
      )}
    >
      <div className="relative w-4 h-4">
        <Sun
          aria-hidden="true"
          className={clsx(
            'absolute inset-0 w-4 h-4 transition-[transform,opacity] duration-500',
            mounted && theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50',
          )}
        />
        <Moon
          aria-hidden="true"
          className={clsx(
            'absolute inset-0 w-4 h-4 transition-[transform,opacity] duration-500',
            mounted && theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50',
          )}
        />
      </div>
    </button>
  );
}
