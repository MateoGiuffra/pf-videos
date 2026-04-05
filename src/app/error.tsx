'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg-1 dark:bg-dark-bg-1 px-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8 text-center max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Logo */}
        <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-500/30">
          <span className="text-white font-serif font-bold text-3xl">PF</span>
        </div>

        {/* Error icon */}
        <div className="w-20 h-20 rounded-full bg-red-500/10 dark:bg-red-500/20 border-2 border-red-500/20 flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-serif font-black text-brand-ink dark:text-dark-ink">
            Algo salió mal
          </h1>
          <p className="text-brand-ink-soft dark:text-dark-ink-soft font-medium leading-relaxed">
            Ocurrió un error inesperado. Podés intentar recargar la página o volver al inicio.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-brand-ink-soft/50 dark:text-dark-ink-soft/50 mt-1">
              ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 bg-brand-accent text-white rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/30"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-brand-bg-2 dark:bg-dark-bg-2 text-brand-ink-soft dark:text-dark-ink-soft border border-brand-stroke dark:border-dark-stroke rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
