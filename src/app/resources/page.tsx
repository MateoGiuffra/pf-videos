import { Header } from '@/components/layout/Header';
import { verifyAuth } from '@/lib/auth';
import { scrapeResources, Section } from '@/lib/resources';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ResourcesList } from '@/components/video/ResourcesList';
import { FileText } from 'lucide-react';

export default async function ResourcesPage() {
  const user = await verifyAuth();
  
  if (!user) {
    redirect('/login');
  }

  // Get Moodle session cookie
  const cookieStore = await cookies();
  const moodleSession = cookieStore.get('moodle_session')?.value;

  let sections: Section[] = [];
  try {
    sections = await scrapeResources(moodleSession);
  } catch (error: any) {
    console.error('[Resources Page Fetch Error]:', error);
    // If Moodle session expired, redirect to login
    if (error.message?.includes('expirado') || error.message?.includes('expired') || error.message?.includes('sesión')) {
      const cookieStore = await cookies();
      cookieStore.delete('auth_token');
      cookieStore.delete('moodle_session');
      redirect('/login');
    }
  }

  return (
    <main className="min-h-screen pb-20 overflow-x-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 dark:bg-brand-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10 animate-pulse"></div>
      <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/2 -z-10"></div>

      <Header username={user.username} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-20 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-accent/10 dark:bg-brand-accent/20 rounded-[1.25rem] shadow-inner shadow-brand-accent/5">
                 <FileText className="w-8 h-8 text-brand-accent" />
              </div>
              <div className="h-10 w-[2px] bg-gradient-to-b from-brand-accent to-transparent rounded-full ml-1"></div>
              <h1 className="text-5xl font-serif font-black text-brand-ink dark:text-dark-ink tracking-tight bg-gradient-to-br from-brand-ink to-brand-ink-soft dark:from-dark-ink dark:to-dark-ink-soft bg-clip-text">
                Recursos
              </h1>
            </div>
            <p className="text-lg text-brand-ink-soft dark:text-dark-ink-soft max-w-xl font-medium leading-relaxed opacity-80">
              Explora el repositorio completo de guías, diapositivas y material bibliográfico diseñado para potenciar tu cursada.
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-white/50 dark:bg-dark-card/50 backdrop-blur-md border border-brand-stroke/40 dark:border-dark-stroke/40 px-8 py-5 rounded-[2rem] shadow-2xl ring-1 ring-black/5 dark:ring-white/5 self-start lg:self-center">
             <div className="flex flex-col items-center group cursor-default">
               <span className="text-3xl font-black text-brand-accent group-hover:scale-110 transition-transform duration-300">
                 {sections.reduce((acc, s) => acc + s.resources.length, 0)}
               </span>
               <span className="text-[10px] uppercase font-black text-brand-ink-soft/40 dark:text-dark-ink-soft/40 tracking-[0.2em]">Archivos</span>
             </div>
             <div className="w-[1px] h-10 bg-brand-stroke dark:bg-dark-stroke"></div>
             <div className="flex flex-col items-center group cursor-default">
               <span className="text-3xl font-black text-brand-accent group-hover:scale-110 transition-transform duration-300">
                 {sections.length}
               </span>
               <span className="text-[10px] uppercase font-black text-brand-ink-soft/40 dark:text-dark-ink-soft/40 tracking-[0.2em]">Módulos</span>
             </div>
          </div>
        </div>

        <ResourcesList initialSections={sections} />
      </div>
    </main>
  );
}
