'use client';

import { useState } from 'react';
import { ChevronDown, BookOpen, PenTool, File, FileCode2, Download, Eye, Loader2 } from 'lucide-react';
import { downloadAllAsZip } from '@/lib/zip';
import { useToast } from '@/components/ui/Toast';
import { clsx } from 'clsx';

interface ResourceSectionProps {
  unitTitle: string;
  resources: any[];
  index: number;
  onViewPDF: (url: string, title: string, kind?: 'pdf' | 'md') => void;
}

function getKind(resource: any): 'pdf' | 'md' {
  if (resource.kind === 'md' || resource.kind === 'pdf') return resource.kind;
  return resource.title?.toLowerCase().endsWith('.md') ? 'md' : 'pdf';
}

export function ResourceSection({ unitTitle, resources, index, onViewPDF }: ResourceSectionProps) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const [downloading, setDownloading] = useState(false);
  const { loading, update } = useToast();

  function handleDownloadUnit(e: React.MouseEvent) {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    const files = resources.map(r => {
      const lower = (r.title || '').toLowerCase();
      const hasExt = lower.endsWith('.pdf') || lower.endsWith('.md');
      return {
        name: hasExt ? r.title : `${r.title}.pdf`,
        url: `/api/resources/view?id=${encodeURIComponent(r.driveId)}&filename=${encodeURIComponent(r.title)}&download=true`,
      };
    });
    const toastId = loading(`Preparando ${unitTitle}`, `Empaquetando ${files.length} archivo${files.length === 1 ? '' : 's'}…`);
    downloadAllAsZip(files, unitTitle, {
      onProgress: (c, t) => update(toastId, { description: `Descargando ${c} de ${t}…` }),
      onError: (msg) => {
        update(toastId, { variant: 'error', title: 'Error en la descarga', description: msg, duration: 5000 });
        setDownloading(false);
      },
      onDone: () => {
        update(toastId, { variant: 'success', title: 'Descarga lista', description: `${unitTitle} guardada.`, duration: 4000 });
        setDownloading(false);
      },
    });
  }

  return (
    <section
      className="animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${Math.min(index * 60, 240)}ms` }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={clsx(
          'group w-full flex items-center justify-between gap-3 py-3 sm:py-4 px-4 sm:px-5',
          'bg-brand-bg-2/70 dark:bg-dark-bg-2/60 backdrop-blur-md border border-brand-stroke dark:border-dark-stroke',
          'rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.995]',
          'hover:border-brand-accent/30 dark:hover:border-dark-accent/30 hover:bg-brand-bg-2 dark:hover:bg-dark-bg-2',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent dark:focus-visible:ring-dark-accent',
          isOpen && 'border-brand-accent/30 dark:border-dark-accent/30',
        )}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className={clsx(
            'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            isOpen
              ? 'bg-brand-accent dark:bg-dark-accent text-white'
              : 'bg-brand-accent-soft dark:bg-dark-accent-soft text-brand-accent dark:text-dark-accent',
          )}>
            <File className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-brand-ink-soft dark:text-dark-ink-soft">
              Unidad · {resources.length} {resources.length === 1 ? 'archivo' : 'archivos'}
            </p>
            <h2 className="font-serif text-lg sm:text-xl lg:text-2xl font-black text-brand-ink dark:text-dark-ink tracking-tight capitalize leading-tight truncate">
              {unitTitle.replace(/_/g, ' ')}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleDownloadUnit}
            disabled={downloading}
            aria-label="Descargar unidad como ZIP"
            title="Descargar unidad como ZIP"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-brand-stroke dark:border-dark-stroke rounded-lg font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:border-brand-accent/40 dark:hover:border-dark-accent/40 active:scale-95 transition-[transform,color,border-color] disabled:opacity-60 disabled:cursor-wait"
          >
            {downloading ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> : <Download className="w-3 h-3" aria-hidden="true" />}
            {downloading ? 'Preparando' : 'ZIP'}
          </button>

          <div className={clsx(
            'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 border',
            isOpen
              ? 'bg-brand-accent dark:bg-dark-accent text-white border-transparent rotate-180'
              : 'bg-transparent text-brand-ink-soft dark:text-dark-ink-soft border-brand-stroke dark:border-dark-stroke',
          )}>
            <ChevronDown className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>
      </div>

      <div className={clsx(
        'grid transition-[grid-template-rows,opacity,margin] duration-500 ease-out',
        isOpen ? 'grid-rows-[1fr] opacity-100 mt-3 sm:mt-4 mb-8' : 'grid-rows-[0fr] opacity-0',
      )}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-0.5">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onView={() => onViewPDF(
                  `/api/resources/view?id=${encodeURIComponent(resource.driveId)}&filename=${encodeURIComponent(resource.title)}`,
                  resource.title,
                  getKind(resource),
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourceCard({ resource, onView }: { resource: any; onView: () => void }) {
  const isPractice = resource.type === 'practice';
  const isTheory = resource.type === 'theory';
  const isMd = getKind(resource) === 'md';

  const Icon = isMd ? FileCode2 : isPractice ? PenTool : isTheory ? BookOpen : File;
  const label = isMd ? 'Markdown' : isPractice ? 'Práctica' : isTheory ? 'Teoría' : 'Recurso';

  const downloadUrl = `/api/resources/view?id=${encodeURIComponent(resource.driveId)}&filename=${encodeURIComponent(resource.title)}&download=true`;

  return (
    <article className="group relative bg-brand-bg-2/80 dark:bg-dark-bg-2/60 backdrop-blur-sm border border-brand-stroke dark:border-dark-stroke rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent/30 dark:hover:border-dark-accent/30 hover:shadow-[0_18px_40px_-15px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_18px_40px_-15px_rgba(0,0,0,0.6)]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-accent-soft dark:bg-dark-accent-soft text-brand-accent dark:text-dark-accent flex items-center justify-center shrink-0 transition-colors group-hover:bg-brand-accent group-hover:dark:bg-dark-accent group-hover:text-white">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-brand-ink-soft dark:text-dark-ink-soft mb-1">
            {label}
          </p>
          <h3 className="text-sm font-semibold text-brand-ink dark:text-dark-ink leading-snug line-clamp-2 group-hover:text-brand-accent dark:group-hover:text-dark-accent transition-colors">
            {resource.title}
          </h3>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-1.5">
        <button
          onClick={onView}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-accent dark:bg-dark-accent text-white rounded-lg text-xs font-semibold shadow-sm shadow-brand-accent/20 dark:shadow-dark-accent/20 active:scale-95 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver</span>
        </button>
        <a
          href={downloadUrl}
          aria-label="Descargar PDF"
          className="p-2 rounded-lg border border-brand-stroke dark:border-dark-stroke text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:border-brand-accent/40 dark:hover:border-dark-accent/40 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}
