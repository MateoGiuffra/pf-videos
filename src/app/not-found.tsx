import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4">
      <div className="relative flex flex-col items-center text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="font-serif text-[7rem] sm:text-[9rem] font-black leading-none tracking-tighter text-brand-ink dark:text-dark-ink relative">
          404
          <span className="absolute inset-0 text-transparent bg-clip-text bg-linear-to-br from-brand-accent dark:from-dark-accent to-brand-accent-hover dark:to-dark-accent-hover opacity-30 blur-sm select-none">
            404
          </span>
        </div>

        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-brand-accent dark:text-dark-accent">
          Página no encontrada
        </p>

        <p className="mt-5 text-brand-ink-soft dark:text-dark-ink-soft leading-relaxed">
          La página que buscás no existe o fue movida.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent dark:bg-dark-accent text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-accent/25 dark:shadow-dark-accent/25 active:scale-95 transition-all group"
        >
          Volver al inicio
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
