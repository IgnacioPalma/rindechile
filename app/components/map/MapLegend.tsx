import type { ColorScale } from '@/types/map';
import { Badge } from '@/app/components/ui/badge';

interface MapLegendProps {
  colorScale: ColorScale;
  showStatistics?: boolean;
  nationalAverage?: number;
}

export function MapLegend({ colorScale, showStatistics = true, nationalAverage }: MapLegendProps) {
  const { breakpoints } = colorScale;
  
  return (
    <div className="w-full space-y-3">
      {/* Legend Title and Stats */}
      <div className="flex items-center justify-between">
        <div className="text-white/70 text-xs font-light">
          Porcentaje de compras con sobreprecio
        </div>
        {showStatistics && nationalAverage !== undefined && (
          <Badge variant="outline" className="bg-white/5 text-white/80 border-white/20">
            Promedio nacional: {nationalAverage.toFixed(2)}%
          </Badge>
        )}
      </div>

      {/* Discrete tier segments */}
      <div className="flex items-center gap-4">
        {breakpoints.map((breakpoint, index) => {
          const nextThreshold = breakpoints[index + 1]?.threshold || 100;
          
          return (
            <div key={breakpoint.label} className="flex-1 flex flex-col gap-1">
              {/* Color box */}
              <div 
                className="h-3 rounded-sm"
                style={{ backgroundColor: breakpoint.color }}
              />
              {/* Label and range */}
              <div className="text-white/80 text-xs font-light text-center">
                <div className="font-medium">{breakpoint.label}</div>
                <div className="text-white/60">
                  {breakpoint.threshold}%-{nextThreshold}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
