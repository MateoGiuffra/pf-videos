'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';

interface OverlayState {
  title: string;
  subtitle?: string;
}

interface OverlayContextValue {
  show: (state: OverlayState) => void;
  hide: () => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function useGlobalOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useGlobalOverlay must be used within <GlobalOverlayProvider>');
  return ctx;
}

export function GlobalOverlayProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayState | null>(null);

  const show = useCallback((state: OverlayState) => setOverlay(state), []);
  const hide = useCallback(() => setOverlay(null), []);

  return (
    <OverlayContext.Provider value={{ show, hide }}>
      {children}
      {overlay && <FullScreenLoader title={overlay.title} subtitle={overlay.subtitle} />}
    </OverlayContext.Provider>
  );
}

/** Drop-in component: dismisses any active global overlay when the host page mounts. */
export function DismissOverlayOnMount() {
  const { hide } = useGlobalOverlay();
  useEffect(() => { hide(); }, [hide]);
  return null;
}
