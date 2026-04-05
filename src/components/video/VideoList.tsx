'use client';

import { PDFViewer } from '@/components/video/PDFViewer';
import { ResourceSection } from '@/components/video/ResourceSection';
import { VideoItem } from '@/components/video/VideoItem';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { PracticeVideo, TheoryVideo } from '@/lib/data';
import { downloadAllAsZipWithFolders } from '@/lib/zip';
import { clsx } from 'clsx';
import { BookOpen, Download, FileText, Loader2, PenTool, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface VideoListProps {
  practiceVideos: PracticeVideo[];
  theoryVideos: TheoryVideo[];
}

export function VideoList({ practiceVideos, theoryVideos }: VideoListProps) {
  const [activeTab, setActiveTab] = useState<'practice' | 'theory' | 'material'>('practice');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCuatri, setSelectedCuatri] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Materials state
  const [materials, setMaterials] = useState<Record<string, any[]>>({});
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [viewingPDF, setViewingPDF] = useState<{ url: string; title: string } | null>(null);

  // Fetch materials when switching to material tab
  useEffect(() => {
    if (activeTab === 'material' && Object.keys(materials).length === 0) {
      setLoadingMaterials(true);
      fetch('/api/admin/resources')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setMaterials(data);
        })
        .catch(err => console.error('Error fetching materials:', err))
        .finally(() => setLoadingMaterials(false));
    }
  }, [activeTab, materials]);

  // Sort units numerically ("Unidad 1" < "Unidad 2" < ... < "Unidad 10")
  const sortedUnitKeys = useMemo(() => {
    return Object.keys(materials).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b, 'es');
    });
  }, [materials]);

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
    } else if (activeTab === 'theory') {
      return theoryVideos.filter(v => {
        return v.title.toLowerCase().includes(search.toLowerCase());
      });
    }
    return [];
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Search & Filters Bar */}
      <div className="bg-white/80 dark:bg-dark-card/90 border border-brand-stroke dark:border-dark-stroke rounded-[2.5rem] p-6 lg:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-8 items-center ring-1 ring-black/5 dark:ring-white/5 mx-auto max-w-6xl">
        <div className="relative flex-1 group w-full">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-brand-ink-soft/40 dark:text-dark-ink-soft/40 group-focus-within:text-brand-accent transition-all duration-300" />
          </div>
          <input
            type="text"
            placeholder={
              activeTab === 'practice' ? "Buscar por título, fecha (YYYY-MM-DD)..." :
                activeTab === 'theory' ? "Buscar por título..." :
                  "¿Qué material estás buscando hoy?"
            }
            className="w-full pl-16 pr-8 py-5 bg-brand-bg-2/50 dark:bg-dark-bg-2/50 border border-transparent focus:bg-white dark:focus:bg-dark-card rounded-3xl text-sm md:text-base text-brand-ink dark:text-dark-ink placeholder:text-brand-ink-soft/30 dark:placeholder:text-dark-ink-soft/50 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent/50 transition-all duration-500 shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {activeTab === 'practice' && (
          <div className="flex gap-4 w-full md:w-auto">
            <select
              className="flex-1 md:flex-none py-4 px-6 bg-brand-bg-2 dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-2xl text-sm font-bold text-brand-ink dark:text-dark-ink outline-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all appearance-none min-w-[140px] shadow-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">Años</option>
              {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>

            <select
              className="flex-1 md:flex-none py-4 px-6 bg-brand-bg-2 dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-2xl text-sm font-bold text-brand-ink dark:text-dark-ink outline-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all appearance-none min-w-[140px] shadow-sm"
              value={selectedCuatri}
              onChange={(e) => setSelectedCuatri(e.target.value)}
            >
              <option value="all">Cuatris</option>
              <option value="1">1° Cuatri</option>
              <option value="2">2° Cuatri</option>
            </select>
          </div>
        )}
      </div>

      {/* Modern Centered Tabs */}
      <div className="flex justify-center mt-8">
        <div className="flex p-1.5 bg-brand-bg-2/30 dark:bg-dark-bg-2/30 rounded-[2.5rem] border border-brand-stroke dark:border-dark-stroke backdrop-blur-md shadow-inner">
          <button
            onClick={() => setActiveTab('practice')}
            className={clsx(
              "flex items-center gap-2.5 px-8 md:px-10 py-4 rounded-[2rem] text-sm font-black transition-all duration-500",
              activeTab === 'practice'
                ? "bg-brand-accent text-white shadow-xl shadow-teal-500/30 scale-105"
                : "text-brand-ink-soft dark:text-dark-ink-soft hover:bg-white/50 dark:hover:bg-dark-card/50"
            )}
          >
            <PenTool className="w-4 h-4" />
            Clases Prácticas
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={clsx(
              "flex items-center gap-2.5 px-8 md:px-10 py-4 rounded-[2rem] text-sm font-black transition-all duration-500",
              activeTab === 'theory'
                ? "bg-brand-accent text-white shadow-xl shadow-teal-500/30 scale-105"
                : "text-brand-ink-soft dark:text-dark-ink-soft hover:bg-white/50 dark:hover:bg-dark-card/50"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Clases Teóricas
          </button>
          <button
            onClick={() => setActiveTab('material')}
            className={clsx(
              "flex items-center gap-2.5 px-8 md:px-10 py-4 rounded-[2rem] text-sm font-black transition-all duration-500",
              activeTab === 'material'
                ? "bg-brand-accent text-white shadow-xl shadow-teal-500/30 scale-105"
                : "text-brand-ink-soft dark:text-dark-ink-soft hover:bg-white/50 dark:hover:bg-dark-card/50"
            )}
          >
            <FileText className="w-4 h-4" />
            Material
          </button>
        </div>
      </div>

      {/* Material Global Actions */}
      {activeTab === 'material' && !loadingMaterials && Object.keys(materials).length > 0 && (
        <div className="flex justify-end max-w-6xl mx-auto -mb-4">
          <button
            onClick={() => {
              // Build a folder-per-unit map for the ZIP (all units, all files)
              const unitMap: Record<string, { name: string; url: string }[]> = {};
              for (const unitTitle of sortedUnitKeys) {
                unitMap[unitTitle] = (materials[unitTitle] || []).map(f => ({
                  name: f.title.endsWith('.pdf') ? f.title : `${f.title}.pdf`,
                  url: `/api/resources/view?id=${encodeURIComponent(f.driveId)}&filename=${encodeURIComponent(f.title)}&download=true`,
                }));
              }
              downloadAllAsZipWithFolders(unitMap, 'material-completo');
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-bg-1 dark:bg-dark-bg-1 border border-brand-stroke dark:border-dark-stroke rounded-xl text-xs font-black text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent transition-all shadow-sm hover:shadow-md group mb-10"
          >
            <Download className="w-4 h-4 group-hover:animate-bounce" />
            Descargar Todo (ZIP)
          </button>
        </div>
      )}

      {/* Grid for Videos or Resources */}
      <div className="pb-12">
        {activeTab !== 'material' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-6xl">
            {filteredVideos.map((v, index) => (
              <VideoItem
                key={v.id}
                video={v}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
            {filteredVideos.length === 0 && (
              <div className="col-span-full text-center py-32 opacity-50 bg-brand-bg-2/20 dark:bg-dark-bg-2/20 rounded-[3rem] border-2 border-dashed border-brand-stroke/30 dark:border-dark-stroke/30">
                <Search className="w-16 h-16 mx-auto mb-6 text-brand-ink-soft/20 dark:text-dark-ink-soft/20" />
                <p className="text-2xl font-serif font-bold text-brand-ink/40 dark:text-dark-ink/50">No se encontraron clases.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 mx-auto max-w-6xl">
            {loadingMaterials ? (
              <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                <Loader2 className="w-12 h-12 text-brand-accent animate-spin mb-4" />
                <p className="text-brand-ink-soft dark:text-dark-ink-soft font-bold uppercase tracking-widest text-[10px]">Cargando materiales...</p>
              </div>
            ) : Object.keys(materials).length > 0 ? (
              sortedUnitKeys.map((unitTitle, unitIdx) => {
                const normalizedSearch = search.toLowerCase().trim();
                const filteredFiles = materials[unitTitle].filter(f =>
                  f.title.toLowerCase().includes(normalizedSearch) ||
                  unitTitle.toLowerCase().includes(normalizedSearch)
                );

                if (filteredFiles.length === 0 && normalizedSearch) return null;

                return (
                  <ResourceSection
                    key={unitTitle}
                    unitTitle={unitTitle}
                    resources={filteredFiles}
                    viewMode="grid"
                    index={unitIdx}
                    onViewPDF={(url: string, title: string) => setViewingPDF({ url, title })}
                  />
                );
              })
            ) : (
              <div className="text-center py-32 opacity-50 bg-brand-bg-2/20 dark:bg-dark-bg-2/20 rounded-[3rem] border-2 border-dashed border-brand-stroke/30 dark:border-dark-stroke/30">
                <FileText className="w-16 h-16 mx-auto mb-6 text-brand-ink-soft/20 dark:text-dark-ink-soft/20" />
                <p className="text-2xl font-serif font-bold text-brand-ink/40 dark:text-dark-ink/50">No se encontró material educativo.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {viewingPDF && (
        <PDFViewer
          url={viewingPDF.url}
          title={viewingPDF.title}
          onClose={() => setViewingPDF(null)}
        />
      )}

      {/* Video Player Modal */}
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
