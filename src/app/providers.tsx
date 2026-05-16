'use client';

import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { GlobalOverlayProvider } from '@/components/ui/GlobalOverlay';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <GlobalOverlayProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </GlobalOverlayProvider>
    </ThemeProvider>
  );
}
