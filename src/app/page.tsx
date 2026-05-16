import { normalizedYoutubeLinks, normalizedFidelLinks } from '@/lib/data';
import { VideoList } from '@/components/video/VideoList';
import { Header } from '@/components/layout/Header';
import { DismissOverlayOnMount } from '@/components/ui/GlobalOverlay';
import { verifyAuth, checkIsAdmin } from '@/lib/auth';
import { ENV } from '@/config/env';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await verifyAuth();

  if (!user) {
    redirect('/login');
  }

  const [practiceVideos, theoryVideos, isAdmin] = await Promise.all([
    normalizedYoutubeLinks(),
    normalizedFidelLinks(),
    checkIsAdmin(),
  ]);

  return (
    <main className="min-h-dvh overflow-x-hidden">
      <DismissOverlayOnMount />
      <Header username={user.username} isAdmin={isAdmin} admin={isAdmin ? ENV.ADMIN : undefined} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-24 relative">
        {/* Subtle eyebrow */}
        <div className="mb-6 sm:mb-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-brand-stroke dark:bg-dark-stroke" />
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-brand-ink-soft dark:text-dark-ink-soft shrink-0">
            Repositorio · Programación Funcional
          </p>
          <div className="h-px flex-1 bg-brand-stroke dark:bg-dark-stroke" />
        </div>

        <VideoList practiceVideos={practiceVideos} theoryVideos={theoryVideos} />
      </div>
    </main>
  );
}
