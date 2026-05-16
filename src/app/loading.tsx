export default function Loading() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-brand-accent/30 dark:bg-dark-accent/30 blur-3xl rounded-full" />
        <div className="relative w-14 h-14 rounded-2xl bg-brand-accent dark:bg-dark-accent flex items-center justify-center shadow-xl shadow-brand-accent/30 dark:shadow-dark-accent/30">
          <span className="font-serif font-black text-white text-2xl">PF</span>
        </div>
      </div>

      <div className="mt-7 w-32 h-[2px] bg-brand-stroke dark:bg-dark-stroke rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-brand-accent dark:via-dark-accent to-transparent animate-scan" />
      </div>

      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-brand-ink-soft dark:text-dark-ink-soft">
        Preparando repositorio
      </p>
    </div>
  );
}
