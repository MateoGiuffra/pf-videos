'use client';

import { PDFViewer } from '@/components/video/PDFViewer';
import { ResourceSection } from '@/components/video/ResourceSection';
import { VideoItem } from '@/components/video/VideoItem';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { PracticeVideo, TheoryVideo } from '@/lib/data';
import { downloadAllAsZipWithFolders } from '@/lib/zip';
import { useToast } from '@/components/ui/Toast';
import { clsx } from 'clsx';
import { BookOpen, Download, FileText, Loader2, PenTool, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface VideoListProps {
  practiceVideos: PracticeVideo[];
  theoryVideos: TheoryVideo[];
}

type Tab = 'practice' | 'theory' | 'material';

const TABS: { id: Tab; label: string; short: string; icon: React.ElementType }[] = [
  { id: 'practice', label: 'Clases Prácticas', short: 'Prácticas', icon: PenTool },
  { id: 'theory', label: 'Clases Teóricas', short: 'Teóricas', icon: BookOpen },
  { id: 'material', label: 'Material', short: 'Material', icon: FileText },
];

export function VideoList({ practiceVideos, theoryVideos }: VideoListProps) {
  const [activeTab, setActiveTab] = useState<Tab>('practice');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCuatri, setSelectedCuatri] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [materials, setMaterials] = useState<Record<string, any[]>>({});
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [viewingPDF, setViewingPDF] = useState<{ url: string; title: string } | null>(null);

  const { loading, update, error: toastError } = useToast();

  useEffect(() => {
    if (activeTab === 'material' && Object.keys(materials).length === 0) {
      setLoadingMaterials(true);
      fetch('/api/admin/resources')
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            toastError('No pudimos cargar el material', data.error);
          } else {
            setMaterials(data);
          }
        })
        .catch(() => toastError('Error al cargar material', 'Revisá tu conexión.'))
        .finally(() => setLoadingMaterials(false));
    }
  }, [activeTab, materials, toastError]);

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
      return theoryVideos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));
    }
    return [];
  }, [activeTab, search, selectedYear, selectedCuatri, practiceVideos, theoryVideos]);

  const selectedVideo = selectedIndex >= 0 ? filteredVideos[selectedIndex] : null;

  function handleDownloadAll() {
    if (!sortedUnitKeys.length || downloadingAll) return;
    setDownloadingAll(true);

    const unitMap: Record<string, { name: string; url: string }[]> = {};
    for (const unitTitle of sortedUnitKeys) {
      unitMap[unitTitle] = (materials[unitTitle] || []).map(f => ({
        name: f.title.endsWith('.pdf') ? f.title : `${f.title}.pdf`,
        url: `/api/resources/view?id=${encodeURIComponent(f.driveId)}&filename=${encodeURIComponent(f.title)}&download=true`,
      }));
    }

    const total = Object.values(unitMap).flat().length;
    const toastId = loading('Preparando descarga', `Empaquetando ${total} archivo${total === 1 ? '' : 's'}…`);

    downloadAllAsZipWithFolders(unitMap, 'material-completo', {
      onProgress: (completed, t) => {
        update(toastId, { description: `Descargando ${completed} de ${t}…` });
      },
      onError: (msg) => {
        update(toastId, { variant: 'error', title: 'Error en la descarga', description: msg, duration: 5000 });
        setDownloadingAll(false);
      },
      onDone: () => {
        update(toastId, { variant: 'success', title: 'Descarga lista', description: 'El ZIP se guardó en tu equipo.', duration: 4000 });
        setDownloadingAll(false);
      },
    });
  }

  return (
    <div className="space-y-7 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search + Filters */}
      <div className="bg-brand-bg-2/80 dark:bg-dark-bg-2/70 border border-brand-stroke dark:border-dark-stroke rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink-faint dark:text-dark-ink-faint group-focus-within:text-brand-accent dark:group-focus-within:text-dark-accent transition-colors" />
          <input
            type="text"
            placeholder={
              activeTab === 'practice' ? 'Buscar por título o fecha…' :
              activeTab === 'theory' ? 'Buscar por título…' :
              '¿Qué material estás buscando?'
            }
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-brand-bg-1/50 dark:bg-dark-bg-1/50 border border-brand-stroke dark:border-dark-stroke focus:bg-brand-bg-2 dark:focus:bg-dark-bg-2 rounded-xl text-sm sm:text-[15px] text-brand-ink dark:text-dark-ink placeholder:text-brand-ink-faint dark:placeholder:text-dark-ink-faint focus:outline-none focus:border-brand-accent dark:focus:border-dark-accent focus:ring-4 focus:ring-brand-accent-ring dark:focus:ring-dark-accent-ring transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-brand-ink-faint dark:text-dark-ink-faint hover:text-brand-ink dark:hover:text-dark-ink hover:bg-brand-stroke/50 dark:hover:bg-dark-stroke/50 active:scale-90 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activeTab === 'practice' && (
          <div className="flex gap-2">
            <FilterSelect
              ariaLabel="Filtrar por año"
              value={selectedYear}
              onChange={setSelectedYear}
              options={[{ value: 'all', label: 'Todos los años' }, ...years.map(y => ({ value: y.toString(), label: y.toString() }))]}
            />
            <FilterSelect
              ariaLabel="Filtrar por cuatrimestre"
              value={selectedCuatri}
              onChange={setSelectedCuatri}
              options={[
                { value: 'all', label: 'Ambos cuatris' },
                { value: '1', label: '1° Cuatri' },
                { value: '2', label: '2° Cuatri' },
              ]}
            />
          </div>
        )}
      </div>

      {/* Tabs — horizontal scroll on mobile, centered pills on md+ */}
      <div className="-mx-4 sm:mx-0 overflow-x-auto no-scrollbar">
        <div className="flex justify-start sm:justify-center px-4 sm:px-0">
          <div className="inline-flex p-1 bg-brand-bg-2/70 dark:bg-dark-bg-2/70 rounded-2xl border border-brand-stroke dark:border-dark-stroke backdrop-blur-md shadow-sm">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap active:scale-[0.97]',
                    active
                      ? 'bg-brand-accent dark:bg-dark-accent text-white shadow-md shadow-brand-accent/25 dark:shadow-dark-accent/25'
                      : 'text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-ink dark:hover:text-dark-ink',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="sm:hidden">{tab.short}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Material download-all action */}
      {activeTab === 'material' && !loadingMaterials && Object.keys(materials).length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="group flex items-center gap-2 px-4 py-2 bg-brand-bg-2 dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke rounded-xl text-xs font-semibold text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:border-brand-accent/40 dark:hover:border-dark-accent/40 active:scale-95 transition-[transform,color,border-color] disabled:opacity-70 disabled:cursor-wait"
          >
            {downloadingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
            )}
            <span>{downloadingAll ? 'Preparando…' : 'Descargar todo (ZIP)'}</span>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="pb-8">
        {activeTab !== 'material' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredVideos.map((v, index) => (
              <VideoItem
                key={v.id}
                video={v}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
            {filteredVideos.length === 0 && <EmptyState icon={Search} message="No encontramos clases con esos filtros." />}
          </div>
        ) : (
          <div className="space-y-5">
            {loadingMaterials ? (
              <MaterialSkeleton />
            ) : Object.keys(materials).length > 0 ? (
              sortedUnitKeys.map((unitTitle, unitIdx) => {
                const normalizedSearch = search.toLowerCase().trim();
                const filteredFiles = materials[unitTitle].filter(f =>
                  f.title.toLowerCase().includes(normalizedSearch) ||
                  unitTitle.toLowerCase().includes(normalizedSearch),
                );

                if (filteredFiles.length === 0 && normalizedSearch) return null;

                return (
                  <ResourceSection
                    key={unitTitle}
                    unitTitle={unitTitle}
                    resources={filteredFiles}
                    index={unitIdx}
                    onViewPDF={(url: string, title: string) => setViewingPDF({ url, title })}
                  />
                );
              })
            ) : (
              <EmptyState icon={FileText} message="No se encontró material educativo." />
            )}
          </div>
        )}
      </div>

      {viewingPDF && (
        <PDFViewer
          url={viewingPDF.url}
          title={viewingPDF.title}
          onClose={() => setViewingPDF(null)}
        />
      )}

      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          currentIndex={selectedIndex + 1}
          totalCount={filteredVideos.length}
          onClose={() => setSelectedIndex(-1)}
          onNext={selectedIndex < filteredVideos.length - 1 ? () => setSelectedIndex(i => i + 1) : undefined}
          onPrev={selectedIndex > 0 ? () => setSelectedIndex(i => i - 1) : undefined}
        />
      )}
    </div>
  );
}

function FilterSelect({
  value, onChange, options, ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="relative flex-1 md:flex-none">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full md:w-auto pl-3.5 pr-9 py-2.5 sm:py-3 bg-brand-bg-1/50 dark:bg-dark-bg-1/50 border border-brand-stroke dark:border-dark-stroke rounded-xl text-sm font-medium text-brand-ink dark:text-dark-ink cursor-pointer focus:outline-none focus:border-brand-accent dark:focus:border-dark-accent focus:ring-4 focus:ring-brand-accent-ring dark:focus:ring-dark-accent-ring transition-all"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-ink-soft dark:text-dark-ink-soft pointer-events-none"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M3 4.5 L6 7.5 L9 4.5" />
      </svg>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="col-span-full text-center py-20 sm:py-28 bg-brand-bg-2/40 dark:bg-dark-bg-2/30 rounded-3xl border border-dashed border-brand-stroke dark:border-dark-stroke">
      <Icon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-brand-ink-faint dark:text-dark-ink-faint" strokeWidth={1.5} />
      <p className="font-serif text-lg sm:text-xl text-brand-ink-soft dark:text-dark-ink-soft">{message}</p>
    </div>
  );
}

function MaterialSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden bg-brand-bg-2/60 dark:bg-dark-bg-2/40 border border-brand-stroke dark:border-dark-stroke rounded-2xl p-5 sm:p-6"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-brand-stroke dark:bg-dark-stroke rounded-full" />
              <div className="h-6 w-2/3 bg-brand-stroke dark:bg-dark-stroke rounded-md" />
            </div>
            <div className="w-10 h-10 bg-brand-stroke dark:bg-dark-stroke rounded-xl" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent bg-[length:200%_100%] animate-shimmer pointer-events-none" />
        </div>
      ))}
      <div className="flex items-center justify-center gap-3 py-6">
        <Loader2 className="w-4 h-4 text-brand-accent dark:text-dark-accent animate-spin" />
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-ink-soft dark:text-dark-ink-soft">Cargando material</p>
      </div>
    </div>
  );
}
