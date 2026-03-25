'use client';

import { Header } from '@/components/layout/Header';
import { ArrowLeft, Book, Code, MessageCircle, Earth } from 'lucide-react';
import Link from 'next/link';

export default function InfoPage() {
  return (
    <main className="min-h-screen pb-20 overflow-x-hidden">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="bg-brand-card dark:bg-dark-card border border-brand-stroke dark:border-dark-stroke rounded-3xl p-8 md:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-accent hover:translate-x-1 transition-transform mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al buscador
          </Link>

          <header className="mb-10">
            <h1 className="font-serif text-4xl md:text-5xl text-brand-ink dark:text-dark-ink mb-4">Sobre Videos PF</h1>
            <p className="text-brand-ink-soft dark:text-dark-ink-soft text-lg leading-relaxed">
              Este repositorio fue creado para facilitar el acceso a las clases grabadas de Programación Funcional, 
              organizando el contenido de manera intuitiva y accesible.
            </p>
          </header>

          <div className="space-y-10">
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-brand-ink dark:text-dark-ink">
                <Book className="w-5 h-5 text-brand-accent" />
                Propósito del proyecto
              </h2>
              <div className="text-brand-ink-soft dark:text-dark-ink-soft space-y-4 leading-relaxed">
                <p>
                  Videos PF es una herramienta complementaria que permite buscar clases por título, fecha, año y cuatrimestre. 
                  Busca centralizar los links de YouTube que suelen compartirse en Discord y Aulas CPI.
                </p>
                <p>
                  El proyecto utiliza los datos proporcionados por la cátedra y la comunidad, normalizándolos para ofrecer
                  una experiencia de búsqueda unificada.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-brand-ink dark:text-dark-ink">
                <Earth className="w-5 h-5 text-brand-accent" />
                Cómo funciona
              </h2>
              <div className="text-brand-ink-soft dark:text-dark-ink-soft space-y-4 leading-relaxed">
                <p>
                  El acceso está restringido a alumnos de la materia. Por eso, solicitamos iniciar sesión con tus credenciales
                  de <strong>Aulas CPI</strong>. Este proceso se realiza mediante un puente (proxy) que verifica tus datos
                  directamente con la plataforma oficial.
                </p>
                <p className="bg-yellow-500/10 dark:bg-yellow-500/5 border-l-4 border-yellow-500 p-4 rounded text-sm italic">
                  Tus credenciales nunca son almacenadas en nuestros servidores. Solo se utilizan para validar la sesión actual.
                </p>
              </div>
            </section>

            <hr className="border-brand-stroke dark:border-dark-stroke" />

            <footer className="pt-4 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-brand-bg-2 dark:bg-dark-bg-2 rounded-xl text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent hover:scale-110 transition-all border border-brand-stroke dark:border-dark-stroke shadow-sm">
                  <Code className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 bg-brand-bg-2 dark:bg-dark-bg-2 rounded-xl text-brand-ink-soft dark:text-dark-ink-soft hover:text-brand-accent hover:scale-110 transition-all border border-brand-stroke dark:border-dark-stroke shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
              <p className="text-xs text-brand-ink-soft dark:text-dark-ink-soft font-medium uppercase tracking-widest">
                Creado para la comunidad de PF &copy; 2024
              </p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
