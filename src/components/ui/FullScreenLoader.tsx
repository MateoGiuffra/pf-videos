'use client';

import { Loader2 } from 'lucide-react';

interface FullScreenLoaderProps {
  title: string;
  subtitle?: string;
}

export function FullScreenLoader({ title, subtitle }: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title}
      className="fixed inset-0 z-300 flex flex-col items-center justify-center bg-brand-bg-1/85 dark:bg-dark-bg-1/85 backdrop-blur-xl animate-overlay-in"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-brand-accent/40 dark:bg-dark-accent/40 blur-3xl rounded-full animate-pulse" aria-hidden="true" />
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-brand-accent dark:bg-dark-accent flex items-center justify-center shadow-2xl shadow-brand-accent/40 dark:shadow-dark-accent/40">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 px-6 text-center">
        <p className="font-serif font-black text-2xl sm:text-3xl text-brand-ink dark:text-dark-ink tracking-tight">
          {title}
        </p>
        {subtitle && (
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brand-ink-soft dark:text-dark-ink-soft">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-10 w-48 h-px bg-brand-stroke dark:bg-dark-stroke rounded-full overflow-hidden" aria-hidden="true">
        <div className="h-full w-1/2 bg-linear-to-r from-transparent via-brand-accent dark:via-dark-accent to-transparent animate-scan" />
      </div>
    </div>
  );
}
