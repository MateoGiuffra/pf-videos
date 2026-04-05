'use client';

import { useState } from 'react';
import { ChevronDown, BookOpen, PenTool, File, Download, CornerDownRight, Maximize2 } from 'lucide-react';
import { downloadAllAsZip } from '@/lib/zip';
import { clsx } from 'clsx';

interface ResourceSectionProps {
  unitTitle: string;
  resources: any[]; // Google Drive resources
  viewMode: 'grid' | 'list';
  index: number;
  onViewPDF: (url: string, title: string) => void;
}

export function ResourceSection({ unitTitle, resources, viewMode, index, onViewPDF }: ResourceSectionProps) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <section 
      className="animate-in fade-in slide-in-from-bottom-12 duration-1000 overflow-hidden" 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header / Accordion Trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="w-full flex items-center justify-between group mb-6 py-4 px-6 bg-white/30 dark:bg-dark-card/30 hover:bg-white/50 dark:hover:bg-dark-card/50 border border-brand-stroke/30 dark:border-dark-stroke/30 rounded-3xl transition-all duration-500 backdrop-blur-sm shadow-sm hover:shadow-md cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50"
      >
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent/70 group-hover:text-brand-accent transition-colors">
            Sección del Curso
          </span>
          <div className="flex items-center gap-4 text-left">
            <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-ink dark:text-dark-ink tracking-tight capitalize">
              {unitTitle.replace(/_/g, ' ')}
            </h2>
            <span className="px-3 py-1 bg-brand-accent/10 dark:bg-dark-accent/10 text-brand-accent dark:text-dark-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-accent/20">
              {resources.length} {resources.length === 1 ? 'Archivo' : 'Archivos'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button
             onClick={(e) => {
               e.stopPropagation();
               const files = resources.map(r => ({ name: `${r.title}.pdf`, url: `/api/resources/view?id=${encodeURIComponent(r.driveId)}&filename=${encodeURIComponent(r.title)}&download=true` }));
               downloadAllAsZip(files, unitTitle);
             }}
             className="px-3 py-1.5 bg-brand-bg-1 dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent transition-all hidden sm:flex items-center gap-2"
             title="Descargar unidad completa"
           >
             <Download className="w-3 h-3" />
             ZIP
           </button>
           
           <div className={clsx(
             "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border border-brand-stroke/40 dark:border-dark-stroke/40",
             isOpen ? "bg-brand-accent text-white rotate-180 shadow-lg shadow-teal-500/20" : "bg-white dark:bg-dark-bg-2 text-brand-ink-soft dark:text-dark-ink-soft"
           )}>
             <ChevronDown className="w-6 h-6" />
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={clsx(
        "transition-all duration-700 ease-in-out origin-top",
        isOpen ? "max-h-[5000px] opacity-100 mb-16 scale-100" : "max-h-0 opacity-0 overflow-hidden scale-95"
      )}>
        <div className={clsx(
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-1" 
            : "flex flex-col gap-4 max-w-5xl mx-auto"
        )}>
          {resources.map((resource) => (
            <div
              key={resource.id}
              className={clsx(
                "group relative transition-all duration-500",
                "bg-white/40 dark:bg-dark-card/40 backdrop-blur-sm border border-brand-stroke/40 dark:border-dark-stroke/40 rounded-[2rem] p-8 hover:bg-white dark:hover:bg-dark-card hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2"
              )}
            >
              <div className="flex items-center gap-6">
                <div className={clsx(
                  "w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-700 shadow-lg",
                  resource.type === 'practice' 
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-[15deg] group-hover:scale-110" 
                    : resource.type === 'theory'
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white group-hover:rotate-[15deg] group-hover:scale-110"
                    : "bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white group-hover:rotate-[15deg] group-hover:scale-110"
                )}>
                  {resource.type === 'practice' ? <PenTool className="w-8 h-8" /> : 
                   resource.type === 'theory' ? <BookOpen className="w-8 h-8" /> : 
                   <File className="w-8 h-8" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-brand-ink dark:text-dark-ink group-hover:text-brand-accent transition-colors leading-snug line-clamp-2 pr-4">
                    {resource.title}
                  </h3>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className={clsx(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border",
                      resource.type === 'practice' 
                        ? "border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5" 
                        : resource.type === 'theory'
                        ? "border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5"
                        : "border-teal-500/20 text-teal-600 dark:text-teal-400 bg-teal-500/5"
                    )}>
                      {resource.type === 'practice' ? 'Práctica' : resource.type === 'theory' ? 'Teoría' : 'Recurso'}
                    </span>
                    
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => onViewPDF(`/api/resources/view?id=${encodeURIComponent(resource.driveId)}&filename=${encodeURIComponent(resource.title)}`, resource.title)}
                         className="flex items-center gap-2 px-3 py-1.5 bg-brand-accent text-white rounded-lg text-[10px] font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-md shadow-teal-500/20"
                       >
                         Ver <Maximize2 className="w-3 h-3" />
                       </button>
                       <a 
                         href={`/api/resources/view?id=${encodeURIComponent(resource.driveId)}&filename=${encodeURIComponent(resource.title)}&download=true`}
                         className="p-1.5 text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent transition-colors"
                         title="Descargar PDF"
                       >
                         <Download className="w-4 h-4" />
                       </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
