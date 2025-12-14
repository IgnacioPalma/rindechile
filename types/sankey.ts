import type { TreemapNodeType } from './map';

// Node types for Sankey diagram
export type SankeyNodeType = 'source' | TreemapNodeType;

// Base Sankey node before D3 layout
export interface SankeyNode {
  id: string;
  name: string;
  value: number;
  type: SankeyNodeType;
  originalId?: number; // Original TreemapNode.id for drill-down
  isClickable: boolean;
  overpricingRate?: number;
}

// Base Sankey link before D3 layout
export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

// Sankey data structure for rendering
export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Extended types with D3 layout properties (after sankey() is applied)
// These are the types returned after d3-sankey processes the data
export interface SankeyLayoutNode extends SankeyNode {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  sourceLinks?: SankeyLayoutLink[];
  targetLinks?: SankeyLayoutLink[];
  index?: number;
  depth?: number;
  height?: number;
  layer?: number;
}

export interface SankeyLayoutLink {
  source: SankeyLayoutNode;
  target: SankeyLayoutNode;
  value: number;
  width: number;
  y0?: number;
  y1?: number;
  index?: number;
}

// Tooltip data for Sankey (legacy, may be removed)
export interface SankeyTooltipData {
  type: 'node' | 'link';
  name: string;
  sourceName?: string; // For link tooltips
  targetName?: string; // For link tooltips
  value: number;
  percentage: number;
  overpricingRate?: number;
  x: number;
  y: number;
}

// Node legend item for the expandable legend below the chart
export interface NodeLegendItem {
  letter: string;
  name: string;
  value: number;
  percentage: number;
}
