import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg-1 dark:bg-dark-bg-1 px-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 dark:bg-brand-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8 text-center max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Logo */}
        <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-500/30">
          <span className="text-white font-serif font-bold text-3xl">PF</span>
        </div>

        {/* 404 number */}
        <div className="relative">
          <span className="text-[8rem] font-serif font-black leading-none text-brand-stroke dark:text-dark-stroke select-none">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-[8rem] font-serif font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-brand-accent/40 to-blue-500/40 select-none blur-[1px]">
            404
          </span>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-serif font-black text-brand-ink dark:text-dark-ink">
            Página no encontrada
          </h1>
          <p className="text-brand-ink-soft dark:text-dark-ink-soft font-medium leading-relaxed">
            La página que buscás no existe o fue movida a otra dirección.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="flex items-center gap-2 px-8 py-3.5 bg-brand-accent text-white rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
