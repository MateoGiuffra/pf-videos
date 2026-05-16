'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';

type ToastVariant = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  loading: (title: string, description?: string) => string;
  update: (id: string, t: Partial<Omit<Toast, 'id'>>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

let idCounter = 0;
const nextId = () => `t-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t) { clearTimeout(t); timersRef.current.delete(id); }
  }, []);

  const dismiss = useCallback((id: string) => {
    clearTimer(id);
    setExiting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 240);
  }, [clearTimer]);

  const scheduleDismiss = useCallback((id: string, duration: number) => {
    clearTimer(id);
    if (duration === Infinity || duration <= 0) return;
    const handle = setTimeout(() => dismiss(id), duration);
    timersRef.current.set(id, handle);
  }, [clearTimer, dismiss]);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = nextId();
    const full: Toast = {
      id,
      variant: t.variant,
      title: t.title,
      description: t.description,
      duration: t.duration ?? (t.variant === 'loading' ? Infinity : 4000),
    };
    setToasts((prev) => [...prev, full].slice(-5));
    scheduleDismiss(id, full.duration!);
    return id;
  }, [scheduleDismiss]);

  const update = useCallback((id: string, patch: Partial<Omit<Toast, 'id'>>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    if (patch.duration !== undefined || patch.variant) {
      const current = toasts.find((t) => t.id === id);
      const nextDuration = patch.duration ?? (patch.variant === 'loading' ? Infinity : current?.duration ?? 4000);
      scheduleDismiss(id, nextDuration);
    }
  }, [scheduleDismiss, toasts]);

  const success = useCallback((title: string, description?: string) =>
    toast({ variant: 'success', title, description }), [toast]);
  const error = useCallback((title: string, description?: string) =>
    toast({ variant: 'error', title, description }), [toast]);
  const info = useCallback((title: string, description?: string) =>
    toast({ variant: 'info', title, description }), [toast]);
  const loading = useCallback((title: string, description?: string) =>
    toast({ variant: 'loading', title, description }), [toast]);

  useEffect(() => () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, loading, update, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} exiting={exiting} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  exiting,
  onDismiss,
}: {
  toasts: Toast[];
  exiting: Set<string>;
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 top-0 z-200 flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:right-4 sm:top-4 sm:items-end sm:px-0"
      style={{ paddingTop: 'max(0.75rem, var(--safe-top))' }}
    >
      {toasts.map((t) => (
        <ToastCard
          key={t.id}
          toast={t}
          exiting={exiting.has(t.id)}
          onDismiss={() => onDismiss(t.id)}
        />
      ))}
    </div>
  );
}

const variantStyles: Record<ToastVariant, { icon: React.ElementType; ring: string; iconWrap: string }> = {
  success: {
    icon: CheckCircle2,
    ring: 'before:bg-brand-accent dark:before:bg-dark-accent',
    iconWrap: 'text-brand-accent dark:text-dark-accent',
  },
  error: {
    icon: AlertCircle,
    ring: 'before:bg-brand-danger dark:before:bg-dark-danger',
    iconWrap: 'text-brand-danger dark:text-dark-danger',
  },
  info: {
    icon: Info,
    ring: 'before:bg-brand-ink/40 dark:before:bg-dark-ink/40',
    iconWrap: 'text-brand-ink-soft dark:text-dark-ink-soft',
  },
  loading: {
    icon: Loader2,
    ring: 'before:bg-brand-accent dark:before:bg-dark-accent',
    iconWrap: 'text-brand-accent dark:text-dark-accent',
  },
};

function ToastCard({
  toast,
  exiting,
  onDismiss,
}: {
  toast: Toast;
  exiting: boolean;
  onDismiss: () => void;
}) {
  const { icon: Icon, ring, iconWrap } = variantStyles[toast.variant];
  const isLoading = toast.variant === 'loading';

  return (
    <div
      role="status"
      className={clsx(
        'pointer-events-auto group relative w-full max-w-[420px] sm:min-w-[340px]',
        'overflow-hidden rounded-2xl border bg-brand-bg-2/95 dark:bg-dark-bg-2/95 backdrop-blur-xl',
        'border-brand-stroke dark:border-dark-stroke',
        'shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]',
        'before:absolute before:left-0 before:top-0 before:h-full before:w-[3px]',
        ring,
        exiting ? 'animate-toast-out' : 'animate-toast-in',
      )}
    >
      <div className="flex items-start gap-3 p-3.5 sm:p-4">
        <div className={clsx('mt-0.5 shrink-0', iconWrap)} aria-hidden="true">
          <Icon className={clsx('w-5 h-5', isLoading && 'animate-spin')} />
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <p className="text-sm font-semibold text-brand-ink dark:text-dark-ink leading-snug">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-brand-ink-soft dark:text-dark-ink-soft leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>
        {!isLoading && (
          <button
            onClick={onDismiss}
            aria-label="Cerrar notificación"
            className="shrink-0 w-11 h-11 -m-2 sm:w-9 sm:h-9 sm:-m-1.5 flex items-center justify-center rounded-lg text-brand-ink-faint dark:text-dark-ink-faint hover:text-brand-ink dark:hover:text-dark-ink hover:bg-brand-stroke/50 dark:hover:bg-dark-stroke/50 transition-colors active:scale-90"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
