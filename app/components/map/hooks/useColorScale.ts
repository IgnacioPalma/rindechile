import { useEffect, useState } from 'react';
import type { ColorScale, ViewLevel } from '@/types/map';

export interface UseColorScaleOptions {
  viewLevel: ViewLevel;
  getRegionRange: () => [number, number];
  getRegionTertiles: () => number[];
  getMunicipalityRange: () => [number, number];
  getMunicipalityTertiles: () => number[];
}

/**
 * Custom hook to manage color scale and breakpoints based on view level
 * Automatically updates breakpoints when switching between country and region views
 */
export function useColorScale(options: UseColorScaleOptions): ColorScale {
  const {
    viewLevel,
    getRegionRange,
    getRegionTertiles,
    getMunicipalityRange,
    getMunicipalityTertiles,
  } = options;

  const [colorScale, setColorScale] = useState<ColorScale>({
    domain: [0, 100],
    breakpoints: [],
  });

  // Initialize and update breakpoints based on view level
  useEffect(() => {
    const isCountryView = viewLevel === 'country';
    const range = isCountryView ? getRegionRange() : getMunicipalityRange();
    const tertiles = isCountryView ? getRegionTertiles() : getMunicipalityTertiles();

    const breakpoints = [
      { threshold: tertiles[0], color: '#E5E7EB', texture: 'url(#lighter)', label: 'Bajo' },
      { threshold: tertiles[1], color: '#E5E7EB', texture: 'url(#heavier)', label: 'Medio' },
      { threshold: tertiles[2], color: '#E5E7EB', texture: 'url(#heavy)', label: 'Alto' },
    ];

    setColorScale({
      domain: range,
      breakpoints,
    });
  }, [viewLevel, getRegionRange, getRegionTertiles, getMunicipalityRange, getMunicipalityTertiles]);

  return colorScale;
}
