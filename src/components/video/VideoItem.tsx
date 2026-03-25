'use client';

import { PracticeVideo, TheoryVideo } from '@/lib/data';
import { Play, Calendar, Eye, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface VideoItemProps {
  video: PracticeVideo | TheoryVideo;
  onClick: () => void;
}

export function VideoItem({ video, onClick }: VideoItemProps) {
  const isPractice = 'timestamp' in video;
  
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "group cursor-pointer bg-brand-card dark:bg-dark-card border border-brand-stroke dark:border-dark-stroke rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative",
        isPractice ? "border-b-4 border-b-brand-accent/50" : "border-b-4 border-b-red-500/50"
      )}
    >
      {/* Thumbnail Placeholder with Play Button Icon */}
      <div className="aspect-video relative bg-brand-bg-2 dark:bg-dark-bg-2 flex items-center justify-center overflow-hidden">
        <img 
          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} 
          alt={video.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
        <div className="absolute w-12 h-12 bg-white/90 dark:bg-dark-bg-1/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Play className="w-5 h-5 text-brand-accent fill-brand-accent ml-0.5" />
        </div>
      </div>

      <div className="p-5 space-y-3">
        <h3 className="font-bold text-base leading-tight text-brand-ink dark:text-dark-ink line-clamp-2 min-h-[3rem] group-hover:text-brand-accent transition-colors">
          {video.title}
        </h3>

        <div className="flex flex-wrap gap-3 text-xs text-brand-ink-soft dark:text-dark-ink-soft font-medium">
          {isPractice ? (
            <>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {video.date}
              </div>
              <div className="flex items-center gap-1">
                <span className="bg-brand-accent-soft text-brand-accent px-2 py-0.5 rounded-full">
                  {video.year}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {video.duration}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {video.views.toLocaleString()} vistas
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
