'use client';

import { Header } from '@/components/layout/Header';
import { ArrowLeft, Book, Code, MessageCircle, Earth, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function InfoPage() {
  return (
    <main className="min-h-dvh overflow-x-hidden">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent group transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Volver al buscador
        </Link>

        <header className="mb-10 sm:mb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-brand-accent dark:text-dark-accent mb-3">
            Sobre el proyecto
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-brand-ink dark:text-dark-ink tracking-tight leading-[1.05]">
            Una manera ordenada de revisar las clases.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-brand-ink-soft dark:text-dark-ink-soft leading-relaxed max-w-2xl">
            Videos PF centraliza las clases grabadas y el material de Programación Funcional en un solo lugar,
            con búsqueda por título, fecha, año y cuatrimestre.
          </p>
        </header>

        <div className="space-y-10">
          <Section icon={Book} title="Propósito">
            <p>
              Una herramienta complementaria que reúne los enlaces de YouTube y los PDFs que suelen
              circular por Discord y Aulas CPI. Los datos provienen de la cátedra y la comunidad,
              normalizados para una experiencia de búsqueda unificada.
            </p>
          </Section>

          <Section icon={Earth} title="Cómo funciona el acceso">
            <p>
              El acceso está restringido a alumnos. Tus credenciales de <strong className="text-brand-ink dark:text-dark-ink">Aulas CPI</strong>{' '}
              se validan en tiempo real contra la plataforma oficial mediante un puente seguro.
            </p>
            <p className="flex gap-3 mt-4 p-3.5 rounded-xl bg-brand-accent-soft dark:bg-dark-accent-soft border border-brand-accent/15 dark:border-dark-accent/15 text-sm">
              <ShieldCheck className="w-4 h-4 text-brand-accent dark:text-dark-accent shrink-0 mt-0.5" />
              <span className="text-brand-ink-soft dark:text-dark-ink-soft leading-relaxed">
                Tus credenciales nunca se almacenan en nuestros servidores; solo se usan
                para validar la sesión actual.
              </span>
            </p>
          </Section>

          <div className="h-px bg-brand-stroke dark:bg-dark-stroke" />

          <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
            <div className="flex gap-2">
              <a
                href="#"
                aria-label="Repositorio"
                className="p-2.5 rounded-xl bg-brand-bg-2 dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:border-brand-accent/40 dark:hover:border-dark-accent/40 active:scale-95 transition-all"
              >
                <Code className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Contacto"
                className="p-2.5 rounded-xl bg-brand-bg-2 dark:bg-dark-bg-2 border border-brand-stroke dark:border-dark-stroke text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent dark:hover:text-dark-accent hover:border-brand-accent/40 dark:hover:border-dark-accent/40 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-ink-soft dark:text-dark-ink-soft">
              Hecho con cariño para la comunidad PF
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-brand-accent-soft dark:bg-dark-accent-soft flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-accent dark:text-dark-accent" />
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-black text-brand-ink dark:text-dark-ink tracking-tight">
          {title}
        </h2>
      </div>
      <div className="text-brand-ink-soft dark:text-dark-ink-soft leading-relaxed space-y-3 max-w-2xl">
        {children}
      </div>
    </section>
  );
}
