'use client';

import { useState, useMemo } from 'react';
import { PracticeVideo, TheoryVideo } from '@/lib/data';
import { VideoItem } from '@/components/video/VideoItem';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { Search, SlidersHorizontal, BookOpen, PenTool } from 'lucide-react';
import { clsx } from 'clsx';

interface VideoListProps {
  practiceVideos: PracticeVideo[];
  theoryVideos: TheoryVideo[];
}

export function VideoList({ practiceVideos, theoryVideos }: VideoListProps) {
  const [activeTab, setActiveTab] = useState<'practice' | 'theory'>('practice');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCuatri, setSelectedCuatri] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const years = useMemo(() => {
    const allYears = practiceVideos.map(v => v.year);
    return Array.from(new Set(allYears)).sort((a, b) => b - a);
  }, [practiceVideos]);

  const filteredVideos = useMemo(() => {
    if (activeTab === 'practice') {
      return practiceVideos.filter(v => {
        const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) || 
                             v.date.includes(search);
        const matchesYear = selectedYear === 'all' || v.year.toString() === selectedYear;
        const matchesCuatri = selectedCuatri === 'all' || v.cuatris.includes(parseInt(selectedCuatri));
        return matchesSearch && matchesYear && matchesCuatri;
      });
    } else {
      return theoryVideos.filter(v => {
        return v.title.toLowerCase().includes(search.toLowerCase());
      });
    }
  }, [activeTab, search, selectedYear, selectedCuatri, practiceVideos, theoryVideos]);

  const selectedVideo = selectedIndex >= 0 ? filteredVideos[selectedIndex] : null;

  const handleNext = () => {
    if (selectedIndex < filteredVideos.length - 1) {
      setSelectedIndex((prev: number) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex((prev: number) => prev - 1);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search & Filters Bar */}
      <div className="bg-white/90 dark:bg-dark-card border border-brand-stroke dark:border-dark-stroke rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row gap-4 items-center gap-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-ink-soft dark:text-dark-ink-soft group-focus-within:text-brand-accent transition-colors" />
          <input
            type="text"
            placeholder={activeTab === 'practice' ? "Buscar por título, fecha (YYYY-MM-DD)..." : "Buscar por título..."}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-2xl text-sm text-brand-ink dark:text-dark-ink placeholder:text-brand-ink-soft/40 dark:placeholder:text-dark-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {activeTab === 'practice' && (
          <div className="flex gap-3 w-full md:w-auto">
            <select
              className="flex-1 md:flex-none py-3 px-4 bg-white dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-2xl text-sm text-brand-ink dark:text-dark-ink outline-none cursor-pointer focus:border-brand-accent transition-all appearance-none min-w-[100px] shadow-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">Todos los años</option>
              {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>

            <select
              className="flex-1 md:flex-none py-3 px-4 bg-white dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-2xl text-sm text-brand-ink dark:text-dark-ink outline-none cursor-pointer focus:border-brand-accent transition-all appearance-none min-w-[120px] shadow-sm"
              value={selectedCuatri}
              onChange={(e) => setSelectedCuatri(e.target.value)}
            >
              <option value="all">Todos los cuatris</option>
              <option value="1">1° Cuatrimestre</option>
              <option value="2">2° Cuatrimestre</option>
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-brand-card dark:bg-dark-card p-1.5 rounded-2xl border border-brand-stroke dark:border-dark-stroke flex gap-2">
          <button
            onClick={() => setActiveTab('practice')}
            className={clsx(
              "flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'practice' 
                ? "bg-brand-accent text-white shadow-lg shadow-teal-500/20" 
                : "text-brand-ink-soft dark:text-dark-ink-soft hover:bg-brand-bg-2 dark:hover:bg-dark-bg-2"
            )}
          >
            <PenTool className="w-4 h-4" />
            Clases Prácticas
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={clsx(
              "flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'theory' 
                ? "bg-brand-accent text-white shadow-lg shadow-teal-500/20" 
                : "text-brand-ink-soft dark:text-dark-ink-soft hover:bg-brand-bg-2 dark:hover:bg-dark-bg-2"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Clases Teóricas
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((v, index) => (
          <VideoItem 
            key={v.id} 
            video={v} 
            onClick={() => setSelectedIndex(index)} 
          />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <p className="text-xl font-serif">No se encontraron videos que coincidan con la búsqueda.</p>
        </div>
      )}

      {/* Video Player Modal/Overlay */}
      {selectedVideo && (
        <VideoPlayer 
          video={selectedVideo} 
          currentIndex={selectedIndex + 1}
          totalCount={filteredVideos.length}
          onClose={() => setSelectedIndex(-1)} 
          onNext={selectedIndex < filteredVideos.length - 1 ? handleNext : undefined}
          onPrev={selectedIndex > 0 ? handlePrev : undefined}
        />
      )}
    </div>
  );
}
