'use client';

import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { GlobalOverlayProvider } from '@/components/ui/GlobalOverlay';
import { MaterialsProvider } from '@/components/material/MaterialsProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <GlobalOverlayProvider>
        <ToastProvider>
          <MaterialsProvider>
            {children}
          </MaterialsProvider>
        </ToastProvider>
      </GlobalOverlayProvider>
    </ThemeProvider>
  );
}
