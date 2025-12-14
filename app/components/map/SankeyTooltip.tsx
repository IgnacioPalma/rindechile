import { useFormatters } from '@/app/lib/hooks/useFormatters';
import type { SankeyTooltipData } from '@/types/sankey';

interface SankeyTooltipProps {
  data: SankeyTooltipData | null;
}

export function SankeyTooltip({ data }: SankeyTooltipProps) {
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
          {data.type === 'link' ? (
            // Link tooltip: shows flow from source to target
            <>
              <div className="text-sm font-medium">
                {data.sourceName} → {data.targetName}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(data.value)}
              </div>
              <div className="text-xs text-muted-foreground">
                {data.percentage.toFixed(1)}% del flujo
              </div>
            </>
          ) : (
            // Node tooltip: shows node details
            <>
              <div className="text-sm font-medium">{data.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(data.value)}
              </div>
              <div className="text-xs text-muted-foreground">
                {data.percentage.toFixed(1)}% del total
              </div>
            </>
          )}
        </div>
      )}

      {/* Screen reader live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {data
          ? data.type === 'link'
            ? `Flujo de ${data.sourceName} a ${data.targetName}, ${formatCurrency(data.value)}, ${data.percentage.toFixed(1)}% del flujo`
            : `${data.name}, ${formatCurrency(data.value)}, ${data.percentage.toFixed(1)}% del total${
                data.overpricingRate !== undefined
                  ? `, sobreprecio ${(data.overpricingRate * 100).toFixed(1)}%`
                  : ''
              }`
          : ''}
      </div>
    </>
  );
}
