'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { TreemapHierarchy, TreemapNode } from '@/types/map';
import type { SankeyLayoutNode, NodeLegendItem } from '@/types/sankey';
import { useTreemapNavigation } from './hooks/useTreemapNavigation';
import { useSankeyRenderer } from './hooks/useSankeyRenderer';
import { useResponsiveDimensions } from './hooks/useResponsiveDimensions';
import { transformToSankeyData } from '@/app/lib/sankey-transform';
import { SankeyBreadcrumbs } from './SankeyBreadcrumbs';
import { SankeyNodeLegend } from './SankeyNodeLegend';
import { SankeyLegend } from './SankeyLegend';

interface SankeyChartProps {
  data: TreemapHierarchy;
  level: 'country' | 'region' | 'municipality';
  code?: string;
}

export function SankeyChart({ data: initialData, level, code }: SankeyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Legend state
  const [legendNodes, setLegendNodes] = useState<NodeLegendItem[]>([]);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);

  // Custom hooks for navigation and rendering
  const {
    data,
    breadcrumbs,
    loading,
    handleDrillDown,
    handleBreadcrumbClick,
    resetNavigation,
  } = useTreemapNavigation({ initialData, level, code });

  const dimensions = useResponsiveDimensions(containerRef);

  // Transform TreemapHierarchy to SankeyData
  const sankeyData = useMemo(() => transformToSankeyData(data), [data]);

  // Handle node click - convert SankeyLayoutNode back to TreemapNode for navigation
  const handleNodeClick = useCallback((node: SankeyLayoutNode) => {
    // Only handle clicks on target nodes (not source)
    if (node.type === 'source' || !node.isClickable || node.originalId === undefined) {
      return;
    }

    // Convert to TreemapNode format for the navigation hook
    const treemapNode: TreemapNode = {
      id: node.originalId,
      name: node.name,
      value: node.value,
      overpricingRate: node.overpricingRate || 0,
      type: node.type as 'category' | 'segment' | 'family' | 'class',
    };

    handleDrillDown(treemapNode);
  }, [handleDrillDown]);

  // Reset data and legend when initialData changes (e.g., user selects different region)
  useEffect(() => {
    resetNavigation(initialData);
    setIsLegendExpanded(false);
  }, [initialData, resetNavigation]);

  // Collapse legend when drilling down
  useEffect(() => {
    setIsLegendExpanded(false);
  }, [data]);

  // Render Sankey visualization
  useSankeyRenderer({
    svgRef,
    data: sankeyData,
    dimensions,
    onNodeClick: handleNodeClick,
    onNodesRendered: setLegendNodes,
  });

  return (
    <div className="relative">
      {/* Breadcrumb Navigation */}
      <SankeyBreadcrumbs
        breadcrumbs={breadcrumbs}
        loading={loading}
        onBreadcrumbClick={handleBreadcrumbClick}
      />

      {/* SVG Sankey Diagram */}
      <div ref={containerRef} className="relative w-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card rounded-lg">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
            </div>
          </div>
        )}
        <svg
          ref={svgRef}
          className="w-full rounded-lg bg-card border border-border"
          style={{ height: dimensions.height || 200 }}
        />
      </div>

      {/* Color Legend */}
      <SankeyLegend breadcrumbsLength={breadcrumbs.length} />

      {/* Node Legend (Expandable) */}
      <SankeyNodeLegend
        nodes={legendNodes}
        isExpanded={isLegendExpanded}
        onToggle={() => setIsLegendExpanded(!isLegendExpanded)}
      />
    </div>
  );
}
