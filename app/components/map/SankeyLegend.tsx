interface SankeyLegendProps {
  breadcrumbsLength: number;
}

export function SankeyLegend({ breadcrumbsLength }: SankeyLegendProps) {
  const getHelperText = () => {
    if (breadcrumbsLength === 1) {
      return 'Haz clic en una letra para explorar';
    } else if (breadcrumbsLength === 2) {
      return 'Haz clic para ver familias';
    } else if (breadcrumbsLength === 3) {
      return 'Haz clic para ver clases';
    }
    return 'Nivel final';
  };

  const helperText = getHelperText();

  return (
    <div className="mt-4 flex items-center justify-center gap-4 text-xs flex-wrap">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-4 rounded"
          style={{ background: 'oklch(0.5869 0.0025 345.21)' }}
        />
        <span>Total</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-8 rounded"
          style={{ background: 'linear-gradient(to right, oklch(0.652 0.236 320.67), oklch(0.652 0.236 150.67))' }}
        />
        <span>Monto: Bajo → Alto</span>
      </div>
      {helperText && (
        <span className="text-muted-foreground ml-4">{helperText}</span>
      )}
    </div>
  );
}
