'use client';

import { PracticeVideo, TheoryVideo } from '@/lib/data';
import { Calendar, ChevronLeft, ChevronRight, Clock, ExternalLink, Eye, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  video: PracticeVideo | TheoryVideo;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function VideoPlayer({ video, currentIndex, totalCount, onClose, onNext, onPrev }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const isPractice = 'year' in video;
  const pVideo = video as PracticeVideo;
  const tVideo = video as TheoryVideo;

  useEffect(() => {
    setIsLoading(true);
  }, [video.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 70) {
      if (dx < 0 && onNext) onNext();
      else if (dx > 0 && onPrev) onPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute inset-0 cursor-default"
      />

      {/* Top control bar (always visible) */}
      <div className="absolute top-0 inset-x-0 z-[110] pt-safe">
        <div className="px-4 sm:px-6 lg:px-10 pt-3 sm:pt-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90">
              {currentIndex} <span className="text-white/50">/ {totalCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 text-white active:scale-95 transition-all"
              aria-label="Abrir en YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              aria-label="Cerrar reproductor"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 text-white active:scale-95 transition-all group"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop nav arrows */}
      {onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="hidden md:flex absolute left-4 lg:left-8 z-[110] w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 text-white active:scale-90 transition-all"
          aria-label="Video anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="hidden md:flex absolute right-4 lg:right-8 z-[110] w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 text-white active:scale-90 transition-all"
          aria-label="Siguiente video"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Player */}
      <div
        key={video.id}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-400 ease-out"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-shimmer" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-[3px] border-white/15 border-t-white rounded-full animate-spin" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">Cargando clase</p>
            </div>
          </div>
        )}

        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
          title={video.title}
          className={`w-full h-full border-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Bottom info + mobile nav */}
      <div className="absolute inset-x-0 bottom-0 z-[110] pb-safe">
        <div className="px-4 sm:px-6 lg:px-10 pb-3 sm:pb-5">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-white text-sm sm:text-base font-semibold line-clamp-1">{video.title}</h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] sm:text-[11px] text-white/60">
                {isPractice ? (
                  <>
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{pVideo.date}</span>
                    <span>{pVideo.year} · {pVideo.cuatris.join('°/')}° Cuatri</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{tVideo.duration}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{tVideo.views.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Mobile prev/next */}
            <div className="flex items-center gap-1.5 md:hidden shrink-0">
              {onPrev && (
                <button
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  aria-label="Anterior"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/15 text-white active:scale-90 transition-transform"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {onNext && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  aria-label="Siguiente"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/15 text-white active:scale-90 transition-transform"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
