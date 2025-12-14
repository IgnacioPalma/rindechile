import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import { useFormatters } from '@/app/lib/hooks/useFormatters';
import type { NodeLegendItem } from '@/types/sankey';

interface SankeyNodeLegendProps {
  nodes: NodeLegendItem[];
  isExpanded: boolean;
  onToggle: () => void;
}

export function SankeyNodeLegend({ nodes, isExpanded, onToggle }: SankeyNodeLegendProps) {
  const { formatCurrency } = useFormatters();

  if (nodes.length === 0) return null;

  const lastLetter = nodes[nodes.length - 1]?.letter || 'Z';

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} className="mt-4">
      <CollapsibleTrigger asChild>
        <button
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
          aria-expanded={isExpanded}
        >
          <span>Ver leyenda (A-{lastLetter})</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {nodes.map((node) => (
              <div
                key={node.letter}
                className="flex items-center gap-3 px-4 py-2 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary shrink-0">
                  {node.letter}
                </span>
                <span className="flex-1 text-sm truncate" title={node.name}>
                  {node.name}
                </span>
                <span className="text-sm font-medium tabular-nums shrink-0">
                  {formatCurrency(node.value)}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-12 text-right">
                  {node.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
