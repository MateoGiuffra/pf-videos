'use client';

import { X, ExternalLink, Download, FileText, Eye, Code2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
  kind?: 'pdf' | 'md';
}

export function PDFViewer({ url, title, onClose, kind }: PDFViewerProps) {
  const inferredKind: 'pdf' | 'md' = kind ?? (title.toLowerCase().endsWith('.md') ? 'md' : 'pdf');
  const isMarkdown = inferredKind === 'md';

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
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-brand-ink-soft dark:text-dark-ink-soft">
                {isMarkdown ? 'Markdown' : 'Documento'}
              </p>
              <h2 className="font-serif text-base sm:text-lg font-black text-brand-ink dark:text-dark-ink truncate leading-tight">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {!isMarkdown && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir en pestaña nueva"
                className="hidden sm:flex p-2.5 rounded-xl text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:bg-brand-bg-1 dark:hover:bg-dark-bg-1 active:scale-95 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
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

        <div className="flex-1 bg-brand-bg-1 dark:bg-dark-bg-1 relative overflow-hidden">
          {isMarkdown ? (
            <MarkdownViewer url={url} />
          ) : (
            <iframe
              src={url}
              className="w-full h-full border-0"
              title={title}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MarkdownViewer({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'rendered' | 'source'>('rendered');

  useEffect(() => {
    let cancelled = false;
    setText(null);
    setError(null);
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((t) => { if (!cancelled) setText(t); })
      .catch((e) => { if (!cancelled) setError(e.message || 'Error al cargar'); });
    return () => { cancelled = true; };
  }, [url]);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex justify-end px-4 sm:px-6 pt-3">
        <div className="inline-flex p-1 bg-brand-bg-2/70 dark:bg-dark-bg-2/70 border border-brand-stroke dark:border-dark-stroke rounded-xl">
          <button
            onClick={() => setMode('rendered')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'rendered'
                ? 'bg-brand-accent dark:bg-dark-accent text-white'
                : 'text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-ink dark:hover:text-dark-ink'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista</span>
          </button>
          <button
            onClick={() => setMode('source')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'source'
                ? 'bg-brand-accent dark:bg-dark-accent text-white'
                : 'text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-ink dark:hover:text-dark-ink'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Código</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-10 lg:px-14 py-6 sm:py-8">
        {text === null && !error && (
          <div className="flex items-center justify-center h-full gap-3 text-brand-ink-soft dark:text-dark-ink-soft">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em]">Cargando markdown</span>
          </div>
        )}
        {error && (
          <div className="text-center py-12 text-brand-ink-soft dark:text-dark-ink-soft">
            <p className="font-serif text-lg">No se pudo cargar el archivo.</p>
            <p className="font-mono text-xs mt-2 opacity-70">{error}</p>
          </div>
        )}
        {text !== null && (
          mode === 'rendered' ? (
            <article className="md-prose mx-auto max-w-3xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </article>
          ) : (
            <pre className="mx-auto max-w-4xl text-[13px] leading-relaxed font-mono text-brand-ink dark:text-dark-ink bg-brand-bg-2 dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-2xl p-4 sm:p-6 whitespace-pre-wrap break-words">
              {text}
            </pre>
          )
        )}
      </div>
    </div>
  );
}
