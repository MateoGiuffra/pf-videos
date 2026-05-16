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
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group text-left bg-brand-bg-2/80 dark:bg-dark-bg-2/60 border border-brand-stroke dark:border-dark-stroke rounded-2xl overflow-hidden',
        'transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5',
        'hover:shadow-[0_18px_40px_-15px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_18px_40px_-15px_rgba(0,0,0,0.7)]',
        'hover:border-brand-accent/40 dark:hover:border-dark-accent/40',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent dark:focus-visible:ring-dark-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg-1 dark:focus-visible:ring-offset-dark-bg-1',
      )}
    >
      <div className="aspect-video relative bg-brand-bg-1 dark:bg-dark-bg-1 overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/95 dark:bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur transition-all duration-300 group-hover:scale-110 group-active:scale-95">
            <Play className="w-4 h-4 text-brand-accent fill-brand-accent ml-0.5" />
          </div>
        </div>

        {/* Top-left badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur',
            isPractice
              ? 'bg-brand-accent/90 dark:bg-dark-accent/90 text-white'
              : 'bg-brand-ink/85 dark:bg-white/95 text-white dark:text-brand-ink',
          )}>
            {isPractice ? 'Práctica' : 'Teoría'}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <h3 className="font-semibold text-[15px] leading-snug text-brand-ink dark:text-dark-ink line-clamp-2 min-h-[2.6rem] group-hover:text-brand-accent dark:group-hover:text-dark-accent transition-colors">
          {video.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] text-brand-ink-soft dark:text-dark-ink-soft">
          {isPractice ? (
            <>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {video.date}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-accent-soft dark:bg-dark-accent-soft text-brand-accent dark:text-dark-accent font-semibold">
                {video.year}
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {video.duration}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {video.views.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
