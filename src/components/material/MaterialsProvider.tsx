'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { useToast } from '@/components/ui/Toast';

type Materials = Record<string, any[]>;

interface MaterialsContextValue {
  materials: Materials;
  loading: boolean;
  loaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
}

const MaterialsContext = createContext<MaterialsContextValue | null>(null);

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const [materials, setMaterials] = useState<Materials>({});
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { error: toastError } = useToast();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resources');
      const data = await res.json();
      if (data.error) {
        toastError('No pudimos cargar el material', data.error);
        return;
      }
      setMaterials(data);
      setLoaded(true);
    } catch {
      toastError('Error al cargar material', 'Revisá tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  const ensureLoaded = useCallback(() => {
    if (loaded || loading) return;
    fetchMaterials();
  }, [loaded, loading, fetchMaterials]);

  const refresh = useCallback(async () => {
    await fetchMaterials();
  }, [fetchMaterials]);

  return (
    <MaterialsContext.Provider value={{ materials, loading, loaded, ensureLoaded, refresh }}>
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterials() {
  const ctx = useContext(MaterialsContext);
  if (!ctx) throw new Error('useMaterials must be used inside MaterialsProvider');
  return ctx;
}
