import { normalizedYoutubeLinks, normalizedFidelLinks } from '@/lib/data';
import { VideoList } from '@/components/video/VideoList';
import { Header } from '@/components/layout/Header';
import { verifyAuth, checkIsAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await verifyAuth();
  
  if (!user) {
    redirect('/login');
  }

  // Load data + admin check in parallel
  const [practiceVideos, theoryVideos, isAdmin] = await Promise.all([
    normalizedYoutubeLinks(),
    normalizedFidelLinks(),
    checkIsAdmin(),
  ]);

  return (
    <main className="min-h-screen pb-20 overflow-x-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 dark:bg-brand-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10 animate-pulse"></div>
      <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/2 -z-10"></div>

      <Header username={user.username} isAdmin={isAdmin} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20 relative">
        <VideoList 
          practiceVideos={practiceVideos} 
          theoryVideos={theoryVideos} 
        />
      </div>
    </main>
  );
}

