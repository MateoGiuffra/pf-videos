'use client';

import { useEffect, useState, useTransition } from 'react';
import { loginAction } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useToast } from '@/components/ui/Toast';
import { useGlobalOverlay } from '@/components/ui/GlobalOverlay';
import { Loader2, Info, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const { error: toastError } = useToast();
  const overlay = useGlobalOverlay();

  // If we arrived here from a logout flow, dismiss any leftover overlay.
  useEffect(() => { overlay.hide(); }, [overlay]);

  function onSubmit(formData: FormData) {
    const username = (formData.get('username') as string | null)?.trim() ?? '';
    const password = (formData.get('password') as string | null) ?? '';

    if (!username && !password) {
      toastError('Faltan tus datos', 'Ingresá usuario y contraseña.');
      return;
    }
    if (!username) {
      toastError('Falta el usuario', 'Ingresá tu usuario de Aulas CPI.');
      return;
    }
    if (!password) {
      toastError('Falta la contraseña', 'Ingresá la contraseña de tu cuenta.');
      return;
    }

    overlay.show({ title: 'Verificando credenciales', subtitle: 'Conectando con Aulas CPI…' });

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        overlay.hide();
        toastError('No pudimos iniciar sesión', result.error);
      }
      // On success, redirect() throws → overlay stays until home mounts and dismisses it
    });
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-8 sm:py-12 relative">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle variant="standalone" />
      </div>

      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Brand */}
        <div className="flex flex-col items-center mb-7 sm:mb-9">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-accent/30 dark:bg-dark-accent/30 blur-2xl rounded-full" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-brand-accent dark:bg-dark-accent rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/30 dark:shadow-dark-accent/30">
              <span className="font-serif font-black text-white text-2xl sm:text-3xl tracking-tight">PF</span>
            </div>
          </div>
          <h1 className="mt-5 font-serif text-3xl sm:text-4xl font-black text-brand-ink dark:text-dark-ink tracking-tight">
            Videos PF
          </h1>
          <p className="mt-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-ink-soft dark:text-dark-ink-soft">
            Repositorio de Clases
          </p>
        </div>

        {/* Card */}
        <div className="relative bg-brand-bg-2/95 dark:bg-dark-bg-2/85 border border-brand-stroke dark:border-dark-stroke rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
          {/* Info banner */}
          <div className="flex gap-3 p-3.5 bg-brand-accent-soft dark:bg-dark-accent-soft border border-brand-accent/15 dark:border-dark-accent/15 rounded-xl mb-6">
            <Info className="w-4 h-4 text-brand-accent dark:text-dark-accent shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-brand-ink-soft dark:text-dark-ink-soft">
              Usá tus credenciales de <strong className="text-brand-ink dark:text-dark-ink font-semibold">Aulas CPI</strong>. Nada queda guardado en nuestros servidores.
            </p>
          </div>

          <form action={onSubmit} noValidate className="space-y-4">
            <Field
              id="username"
              name="username"
              label="Usuario"
              placeholder="Tu usuario de Aulas CPI"
              autoComplete="username"
              disabled={isPending}
            />

            <div className="space-y-1.5">
              <label htmlFor="password" className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-ink-soft dark:text-dark-ink-soft">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  disabled={isPending}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  className="w-full bg-brand-bg-1/60 dark:bg-dark-bg-1/60 border border-brand-stroke dark:border-dark-stroke rounded-xl py-3 pl-3.5 pr-11 text-[15px] text-brand-ink dark:text-dark-ink placeholder:text-brand-ink-faint dark:placeholder:text-dark-ink-faint focus:outline-none focus:bg-brand-bg-2 dark:focus:bg-dark-bg-2 focus:border-brand-accent dark:focus:border-dark-accent focus:ring-4 focus:ring-brand-accent-ring dark:focus:ring-dark-accent-ring transition-[background-color,border-color,box-shadow,opacity] disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-brand-ink-faint dark:text-dark-ink-faint hover:text-brand-ink dark:hover:text-dark-ink hover:bg-brand-stroke/50 dark:hover:bg-dark-stroke/50 active:scale-90 transition-[transform,colors] disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="group relative w-full overflow-hidden bg-brand-accent dark:bg-dark-accent text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-accent/25 dark:shadow-dark-accent/25 active:scale-[0.98] transition-[transform,box-shadow,opacity,background-color] flex items-center justify-center gap-2 disabled:cursor-wait disabled:bg-brand-accent-hover dark:disabled:bg-dark-accent-hover disabled:active:scale-100"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Autenticando…</span>
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </>
              )}
              <span aria-hidden="true" className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-brand-ink-soft dark:text-dark-ink-soft">
          Esta página complementa a Aulas CPI, no lo reemplaza.
        </p>
      </div>

    </div>
  );
}

function Field({
  id, name, label, placeholder, autoComplete, disabled,
}: { id: string; name: string; label: string; placeholder: string; autoComplete?: string; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-ink-soft dark:text-dark-ink-soft">
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={name}
        disabled={disabled}
        autoComplete={autoComplete}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder={placeholder}
        className="w-full bg-brand-bg-1/60 dark:bg-dark-bg-1/60 border border-brand-stroke dark:border-dark-stroke rounded-xl py-3 px-3.5 text-[15px] text-brand-ink dark:text-dark-ink placeholder:text-brand-ink-faint dark:placeholder:text-dark-ink-faint focus:outline-none focus:bg-brand-bg-2 dark:focus:bg-dark-bg-2 focus:border-brand-accent dark:focus:border-dark-accent focus:ring-4 focus:ring-brand-accent-ring dark:focus:ring-dark-accent-ring transition-[background-color,border-color,box-shadow,opacity] disabled:opacity-60"
      />
    </div>
  );
}

