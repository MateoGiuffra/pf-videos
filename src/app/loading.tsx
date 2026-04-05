export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg-1 dark:bg-dark-bg-1">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 dark:bg-brand-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-500/30 animate-pulse">
          <span className="text-white font-serif font-bold text-3xl">PF</span>
        </div>

        {/* Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-brand-stroke dark:border-dark-stroke" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-accent animate-spin" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-brand-accent animate-pulse">
            Cargando
          </p>
          <p className="text-xs font-medium text-brand-ink-soft dark:text-dark-ink-soft">
            Preparando el repositorio…
          </p>
        </div>
      </div>
    </div>
  );
}
