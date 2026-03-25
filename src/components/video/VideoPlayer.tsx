'use client';

import { PracticeVideo, TheoryVideo } from '@/lib/data';
import { Calendar, ChevronLeft, ChevronRight, Clock, ExternalLink, Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const isPractice = 'year' in video;
  const pVideo = video as PracticeVideo;
  const tVideo = video as TheoryVideo;

  // Reset loading state when video changes
  useEffect(() => {
    setIsLoading(true);
  }, [video.id]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 
bg-white/10 backdrop-blur-md 
animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-all duration-500"
        onClick={onClose}
      />

      {/* Top Right Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 md:top-10 md:right-10 z-[120] p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-xl transition-all active:scale-95 group border border-white/10 hover:border-white/20"
        aria-label="Cerrar reproducción"
      >
        <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Navigation Arrows */}
      {onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 md:left-12 z-[110] p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-all active:scale-90 group hidden md:block"
          aria-label="Video anterior"
        >
          <ChevronLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      {onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 md:right-12 z-[110] p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-all active:scale-90 group hidden md:block"
          aria-label="Siguiente video"
        >
          <ChevronRight className="w-10 h-10 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Index Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/80 text-xs font-bold tracking-widest uppercase">
        Video {currentIndex} de {totalCount}
      </div>

      {/* Player Container */}
      <div
        key={video.id}
        className="relative w-full max-w-6xl aspect-video bg-gray-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-right-8 duration-500 ease-out border border-white/5"
      >
        {/* Skeleton Loader */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-md">
            <div className="w-full h-full animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-shimmer" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-white/20 border-t-brand-accent rounded-full animate-spin" />
              <p className="text-white/60 font-bold tracking-widest text-xs uppercase animate-pulse">Cargando Clase...</p>
            </div>
          </div>
        )}

        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
          title={video.title}
          className={`w-full h-full border-0 transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />

        {/* Header/Controls Overlay (Shown only on hover or touch) */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start opacity-0 hover:opacity-100 transition-opacity">
          <div className="text-white max-w-[80%]">
            <h2 className="text-lg md:text-2xl font-bold line-clamp-1">{video.title}</h2>
            <div className="flex gap-4 mt-1 text-xs md:text-sm text-gray-300 items-center">
              {isPractice ? (
                <>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {pVideo.date}
                  </div>
                  <div className="bg-white/20 px-2 py-0.5 rounded-full">{pVideo.year} - {pVideo.cuatris.join('°')}&deg; Cuatri</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tVideo.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {tVideo.views} vistas
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur transition-all"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
            <button
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
