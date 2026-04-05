'use client';

import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { logoutAction } from '@/app/actions/auth';
import { LogOut, User, HelpCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  username?: string;
  isAdmin?: boolean;
  admin?: string;
}

export function Header({ username, isAdmin, admin }: HeaderProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<'ok' | 'error' | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin }),
      });
      setSyncResult(res.ok ? 'ok' : 'error');
    } catch {
      setSyncResult('error');
    } finally {
      setSyncing(false);
      // Reset badge after 3 s
      setTimeout(() => setSyncResult(null), 3000);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-brand-bg-1/80 dark:bg-dark-bg-1/80 border-b border-brand-stroke dark:border-dark-stroke shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-white font-serif font-bold text-xl">PF</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-serif text-xl font-bold text-brand-ink dark:text-dark-ink">Videos PF</h1>
            <p className="text-[10px] uppercase tracking-widest text-brand-ink-soft dark:text-dark-ink-soft font-bold">Repositorio de Clases</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {username && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-brand-bg-2 dark:bg-dark-bg-2 rounded-full border border-brand-stroke dark:border-dark-stroke">
              <User className="w-4 h-4 text-brand-accent" />
              <span className="text-sm font-medium text-brand-ink dark:text-dark-ink">{username}</span>
            </div>
          )}

          {/* Admin sync button — only visible to admin */}
          {isAdmin && (
            <button
              onClick={handleSync}
              disabled={syncing}
              title="Actualizar material de Drive"
              className={[
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm',
                syncing
                  ? 'bg-brand-accent/10 dark:bg-dark-accent/10 text-brand-accent border-brand-accent/30 cursor-wait'
                  : syncResult === 'ok'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : syncResult === 'error'
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                  : 'bg-brand-bg-2 dark:bg-dark-bg-2 text-brand-ink-soft dark:text-dark-ink-soft border-brand-stroke dark:border-dark-stroke hover:text-brand-accent hover:border-brand-accent/40 hover:shadow-md',
              ].join(' ')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {syncing ? 'Sincronizando…' : syncResult === 'ok' ? '¡Listo!' : syncResult === 'error' ? 'Error' : 'Actualizar'}
              </span>
            </button>
          )}

          <Link
            href="/info"
            className="p-2.5 rounded-xl text-brand-ink-soft dark:text-dark-ink-soft hover:bg-brand-bg-2 dark:hover:bg-dark-bg-2 border border-transparent hover:border-brand-stroke dark:hover:border-dark-stroke transition-all"
            title="Información"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>

          <ThemeToggle />

          <button
            onClick={() => logoutAction()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-brand-ink-soft dark:text-dark-ink-soft hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
