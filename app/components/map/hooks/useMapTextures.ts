import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import textures from 'textures';

export interface MapTextures {
  light: any;
  medium: any;
  heavy: any;
}

/**
 * Custom hook to manage texture patterns for map visualization
 * Creates consistent texture patterns with custom IDs and applies them to an SVG element
 */
export function useMapTextures(svgRef: React.RefObject<SVGSVGElement | null>) {
  const texturesRef = useRef<MapTextures | null>(null);
  const appliedRef = useRef(false);

  // Create textures once on mount
  if (!texturesRef.current) {
    texturesRef.current = {
      light: textures.lines().lighter().id('lighter').background('#E5E7EB'),
      medium: textures.lines().heavier().id('heavier').background('#E5E7EB'),
      heavy: textures.lines().heavier(10).thinner(1.5).id('heavy').background('#E5E7EB'),
    };
  }

  // Apply textures to SVG when ref is available
  useEffect(() => {
    if (svgRef.current && !appliedRef.current && texturesRef.current) {
      const svg = d3.select(svgRef.current);
      svg.call(texturesRef.current.light);
      svg.call(texturesRef.current.medium);
      svg.call(texturesRef.current.heavy);
      appliedRef.current = true;
    }
  }, [svgRef]);

  return texturesRef.current;
}
