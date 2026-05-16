'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4">
      <div className="relative flex flex-col items-center text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-danger/20 blur-2xl rounded-full" />
          <div className="relative w-14 h-14 rounded-2xl bg-brand-danger-soft dark:bg-dark-danger-soft border border-brand-danger/20 dark:border-dark-danger/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-brand-danger dark:text-dark-danger" strokeWidth={2.2} />
          </div>
        </div>

        <h1 className="mt-7 font-serif text-3xl sm:text-4xl font-black text-brand-ink dark:text-dark-ink tracking-tight">
          Algo salió mal
        </h1>
        <p className="mt-3 text-brand-ink-soft dark:text-dark-ink-soft leading-relaxed">
          Ocurrió un error inesperado. Probá recargar la página o volver al inicio.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-ink-faint dark:text-dark-ink-faint">
            ID · {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent dark:bg-dark-accent text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-accent/25 dark:shadow-dark-accent/25 active:scale-95 transition-all"
          >
            <RotateCw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-bg-2 dark:bg-dark-bg-2 text-brand-ink dark:text-dark-ink border border-brand-stroke dark:border-dark-stroke rounded-xl font-semibold text-sm active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
