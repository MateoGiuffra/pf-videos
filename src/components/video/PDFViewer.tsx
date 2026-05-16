'use client';

import { X, ExternalLink, Download, FileText } from 'lucide-react';
import { useEffect } from 'react';

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function PDFViewer({ url, title, onClose }: PDFViewerProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const downloadUrl = url.includes('download=true') ? url : `${url}&download=true`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-80 flex items-end sm:items-center justify-center sm:p-6 lg:p-10 animate-in fade-in duration-300"
      style={{ overscrollBehavior: 'contain' }}
    >
      <button
        type="button"
        aria-label="Cerrar visor de documento"
        onClick={onClose}
        className="absolute inset-0 bg-brand-ink/70 dark:bg-black/85 backdrop-blur-xl cursor-default"
      />

      <div className="relative w-full h-[92dvh] sm:h-full sm:max-h-[88vh] max-w-6xl bg-brand-bg-2 dark:bg-dark-bg-2 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border-t sm:border border-brand-stroke dark:border-dark-stroke animate-sheet-in sm:animate-in sm:zoom-in-95 sm:duration-300">
        {/* Mobile grabber */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-brand-ink-faint/40 dark:bg-dark-ink-faint/40 rounded-full" />
        </div>

        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-brand-stroke dark:border-dark-stroke">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-brand-accent-soft dark:bg-dark-accent-soft items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-brand-accent dark:text-dark-accent" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-brand-ink-soft dark:text-dark-ink-soft">Documento</p>
              <h2 className="font-serif text-base sm:text-lg font-black text-brand-ink dark:text-dark-ink truncate leading-tight">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir en pestaña nueva"
              className="hidden sm:flex p-2.5 rounded-xl text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:bg-brand-bg-1 dark:hover:bg-dark-bg-1 active:scale-95 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={downloadUrl}
              title="Descargar"
              className="p-2.5 rounded-xl text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:bg-brand-bg-1 dark:hover:bg-dark-bg-1 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-2.5 rounded-xl bg-brand-accent dark:bg-dark-accent text-white shadow-md shadow-brand-accent/25 dark:shadow-dark-accent/25 active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-brand-bg-1 dark:bg-dark-bg-1 relative">
          <iframe
            src={url}
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
