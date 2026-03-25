import { normalizedYoutubeLinks, normalizedFidelLinks } from '@/lib/data';
import { VideoList } from '@/components/video/VideoList';
import { Header } from '@/components/layout/Header';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await verifyAuth();
  
  if (!user) {
    redirect('/login');
  }

  // Load data
  const practiceVideos = await normalizedYoutubeLinks();
  const theoryVideos = await normalizedFidelLinks();

  return (
    <main className="min-h-screen pb-20 overflow-x-hidden">
      <Header username={user.username} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <VideoList 
          practiceVideos={practiceVideos} 
          theoryVideos={theoryVideos} 
        />
      </div>
    </main>
  );
}
