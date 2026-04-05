'use client';

import { X, ExternalLink, Download, Maximize2 } from 'lucide-react';
import { useEffect } from 'react';

interface PDFViewerProps {
  url: string;   // Already a proxy URL: /api/resources/view?id=...
  title: string;
  onClose: () => void;
}

export function PDFViewer({ url, title, onClose }: PDFViewerProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // url is already the proxy URL (/api/resources/view?id=...)
  const proxyUrl = url;
  const downloadUrl = url.includes('download=true') ? url : `${url}&download=true`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-ink/80 dark:bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full h-full max-w-6xl bg-white dark:bg-dark-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-brand-stroke/50 dark:border-dark-stroke/50 animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-brand-bg-1 dark:bg-dark-bg-1 border-b border-brand-stroke dark:border-dark-stroke">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-brand-accent/10 dark:bg-brand-accent/20 rounded-xl">
              <Maximize2 className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-black text-brand-ink dark:text-dark-ink tracking-tight">
                {title}
              </h2>
              <p className="text-[10px] uppercase font-black tracking-widest text-brand-ink-soft dark:text-dark-ink-soft opacity-60">Visor de Documento</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <a 
               href={proxyUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               className="p-3 text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-brand-accent hover:bg-white dark:hover:bg-dark-bg-2 rounded-xl transition-all border border-transparent hover:border-brand-stroke dark:hover:border-dark-stroke shadow-sm hover:shadow-md"
               title="Abrir en pestaña nueva"
             >
               <ExternalLink className="w-5 h-5" />
             </a>
             <a 
               href={downloadUrl}
               className="p-3 text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-brand-accent hover:bg-white dark:hover:bg-dark-bg-2 rounded-xl transition-all border border-transparent hover:border-brand-stroke dark:hover:border-dark-stroke shadow-sm hover:shadow-md"
               title="Descargar"
             >
               <Download className="w-5 h-5" />
             </a>
             <div className="w-[1px] h-8 bg-brand-stroke dark:bg-dark-stroke mx-1"></div>
             <button
               onClick={onClose}
               className="p-3 bg-brand-accent text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-teal-500/30"
             >
               <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* PDF Iframe with local proxy for stable rendering */}
        <div className="flex-1 bg-brand-bg-2 dark:bg-dark-bg-2 relative">
          <iframe
             src={proxyUrl}
             className="w-full h-full border-none shadow-inner"
             title={title}
          ></iframe>
          
          {/* Subtle decoration overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/20 dark:from-black/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
