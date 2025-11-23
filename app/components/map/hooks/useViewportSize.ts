import { useEffect, useState } from 'react';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export interface UseViewportSizeOptions {
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

/**
 * Custom hook to detect viewport size based on configurable breakpoints
 * @param options - Configuration for breakpoint thresholds
 * @returns Current viewport size category
 */
export function useViewportSize(options?: UseViewportSizeOptions): ViewportSize {
  const mobileBreakpoint = options?.mobileBreakpoint ?? 768;
  const tabletBreakpoint = options?.tabletBreakpoint ?? 1154;

  const [viewportSize, setViewportSize] = useState<ViewportSize>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < mobileBreakpoint) return 'mobile';
    if (width < tabletBreakpoint) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const checkViewportSize = () => {
      const width = window.innerWidth;
      if (width < mobileBreakpoint) {
        setViewportSize('mobile');
      } else if (width < tabletBreakpoint) {
        setViewportSize('tablet');
      } else {
        setViewportSize('desktop');
      }
    };

    window.addEventListener('resize', checkViewportSize);
    return () => window.removeEventListener('resize', checkViewportSize);
  }, [mobileBreakpoint, tabletBreakpoint]);

  return viewportSize;
}
