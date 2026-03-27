'use client';

import { useState, useMemo } from 'react';
import { Search, BookOpen, PenTool, ExternalLink, LayoutGrid, List, File, Download, ArrowRight, CornerDownRight } from 'lucide-react';
import { Section, Resource } from '@/lib/resources';
import { clsx } from 'clsx';
import { ResourceSection } from './ResourceSection';

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
    const normalize = (str: string) => 
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    const searchTerm = normalize(search);
    
    return allResources.filter(r => {
      const matchesSearch = normalize(r.title).includes(searchTerm) || 
                           normalize(r.unit).includes(searchTerm);
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
      <div className="flex justify-center">
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
      <div className="space-y-6 pb-20">
        {units.length > 0 ? (
          units.map((unitTitle, unitIdx) => (
            <ResourceSection
              key={unitTitle}
              unitTitle={unitTitle}
              resources={groupedByUnit[unitTitle]}
              viewMode={viewMode}
              index={unitIdx}
            />
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
