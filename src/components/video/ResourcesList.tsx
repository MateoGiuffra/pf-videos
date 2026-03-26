'use client';

import { useState, useMemo } from 'react';
import { Search, BookOpen, PenTool, ExternalLink, LayoutGrid, List, File, Download, ArrowRight, CornerDownRight } from 'lucide-react';
import { Section, Resource } from '@/lib/resources';
import { clsx } from 'clsx';

interface ResourcesListProps {
  initialSections: Section[];
}

export function ResourcesList({ initialSections }: ResourcesListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'practice' | 'theory'>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allResources = useMemo(() => {
    return initialSections.flatMap(s => s.resources);
  }, [initialSections]);

  const filteredResources = useMemo(() => {
    return allResources.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                           r.unit.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'all' || r.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [allResources, search, activeTab]);

  const groupedByUnit = useMemo(() => {
    const groups: Record<string, Resource[]> = {};
    filteredResources.forEach(r => {
      // Get the title before the " - " to group by the base unit if possible
      const unitKey = r.unit.includes(' - ') ? r.unit.split(' - ')[0] : r.unit;
      if (!groups[unitKey]) groups[unitKey] = [];
      groups[unitKey].push(r);
    });
    return groups;
  }, [filteredResources]);

  const units = Object.keys(groupedByUnit);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Search & Filters Bar */}
      <div className="bg-white/70 dark:bg-dark-card/70 border border-brand-stroke/50 dark:border-dark-stroke/50 rounded-[2.5rem] p-4 lg:p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-6 items-center ring-1 ring-black/5 dark:ring-white/5">
        <div className="relative flex-1 group w-full">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-brand-ink-soft/40 dark:text-dark-ink-soft/40 group-focus-within:text-brand-accent transition-all duration-300" />
          </div>
          <input
            type="text"
            placeholder="¿Qué material estás buscando hoy?"
            className="w-full pl-14 pr-6 py-4.5 bg-brand-bg-2/30 dark:bg-dark-bg-2/30 border border-transparent focus:bg-white dark:focus:bg-dark-bg-1 rounded-[2rem] text-base text-brand-ink dark:text-dark-ink placeholder:text-brand-ink-soft/30 dark:placeholder:text-dark-ink-soft/40 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent/50 transition-all duration-500 shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1.5 bg-brand-bg-2/50 dark:bg-dark-bg-2/50 rounded-2xl border border-brand-stroke/30 dark:border-dark-stroke/30 shadow-inner">
            <button 
              onClick={() => setViewMode('grid')}
              className={clsx(
                "p-2.5 rounded-xl transition-all duration-300",
                viewMode === 'grid' 
                  ? "bg-white dark:bg-dark-card shadow-md text-brand-accent scale-105" 
                  : "text-brand-ink-soft/50 dark:text-dark-ink-soft/50 hover:text-brand-accent"
              )}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={clsx(
                "p-2.5 rounded-xl transition-all duration-300",
                viewMode === 'list' 
                  ? "bg-white dark:bg-dark-card shadow-md text-brand-accent scale-105" 
                  : "text-brand-ink-soft/50 dark:text-dark-ink-soft/50 hover:text-brand-accent"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex justify-center -mb-4">
        <div className="flex p-1.5 bg-brand-bg-2/50 dark:bg-dark-bg-2/50 rounded-[2rem] border border-brand-stroke/30 dark:border-dark-stroke/30 backdrop-blur-md">
          {[
            { id: 'all', label: 'Todos', icon: File },
            { id: 'practice', label: 'Prácticos', icon: PenTool },
            { id: 'theory', label: 'Teóricos', icon: BookOpen }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "flex items-center gap-2.5 px-8 py-3.5 rounded-[1.5rem] text-sm font-black transition-all duration-500 relative overflow-hidden",
                activeTab === tab.id 
                  ? "bg-brand-accent text-white shadow-xl shadow-teal-500/25 scale-105" 
                  : "text-brand-ink-soft/60 dark:text-dark-ink-soft/60 hover:text-brand-ink dark:hover:text-dark-ink hover:bg-white/50 dark:hover:bg-dark-bg-1/50"
              )}
            >
              <tab.icon className={clsx("w-4 h-4", activeTab === tab.id ? "animate-pulse" : "")} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-20 pb-20">
        {units.length > 0 ? (
          units.map((unitTitle, unitIdx) => (
            <section key={unitTitle} className="animate-in fade-in slide-in-from-bottom-12 duration-1000" style={{ animationDelay: `${unitIdx * 100}ms` }}>
              <div className="flex flex-col gap-2 mb-10 pl-4 border-l-4 border-brand-accent">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent">Sección del Curso</span>
                <h2 className="text-3xl font-serif font-black text-brand-ink dark:text-dark-ink tracking-tight">
                  {unitTitle}
                </h2>
              </div>

              <div className={clsx(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" 
                  : "flex flex-col gap-4 max-w-5xl mx-auto"
              )}>
                {groupedByUnit[unitTitle].map((resource, resIdx) => (
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
                             <CornerDownRight className="w-3 h-3" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">{resource.unit.split(' - ').pop()}</span>
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
                                ? "border-blue-500/20 text-blue-600 bg-blue-500/5" 
                                : "border-purple-500/20 text-purple-600 bg-purple-500/5"
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

                    <div className={clsx(
                      "transition-all duration-500",
                      viewMode === 'grid' 
                        ? "absolute top-8 right-8 p-2 bg-brand-bg-2/50 dark:bg-dark-bg-2/50 rounded-lg opacity-0 group-hover:opacity-100 group-hover:scale-110" 
                        : "flex items-center gap-4 pr-2"
                    )}>
                      {viewMode === 'list' && (
                        <span className={clsx(
                          "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border hidden sm:block",
                          resource.type === 'practice' 
                            ? "border-blue-500/20 text-blue-600 bg-blue-500/5 " 
                            : "border-purple-500/20 text-purple-600 bg-purple-500/5"
                        )}>
                          {resource.type === 'practice' ? 'Práctica' : 'Teoría'}
                        </span>
                      )}
                      <Download className="w-5 h-5 text-brand-accent group-hover:animate-bounce" />
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="relative overflow-hidden py-32 flex flex-col items-center justify-center bg-brand-bg-2/30 dark:bg-dark-bg-2/30 rounded-[3rem] border-2 border-dashed border-brand-stroke dark:border-dark-stroke animate-in zoom-in-95 duration-700">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-accent/5 rounded-full blur-[100px]"></div>
            <div className="p-8 bg-white dark:bg-dark-card rounded-[2rem] shadow-2xl mb-8 relative">
              <File className="w-16 h-16 text-brand-accent/20" />
              <Search className="absolute bottom-6 right-6 w-8 h-8 text-brand-accent animate-pulse" />
            </div>
            <h3 className="text-2xl font-serif font-black text-brand-ink dark:text-dark-ink mb-2">No encontramos ese material</h3>
            <p className="text-brand-ink-soft dark:text-dark-ink-soft text-center max-w-sm font-medium">
              Intenta con otra palabra clave o limpia los filtros para ver todo el contenido disponible.
            </p>
            <button 
              onClick={() => {setSearch(''); setActiveTab('all');}}
              className="mt-8 px-8 py-3 bg-brand-accent text-white rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/30"
            >
              Mostrar todo el contenido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
