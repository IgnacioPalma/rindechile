import type { TreemapHierarchy } from '@/types/map';
import type { SankeyData, SankeyNode, SankeyLink } from '@/types/sankey';

/**
 * Transforms TreemapHierarchy data to Sankey diagram format.
 *
 * Creates a single source node (left side) connected to multiple target nodes (right side).
 * The source represents the total budget/parent, targets represent categories/segments/etc.
 */
export function transformToSankeyData(hierarchy: TreemapHierarchy): SankeyData {
  // Calculate total value from all children
  const totalValue = hierarchy.children.reduce((sum, child) => sum + child.value, 0);

  // Calculate weighted average overpricing rate
  const weightedOverpricing = totalValue > 0
    ? hierarchy.children.reduce((sum, child) => sum + child.value * child.overpricingRate, 0) / totalValue
    : 0;

  // Create the source node (left side of Sankey)
  const sourceNode: SankeyNode = {
    id: 'source',
    name: hierarchy.name,
    value: totalValue,
    type: 'source',
    isClickable: false,
    overpricingRate: weightedOverpricing,
  };

  // Create target nodes from hierarchy children (right side of Sankey)
  const targetNodes: SankeyNode[] = hierarchy.children.map(child => ({
    id: `target-${child.id}`,
    name: child.name,
    value: child.value,
    type: child.type,
    originalId: child.id,
    isClickable: child.type !== 'class', // Classes are the final level, not clickable
    overpricingRate: child.overpricingRate,
  }));

  // Create links from source to each target
  const links: SankeyLink[] = targetNodes.map(target => ({
    source: 'source',
    target: target.id,
    value: target.value,
  }));

  return {
    nodes: [sourceNode, ...targetNodes],
    links,
  };
}

/**
 * Calculates the percentage of a value relative to a total.
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}
