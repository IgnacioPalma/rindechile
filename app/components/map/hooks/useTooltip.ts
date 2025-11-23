import { useCallback, useState } from 'react';

export interface TooltipData {
  name: string;
  overpricing: number | null;
  x: number;
  y: number;
}

export interface UseTooltipReturn {
  tooltip: TooltipData | null;
  showTooltip: (data: Omit<TooltipData, 'x' | 'y'>, event: React.MouseEvent) => void;
  hideTooltip: () => void;
}

/**
 * Custom hook to manage tooltip state for map visualizations
 * @returns Tooltip state and handlers
 */
export function useTooltip(): UseTooltipReturn {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const showTooltip = useCallback((data: Omit<TooltipData, 'x' | 'y'>, event: React.MouseEvent) => {
    setTooltip({
      ...data,
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  return {
    tooltip,
    showTooltip,
    hideTooltip,
  };
}
