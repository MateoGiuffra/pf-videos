'use client';

import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { logoutAction } from '@/app/actions/auth';
import { LogOut, User, HelpCircle, RefreshCw, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useGlobalOverlay } from '@/components/ui/GlobalOverlay';
import { useMaterials } from '@/components/material/MaterialsProvider';
import { clsx } from 'clsx';

interface HeaderProps {
  username?: string;
  isAdmin?: boolean;
}

export function Header({ username, isAdmin }: HeaderProps) {
  const [syncing, setSyncing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { loading, update } = useToast();
  const overlay = useGlobalOverlay();
  const { refresh: refreshMaterials } = useMaterials();

  // Lock body scroll while drawer open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpen]);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    const toastId = loading('Sincronizando material', 'Buscando archivos en Drive…');
    try {
      const res = await fetch('/api/admin/resources', { method: 'POST' });
      if (res.ok) {
        await refreshMaterials();
        update(toastId, {
          variant: 'success',
          title: 'Material actualizado',
          description: 'El repositorio se sincronizó con Drive.',
          duration: 4000,
        });
      } else {
        update(toastId, {
          variant: 'error',
          title: 'No se pudo sincronizar',
          description: `Servidor respondió ${res.status}.`,
          duration: 5000,
        });
      }
    } catch {
      update(toastId, {
        variant: 'error',
        title: 'Error de red',
        description: 'No alcanzamos el servidor.',
        duration: 5000,
      });
    } finally {
      setSyncing(false);
    }
  }

  function requestLogout() {
    setMenuOpen(false);
    setConfirmLogout(true);
  }

  async function performLogout() {
    setLoggingOut(true);
    // Show overlay at the Providers level so it survives navigation
    // (otherwise loading.tsx briefly flashes "Cargando repositorio")
    overlay.show({ title: 'Cerrando sesión', subtitle: 'Hasta la próxima…' });
    setConfirmLogout(false);
    try {
      await logoutAction();
      // redirect() throws → component unmounts before reaching here
    } catch {
      // redirect() throws by design — swallow
    }
  }

  const initial = username?.trim().charAt(0).toUpperCase() ?? '·';

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-brand-bg-1/80 dark:bg-dark-bg-1/80 border-b border-brand-stroke dark:border-dark-stroke">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group min-w-0" aria-label="Videos PF — Inicio">
            <div className="relative w-9 h-9 bg-brand-accent dark:bg-dark-accent rounded-xl flex items-center justify-center shadow-md shadow-brand-accent/25 dark:shadow-dark-accent/25 group-active:scale-95 transition-transform shrink-0">
              <span className="text-white font-serif font-black text-base leading-none">PF</span>
            </div>
            <div className="hidden sm:flex flex-col leading-tight min-w-0">
              <span className="font-serif text-[17px] font-black text-brand-ink dark:text-dark-ink tracking-tight truncate">
                Videos PF
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-brand-ink-soft dark:text-dark-ink-soft truncate">
                Repositorio de Clases
              </span>
            </div>
          </Link>

          {/* Desktop actions — unified panel */}
          <div className="hidden md:flex items-center gap-2 h-10">
            {username && (
              <div className="flex items-center h-full gap-2.5 pl-1.5 pr-3.5 rounded-full bg-brand-bg-2/80 dark:bg-dark-bg-2/70 border border-brand-stroke dark:border-dark-stroke">
                <div
                  className="w-7 h-7 rounded-full bg-brand-accent dark:bg-dark-accent text-white flex items-center justify-center shrink-0 shadow-sm shadow-brand-accent/20 dark:shadow-dark-accent/20"
                  aria-hidden="true"
                >
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">{initial}</span>
                </div>
                <span className="font-mono text-xs font-medium text-brand-ink dark:text-dark-ink leading-none">
                  {username}
                </span>
                {isAdmin && (
                  <span
                    className="hidden lg:inline-flex font-mono text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md bg-brand-accent-soft dark:bg-dark-accent-soft text-brand-accent dark:text-dark-accent leading-none"
                    aria-label="Administrador"
                  >
                    Admin
                  </span>
                )}
              </div>
            )}

            <div className="h-6 w-px bg-brand-stroke dark:bg-dark-stroke" aria-hidden="true" />

            <div className="flex items-center h-full gap-1 p-1 rounded-full bg-brand-bg-2/60 dark:bg-dark-bg-2/50 border border-brand-stroke dark:border-dark-stroke">
              {isAdmin && (
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  aria-label={syncing ? 'Sincronizando…' : 'Sincronizar material de Drive'}
                  title="Sincronizar material de Drive"
                  className={clsx(
                    'flex items-center gap-1.5 px-2.5 h-8 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider transition-[color,background-color]',
                    syncing
                      ? 'bg-brand-accent-soft dark:bg-dark-accent-soft text-brand-accent dark:text-dark-accent cursor-wait'
                      : 'text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:bg-brand-accent-soft dark:hover:bg-dark-accent-soft',
                  )}
                >
                  <RefreshCw className={clsx('w-3.5 h-3.5', syncing && 'animate-spin')} aria-hidden="true" />
                  <span>{syncing ? 'Sync…' : 'Sync'}</span>
                </button>
              )}

              <Link
                href="/info"
                aria-label="Información"
                className="w-8 h-8 flex items-center justify-center rounded-full text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:bg-brand-accent-soft dark:hover:bg-dark-accent-soft transition-[color,background-color]"
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
              </Link>

              <ThemeToggle />
            </div>

            <button
              onClick={requestLogout}
              aria-label="Cerrar sesión"
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-danger dark:hover:text-dark-danger hover:bg-brand-danger-soft dark:hover:bg-dark-danger-soft border border-brand-stroke dark:border-dark-stroke hover:border-brand-danger/30 dark:hover:border-dark-danger/30 active:scale-95 transition-[transform,color,background-color,border-color]"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Salir</span>
            </button>
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-1.5 h-10">
            {username && (
              <div
                className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-accent dark:bg-dark-accent text-white shadow-sm shadow-brand-accent/20 dark:shadow-dark-accent/20"
                aria-label={`Sesión de ${username}`}
              >
                <span className="font-mono text-xs font-bold uppercase tracking-wider">{initial}</span>
              </div>
            )}
            <ThemeToggle variant="standalone" />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-bg-2/70 dark:bg-dark-bg-2/70 border border-brand-stroke dark:border-dark-stroke text-brand-ink dark:text-dark-ink active:scale-95 transition-transform"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <MobileDrawer
          username={username}
          isAdmin={isAdmin}
          syncing={syncing}
          onClose={() => setMenuOpen(false)}
          onSync={async () => { await handleSync(); setMenuOpen(false); }}
          onLogout={requestLogout}
        />
      )}

      {/* Logout confirmation */}
      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={performLogout}
        title="¿Cerrar sesión?"
        description={username ? `Tu sesión como ${username} se cerrará y volverás al inicio de sesión.` : 'Se cerrará tu sesión y volverás al inicio de sesión.'}
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Cancelar"
        variant="destructive"
        icon={LogOut}
        busy={loggingOut}
      />

    </>
  );
}

function MobileDrawer({
  username, isAdmin, syncing, onClose, onSync, onLogout,
}: {
  username?: string; isAdmin?: boolean; syncing: boolean;
  onClose: () => void; onSync: () => void; onLogout: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menú de usuario"
      className="fixed inset-0 z-100 md:hidden"
      style={{ overscrollBehavior: 'contain' }}
    >
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className="absolute inset-0 bg-brand-ink/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
      />
      <div className="absolute inset-x-0 bottom-0 animate-sheet-in pb-safe">
        <div className="mx-2 mb-2 bg-brand-bg-2 dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-3xl overflow-hidden shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.8)]">
          <div className="flex justify-center pt-2.5 pb-1" aria-hidden="true">
            <div className="w-10 h-1 bg-brand-ink-faint/40 dark:bg-dark-ink-faint/40 rounded-full" />
          </div>

          {username && (
            <div className="px-5 py-3 flex items-center justify-between border-b border-brand-stroke dark:border-dark-stroke">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-brand-accent-soft dark:bg-dark-accent-soft flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-brand-accent dark:text-dark-accent" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-brand-ink-soft dark:text-dark-ink-soft">Sesión activa</p>
                  <p className="font-mono text-sm font-semibold text-brand-ink dark:text-dark-ink truncate">{username}</p>
                </div>
              </div>
              <button onClick={onClose} aria-label="Cerrar menú" className="w-11 h-11 flex items-center justify-center rounded-xl text-brand-ink-soft dark:text-dark-ink-soft active:scale-90 transition-transform">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}

          <nav className="p-3 space-y-1">
            {isAdmin && (
              <DrawerItem
                as="button"
                icon={RefreshCw}
                label={syncing ? 'Sincronizando…' : 'Sincronizar material'}
                hint="Trae los últimos archivos de Drive"
                disabled={syncing}
                spinning={syncing}
                onClick={onSync}
              />
            )}
            <DrawerItem
              as="link"
              href="/info"
              icon={HelpCircle}
              label="Información"
              hint="Cómo funciona la app"
              onClick={onClose}
            />
            <DrawerItem
              as="button"
              icon={LogOut}
              label="Cerrar sesión"
              hint="Te llevamos al login"
              destructive
              onClick={onLogout}
            />
          </nav>
        </div>
      </div>
    </div>
  );
}

type DrawerItemProps = {
  icon: React.ElementType;
  label: string;
  hint?: string;
  onClick?: () => void;
  disabled?: boolean;
  spinning?: boolean;
  destructive?: boolean;
} & (
  | { as: 'button'; href?: never }
  | { as: 'link'; href: string }
);

function DrawerItem(props: DrawerItemProps) {
  const { icon: Icon, label, hint, onClick, disabled, spinning, destructive } = props;
  const className = clsx(
    'w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-[transform,background-color,color] active:scale-[0.98]',
    destructive
      ? 'hover:bg-brand-danger-soft dark:hover:bg-dark-danger-soft text-brand-danger dark:text-dark-danger'
      : 'hover:bg-brand-bg-1 dark:hover:bg-dark-bg-1 text-brand-ink dark:text-dark-ink',
  );

  const inner = (
    <>
      <div className={clsx(
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
        destructive
          ? 'bg-brand-danger-soft dark:bg-dark-danger-soft border-brand-danger/15 dark:border-dark-danger/15'
          : 'bg-brand-accent-soft dark:bg-dark-accent-soft border-brand-accent/15 dark:border-dark-accent/15',
      )}>
        <Icon
          aria-hidden="true"
          className={clsx(
            'w-[18px] h-[18px]',
            destructive ? 'text-brand-danger dark:text-dark-danger' : 'text-brand-accent dark:text-dark-accent',
            spinning && 'animate-spin',
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{label}</p>
        {hint && <p className="text-xs text-brand-ink-soft dark:text-dark-ink-soft mt-0.5">{hint}</p>}
      </div>
    </>
  );

  if (props.as === 'link') {
    return (
      <Link href={props.href} onClick={onClick} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {inner}
    </button>
  );
}
