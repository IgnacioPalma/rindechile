import { useFormatters } from '@/app/lib/hooks/useFormatters';

interface TreemapTooltipProps {
  data: {
    name: string;
    value: number;
    overpricingRate: number;
    x: number;
    y: number;
  } | null;
}

export function TreemapTooltip({ data }: TreemapTooltipProps) {
  const { formatCurrency } = useFormatters();

  // Always render the container for aria-live to work properly
  return (
    <>
      {/* Visual tooltip */}
      {data && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-border bg-background px-3 py-2 shadow-lg"
          style={{
            left: `${data.x}px`,
            top: `${data.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          aria-hidden="true"
        >
          <div className="text-sm font-medium">{data.name}</div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(data.value)}
          </div>
        </div>
      )}

      {/* Screen reader live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {data ? `${data.name}, ${formatCurrency(data.value)}, sobreprecio ${(data.overpricingRate * 100).toFixed(1)}%` : ''}
      </div>
    </>
  );
}
