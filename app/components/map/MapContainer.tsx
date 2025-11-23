'use client';

import { useState, useEffect } from 'react';
import { ChileMap } from './ChileMap';
import { MapLegend } from './MapLegend';
import { MapLoadingState } from './MapLoadingState';
import { MapErrorState } from './MapErrorState';
import { useMapContext } from '@/app/contexts/MapContext';

import type { ColorScale } from '@/types/map';
import {
  getMunicipalityOverpricingRange,
  getRegionOverpricingRange,
  getMunicipalityTertileBreakpoints,
  getRegionTertileBreakpoints,
} from '@/app/lib/data-service';

export function MapContainer() {
  const {
    regionsData,
    municipalitiesData,
    loadingMunicipalities,
    nationalAverage,
    viewState,
    handleRegionClick,
    handleMunicipalityClick,
    handleBackToCountry,
    loading,
    error,
    handleRetry,
  } = useMapContext();

  // Initialize color scale
  const [colorScale, setColorScale] = useState<ColorScale>({
    domain: [0, 100],
    breakpoints: [],
  });

  // Initialize breakpoints with CSS variables on mount
  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Get tertile breakpoints from region data (for initial country view)
    const tertiles = getRegionTertileBreakpoints();
    
    const breakpoints = [
      { threshold: tertiles[0], color: computedStyle.getPropertyValue('--tier-bajo').trim(), label: 'Bajo' },
      { threshold: tertiles[1], color: computedStyle.getPropertyValue('--tier-medio').trim(), label: 'Medio' },
      { threshold: tertiles[2], color: computedStyle.getPropertyValue('--tier-alto').trim(), label: 'Alto' },
    ];
    
    setColorScale((prev) => ({
      ...prev,
      breakpoints,
    }));
  }, []);

  // Update color scale range based on view level
  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    if (viewState.level === 'country') {
      // Use region range and tertiles for country view
      const range = getRegionOverpricingRange();
      const tertiles = getRegionTertileBreakpoints();
      
      const breakpoints = [
        { threshold: tertiles[0], color: computedStyle.getPropertyValue('--tier-bajo').trim(), label: 'Bajo' },
        { threshold: tertiles[1], color: computedStyle.getPropertyValue('--tier-medio').trim(), label: 'Medio' },
        { threshold: tertiles[2], color: computedStyle.getPropertyValue('--tier-alto').trim(), label: 'Alto' },
      ];
      
      setColorScale({
        domain: range,
        breakpoints,
      });
    } else if (viewState.level === 'region') {
      // Use municipality range and tertiles for region view
      const range = getMunicipalityOverpricingRange();
      const tertiles = getMunicipalityTertileBreakpoints();
      
      const breakpoints = [
        { threshold: tertiles[0], color: computedStyle.getPropertyValue('--tier-bajo').trim(), label: 'Bajo' },
        { threshold: tertiles[1], color: computedStyle.getPropertyValue('--tier-medio').trim(), label: 'Medio' },
        { threshold: tertiles[2], color: computedStyle.getPropertyValue('--tier-alto').trim(), label: 'Alto' },
      ];
      
      setColorScale({
        domain: range,
        breakpoints,
      });
    }
  }, [viewState.level]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC key to go back
      if (event.key === 'Escape') {
        if (viewState.level === 'region') {
          handleBackToCountry();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState.level, handleBackToCountry]);

  if (loading) {
    return <MapLoadingState />;
  }

  if (error) {
    return <MapErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="w-full tablet:w-2/5 flex flex-col bg-card rounded-sm">
      {/* Main Content: Map */}
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChileMap
              regionsData={regionsData}
              municipalitiesData={municipalitiesData}
              loadingMunicipalities={loadingMunicipalities}
              onRegionClick={handleRegionClick}
              onMunicipalityClick={handleMunicipalityClick}
              viewState={viewState}
              colorScale={colorScale}
            />
          </div>
        </div>
      </div>

      {/* Legend at Bottom */}
      <div className="px-8 pb-8">
        <MapLegend colorScale={colorScale} nationalAverage={nationalAverage} />
      </div>
    </div>
  );
}
