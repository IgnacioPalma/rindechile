import { useEffect, useRef, RefObject } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyJustify, sankeyLinkHorizontal } from 'd3-sankey';
import type {
  SankeyData,
  SankeyNode,
  SankeyLink,
  SankeyLayoutNode,
  SankeyLayoutLink,
  SankeyTooltipData,
} from '@/types/sankey';
import { calculatePercentage } from '@/app/lib/sankey-transform';

interface UseSankeyRendererProps {
  svgRef: RefObject<SVGSVGElement | null>;
  data: SankeyData;
  dimensions: { width: number; height: number };
  onNodeClick: (node: SankeyLayoutNode) => void;
  onHover: (tooltipData: SankeyTooltipData | null) => void;
}

export function useSankeyRenderer({
  svgRef,
  data,
  dimensions,
  onNodeClick,
  onHover,
}: UseSankeyRendererProps) {
  // Track the last rendered data to determine if we should animate
  const lastDataRef = useRef<SankeyData | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || dimensions.width === 0) return;

    // Only animate when data changes, not on resize/scroll
    const shouldAnimate = lastDataRef.current !== data;
    lastDataRef.current = data;

    const { width, height } = dimensions;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Get max value for color scale (excluding source node)
    const targetNodes = data.nodes.filter(n => n.type !== 'source');
    const maxValue = d3.max(targetNodes, d => d.value) || 1;

    // Create color scale based on value (same as treemap)
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxValue])
      .interpolator(d3.interpolate('oklch(0.652 0.236 320.67)', 'oklch(0.652 0.236 150.67)'));

    // Source node color (neutral/muted)
    const sourceColor = 'oklch(0.5869 0.0025 345.21)';

    // Configure sankey generator
    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeId(d => d.id)
      .nodeAlign(sankeyJustify)
      .nodeWidth(18)
      .nodePadding(12)
      .extent([[1, 10], [width - 1, height - 10]]);

    // Create a copy of data to avoid mutating the original
    const sankeyData = {
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d })),
    };

    // Apply sankey layout
    const { nodes, links } = sankeyGenerator(sankeyData) as {
      nodes: SankeyLayoutNode[];
      links: SankeyLayoutLink[];
    };

    // Calculate total value for percentage calculations
    const totalValue = nodes.find(n => n.type === 'source')?.value || 0;

    // Create main group
    const g = svg.append('g');

    // --- Render Links ---
    const linkGroup = g.append('g').attr('class', 'links');

    const linkPaths = linkGroup
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', d => {
        const targetColor = colorScale(d.target.value);
        return d3.color(targetColor)?.copy({ opacity: 0.5 })?.toString() || targetColor;
      })
      .attr('stroke-width', d => Math.max(1, d.width))
      .style('cursor', 'default')
      .style('transition', 'opacity 0.2s, filter 0.2s');

    // Animate links on data change
    if (shouldAnimate) {
      linkPaths.each(function () {
        const path = d3.select(this);
        const node = this as SVGPathElement;
        const totalLength = node.getTotalLength();
        path
          .attr('stroke-dasharray', totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(400)
          .ease(d3.easeQuadOut)
          .attr('stroke-dashoffset', 0);
      });
    }

    // Link hover handlers
    linkPaths
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget)
          .style('opacity', 0.85)
          .style('filter', 'brightness(1.2)');

        const rect = (event.currentTarget as Element).getBoundingClientRect();
        onHover({
          type: 'link',
          name: `${d.source.name} → ${d.target.name}`,
          sourceName: d.source.name,
          targetName: d.target.name,
          value: d.value,
          percentage: calculatePercentage(d.value, totalValue),
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget)
          .style('opacity', 1)
          .style('filter', 'brightness(1)');
        onHover(null);
      });

    // --- Render Nodes ---
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodeGroups = nodeGroup
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Node rectangles
    const rects = nodeGroups
      .append('rect')
      .attr('fill', d => d.type === 'source' ? sourceColor : colorScale(d.value))
      .attr('height', d => d.y1 - d.y0)
      .attr('cursor', d => d.isClickable ? 'pointer' : 'default')
      .attr('tabindex', d => d.isClickable ? '0' : null)
      .attr('role', d => d.isClickable ? 'button' : null)
      .attr('aria-label', d => {
        const value = d.value.toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP',
          maximumFractionDigits: 0,
        });
        const percentage = calculatePercentage(d.value, totalValue).toFixed(1);
        const overpricing = d.overpricingRate !== undefined
          ? `, sobreprecio ${(d.overpricingRate * 100).toFixed(1)}%`
          : '';
        return d.isClickable
          ? `${d.name}, ${value}, ${percentage}% del total${overpricing}. Presiona Enter para ver más detalles.`
          : `${d.name}, ${value}, ${percentage}% del total${overpricing}.`;
      })
      .style('transition', 'opacity 0.2s, filter 0.2s')
      .style('outline', 'none');

    // Animate node width on data change
    if (shouldAnimate) {
      rects
        .attr('width', 0)
        .transition()
        .duration(400)
        .ease(d3.easeQuadOut)
        .attr('width', d => d.x1 - d.x0);
    } else {
      rects.attr('width', d => d.x1 - d.x0);
    }

    // Helper function to show hover/focus state
    const showNodeHighlight = (element: Element, d: SankeyLayoutNode) => {
      if (d.isClickable) {
        d3.select(element)
          .style('opacity', 0.85)
          .style('filter', 'brightness(1.1)');
      }
      const rect = element.getBoundingClientRect();
      onHover({
        type: 'node',
        name: d.name,
        value: d.value,
        percentage: calculatePercentage(d.value, totalValue),
        overpricingRate: d.overpricingRate,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    };

    // Helper function to hide hover/focus state
    const hideNodeHighlight = (element: Element) => {
      d3.select(element)
        .style('opacity', 1)
        .style('filter', 'brightness(1)');
      onHover(null);
    };

    // Node event handlers
    rects
      .on('mouseenter', (event, d) => {
        showNodeHighlight(event.currentTarget, d as SankeyLayoutNode);
      })
      .on('mouseleave', (event) => {
        hideNodeHighlight(event.currentTarget);
      })
      .on('focus', (event, d) => {
        // Add focus ring styling
        d3.select(event.currentTarget)
          .attr('stroke', 'oklch(0.708 0 0)')
          .attr('stroke-width', 3);
        showNodeHighlight(event.currentTarget, d as SankeyLayoutNode);
      })
      .on('blur', (event) => {
        // Remove focus ring styling
        d3.select(event.currentTarget)
          .attr('stroke', null)
          .attr('stroke-width', null);
        hideNodeHighlight(event.currentTarget);
      })
      .on('keydown', (event, d) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onHover(null);
          const node = d as SankeyLayoutNode;
          if (node.isClickable) {
            onNodeClick(node);
          }
        }
      })
      .on('click', (event, d) => {
        onHover(null);
        const node = d as SankeyLayoutNode;
        if (node.isClickable) {
          onNodeClick(node);
        }
      });

    // --- Render Labels ---
    nodeGroups.each(function (d) {
      const nodeHeight = d.y1 - d.y0;
      const nodeWidth = d.x1 - d.x0;
      const isLeftSide = d.x0 < width / 2;

      // Only show labels if there's enough vertical space
      if (nodeHeight < 20) return;

      const textElement = d3.select(this).append('text')
        .attr('fill', 'currentColor')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .attr('pointer-events', 'none')
        .attr('dy', '0.35em')
        .attr('y', nodeHeight / 2)
        .style('opacity', shouldAnimate ? 0 : 1);

      if (isLeftSide) {
        // Label on the right of the node
        textElement
          .attr('x', nodeWidth + 6)
          .attr('text-anchor', 'start');
      } else {
        // Label on the left of the node
        textElement
          .attr('x', -6)
          .attr('text-anchor', 'end');
      }

      // Calculate available width for text
      const availableWidth = isLeftSide
        ? width - (d.x1 + 6) - 10
        : d.x0 - 6 - 10;

      // Truncate text if needed
      let displayText = d.name;
      const tempSpan = textElement.append('tspan').text(displayText);
      const textWidth = (tempSpan.node() as SVGTSpanElement).getComputedTextLength();

      if (textWidth > availableWidth) {
        // Truncate and add ellipsis
        while (displayText.length > 0 && (tempSpan.node() as SVGTSpanElement).getComputedTextLength() > availableWidth - 15) {
          displayText = displayText.slice(0, -1);
          tempSpan.text(displayText + '...');
        }
        displayText = displayText + '...';
      }

      tempSpan.remove();
      textElement.text(displayText);

      // Animate text fade-in only on data change
      if (shouldAnimate) {
        textElement
          .transition()
          .duration(400)
          .delay(200)
          .style('opacity', 1);
      }
    });

    // Cleanup on unmount
    return () => {
      svg.selectAll('*').remove();
    };
  }, [data, dimensions, onNodeClick, onHover, svgRef]);
}
