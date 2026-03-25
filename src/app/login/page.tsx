'use client';

import { useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Loader2, Info } from 'lucide-react';

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    
    const result = await loginAction(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ThemeToggle />
      
      <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-5 duration-500">
        <div className="bg-brand-card dark:bg-dark-card border border-brand-stroke dark:border-dark-stroke rounded-2xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Animated Background Shapes Inside Card */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />

          <header className="text-center mb-7 relative">
            <h1 className="font-serif text-3xl md:text-4xl text-brand-ink dark:text-dark-ink tracking-tight mb-2">
              Videos PF
            </h1>
            <p className="text-brand-ink-soft dark:text-dark-ink-soft text-sm">
              Repositorio de clases - Autenticación requerida
            </p>
          </header>

          <div className="bg-brand-accent-soft border-l-4 border-brand-accent p-4 rounded-lg mb-6 text-sm flex gap-3">
            <Info className="w-5 h-5 text-brand-accent shrink-0" />
            <p className="text-brand-ink-soft dark:text-dark-ink-soft leading-relaxed">
              Usa tus credenciales de <strong>Aulas CPI</strong> para acceder al repositorio. No guardamos tu información.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border-l-4 border-red-500 text-red-600 dark:text-red-400 text-sm rounded animate-in fade-in">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-brand-ink dark:text-dark-ink">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                placeholder="Tu usuario de Aulas CPI"
                className="w-full bg-white dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-xl p-3 text-sm text-brand-ink dark:text-dark-ink placeholder:text-brand-ink-soft/40 dark:placeholder:text-dark-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-dark-accent transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-brand-ink dark:text-dark-ink">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Tu contraseña de Aulas CPI"
                className="w-full bg-white dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-xl p-3 text-sm text-brand-ink dark:text-dark-ink placeholder:text-brand-ink-soft/40 dark:placeholder:text-dark-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-dark-accent transition-all shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand-accent hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <footer className="text-center mt-6 text-xs text-brand-ink-soft dark:text-dark-ink-soft space-y-2">
            <p>Esta página complementa a Aulas CPI, no lo reemplaza.</p>
            <p>
              <a href="/info" className="text-brand-accent hover:underline font-bold">
                ¿Más información?
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
