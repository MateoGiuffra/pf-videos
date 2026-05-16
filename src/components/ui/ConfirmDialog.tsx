'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'accent';
  icon?: React.ElementType;
  busy?: boolean;
}

const EXIT_MS = 200;

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'accent',
  icon: Icon,
  busy = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  // Mount when opened; on close, delay unmount to play exit animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted || closing) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [mounted, closing, onClose, busy]);

  if (!mounted) return null;

  const isDestructive = variant === 'destructive';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby={description ? 'confirm-desc' : undefined}
      className={clsx(
        'fixed inset-0 z-250 flex items-center justify-center p-4 sm:p-6',
        closing ? 'animate-overlay-out' : 'animate-overlay-in',
      )}
      style={{ overscrollBehavior: 'contain' }}
    >
      <button
        type="button"
        aria-label="Cancelar"
        onClick={() => { if (!busy) onClose(); }}
        className="absolute inset-0 bg-brand-ink/40 dark:bg-black/65 backdrop-blur-md cursor-default"
      />

      <div
        className={clsx(
          'relative w-full max-w-[440px] bg-brand-bg-2 dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-3xl shadow-[0_24px_80px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden',
          closing ? 'animate-dialog-out' : 'animate-dialog-in',
        )}
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            {Icon && (
              <div
                className={clsx(
                  'shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border',
                  isDestructive
                    ? 'bg-brand-danger-soft dark:bg-dark-danger-soft border-brand-danger/20 dark:border-dark-danger/20 text-brand-danger dark:text-dark-danger'
                    : 'bg-brand-accent-soft dark:bg-dark-accent-soft border-brand-accent/20 dark:border-dark-accent/20 text-brand-accent dark:text-dark-accent',
                )}
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2
                id="confirm-title"
                className="font-serif text-xl sm:text-2xl font-black text-brand-ink dark:text-dark-ink tracking-tight leading-tight"
              >
                {title}
              </h2>
              {description && (
                <p
                  id="confirm-desc"
                  className="mt-2 text-sm text-brand-ink-soft dark:text-dark-ink-soft leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => { if (!busy) onClose(); }}
              disabled={busy}
              aria-label="Cerrar diálogo"
              className="shrink-0 w-9 h-9 -mt-1 -mr-1 flex items-center justify-center rounded-xl text-brand-ink-faint dark:text-dark-ink-faint hover:text-brand-ink dark:hover:text-dark-ink hover:bg-brand-stroke/50 dark:hover:bg-dark-stroke/50 active:scale-90 transition-[transform,color,background-color] disabled:opacity-50"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              ref={cancelRef}
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2.5 rounded-xl bg-brand-bg-1 dark:bg-dark-bg-1 border border-brand-stroke dark:border-dark-stroke text-sm font-semibold text-brand-ink dark:text-dark-ink hover:bg-brand-stroke/40 dark:hover:bg-dark-stroke/40 active:scale-[0.97] transition-[transform,background-color] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent dark:focus-visible:ring-dark-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg-2 dark:focus-visible:ring-offset-dark-bg-2"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              aria-busy={busy}
              className={clsx(
                'px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md active:scale-[0.97] transition-[transform,background-color,opacity] disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg-2 dark:focus-visible:ring-offset-dark-bg-2',
                isDestructive
                  ? 'bg-brand-danger dark:bg-dark-danger hover:bg-brand-danger/90 dark:hover:bg-dark-danger/90 shadow-brand-danger/25 dark:shadow-dark-danger/25 focus-visible:ring-brand-danger dark:focus-visible:ring-dark-danger'
                  : 'bg-brand-accent dark:bg-dark-accent hover:bg-brand-accent-hover dark:hover:bg-dark-accent-hover shadow-brand-accent/25 dark:shadow-dark-accent/25 focus-visible:ring-brand-accent dark:focus-visible:ring-dark-accent',
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
