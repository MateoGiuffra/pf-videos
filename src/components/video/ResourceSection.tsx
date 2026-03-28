'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, PenTool, File, Download, CornerDownRight, ArrowRight } from 'lucide-react';
import { Resource } from '@/lib/resources';
import { clsx } from 'clsx';

interface ResourceSectionProps {
  unitTitle: string;
  resources: Resource[];
  viewMode: 'grid' | 'list';
  index: number;
}

export function ResourceSection({ unitTitle, resources, viewMode, index }: ResourceSectionProps) {
  const [isOpen, setIsOpen] = useState(index === 0); // Open first section by default

  return (
    <section 
      className="animate-in fade-in slide-in-from-bottom-12 duration-1000 overflow-hidden" 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header / Accordion Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group mb-6 py-4 px-6 bg-white/30 dark:bg-dark-card/30 hover:bg-white/50 dark:hover:bg-dark-card/50 border border-brand-stroke/30 dark:border-dark-stroke/30 rounded-3xl transition-all duration-500 backdrop-blur-sm shadow-sm hover:shadow-md"
      >
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent/70 group-hover:text-brand-accent transition-colors">
            Sección del Curso
          </span>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-ink dark:text-dark-ink tracking-tight">
              {unitTitle}
            </h2>
            <span className="px-3 py-1 bg-brand-accent/10 dark:bg-dark-accent/10 text-brand-accent dark:text-dark-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-accent/20">
              {resources.length} {resources.length === 1 ? 'Archivo' : 'Archivos'}
            </span>
          </div>
        </div>
        
        <div className={clsx(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border border-brand-stroke/40 dark:border-dark-stroke/40",
          isOpen ? "bg-brand-accent text-white rotate-180 shadow-lg shadow-teal-500/20" : "bg-white dark:bg-dark-bg-2 text-brand-ink-soft dark:text-dark-ink-soft"
        )}>
          <ChevronDown className="w-6 h-6" />
        </div>
      </button>

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
          {resources.map((resource) => {
            /*
            const handleDownload = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              const downloadUrl = `/api/resources/download?url=${encodeURIComponent(resource.url)}&filename=${encodeURIComponent(resource.title + '.pdf')}`;
              window.location.href = downloadUrl;
            };
            */

            return (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  "group relative transition-all duration-500",
                  viewMode === 'grid' 
                    ? "bg-white/40 dark:bg-dark-card/40 backdrop-blur-sm border border-brand-stroke/40 dark:border-dark-stroke/40 rounded-[2rem] p-8 hover:bg-white dark:hover:bg-dark-card hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2" 
                    : "bg-white/40 dark:bg-dark-card/40 backdrop-blur-sm border border-brand-stroke/40 dark:border-dark-stroke/40 rounded-2xl p-5 flex items-center justify-between hover:bg-white dark:hover:bg-dark-card hover:shadow-xl hover:translate-x-2"
                )}
              >
                <div className={clsx("flex items-center gap-6", viewMode === 'list' && "flex-1")}>
                  <div className={clsx(
                    "rounded-[1.25rem] flex items-center justify-center transition-all duration-700 shadow-lg",
                    resource.type === 'practice' 
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-[15deg] group-hover:scale-110" 
                      : resource.type === 'theory'
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white group-hover:rotate-[15deg] group-hover:scale-110"
                      : "bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white group-hover:rotate-[15deg] group-hover:scale-110",
                    viewMode === 'grid' ? "w-16 h-16" : "w-12 h-12"
                  )}>
                    {resource.type === 'practice' ? <PenTool className="w-8 h-8" /> : 
                     resource.type === 'theory' ? <BookOpen className="w-8 h-8" /> : 
                     <File className="w-8 h-8" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {resource.unit !== unitTitle && viewMode === 'grid' && (
                      <div className="flex items-center gap-1.5 mb-2 opacity-50">
                         <CornerDownRight className="w-3 h-3 text-brand-ink/40 dark:text-dark-ink/40" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink-soft dark:text-dark-ink-soft">{resource.unit.split(' - ').pop()}</span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-brand-ink dark:text-dark-ink group-hover:text-brand-accent transition-colors leading-snug line-clamp-2 pr-4">
                      {resource.title}
                    </h3>
                    {viewMode === 'grid' && (
                      <div className="mt-4 flex items-center justify-between">
                        <span className={clsx(
                          "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border",
                          resource.type === 'practice' 
                            ? "border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5" 
                            : "border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5"
                        )}>
                          {resource.type === 'practice' ? 'Práctica' : 'Teoría'}
                        </span>
                        <div className="flex items-center gap-2 text-brand-accent font-black text-[10px] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                           Ver Archivo <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 
                <div 
                  onClick={handleDownload}
                  className={clsx(
                    "transition-all duration-500",
                    viewMode === 'grid' 
                      ? "absolute top-8 right-8 p-2 bg-brand-bg-2/50 dark:bg-dark-bg-2/50 rounded-lg opacity-0 group-hover:opacity-100 group-hover:scale-110" 
                      : "flex items-center gap-4 pr-2"
                  )}
                >
                  {viewMode === 'list' && (
                    <span className={clsx(
                      "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border hidden sm:block",
                      resource.type === 'practice' 
                        ? "border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5 " 
                        : "border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5"
                    )}>
                      {resource.type === 'practice' ? 'Práctica' : 'Teoría'}
                    </span>
                  )}
                  <div className="p-2 hover:bg-brand-accent/10 dark:hover:bg-brand-accent/10 rounded-xl transition-colors">
                    <Download className="w-5 h-5 text-brand-accent group-hover:animate-bounce" />
                  </div>
                </div>
                */}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
