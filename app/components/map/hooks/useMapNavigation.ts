'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSlugFromCode, getCodeFromSlug } from '@/lib/region-slugs';
import type {
  MapViewState,
  EnrichedRegionData,
  EnrichedMunicipalityData,
  MunicipalityData,
} from '@/types/map';

interface SelectedMunicipalityData {
  name: string;
  regionName: string;
  municipalityId: number;
  data: MunicipalityData | null;
}

interface UseMapNavigationProps {
  regionsData: EnrichedRegionData[];
  municipalitiesData: EnrichedMunicipalityData[];
  onAnnounce: (message: string) => void;
  initialRegionCode?: number;
}

export function useMapNavigation({
  regionsData,
  municipalitiesData,
  onAnnounce,
  initialRegionCode,
}: UseMapNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [viewState, setViewState] = useState<MapViewState>({
    level: 'country',
    selectedRegion: null,
    selectedMunicipality: null,
  });

  const [selectedMunicipalityData, setSelectedMunicipalityData] =
    useState<SelectedMunicipalityData | null>(null);

  // Initialize view from URL or initialRegionCode
  useEffect(() => {
    if (regionsData.length === 0) return;

    // Try to get region code from URL pathname first
    let regionCode: number | null = null;
    
    if (pathname !== '/') {
      const slug = pathname.replace('/', '');
      regionCode = getCodeFromSlug(slug);
    }
    
    // Fallback to initialRegionCode prop if no valid slug in URL
    if (!regionCode && initialRegionCode) {
      regionCode = initialRegionCode;
    }

    if (regionCode && viewState.level === 'country') {
      const region = regionsData.find(
        (r) => r.feature.properties.codregion === regionCode
      );

      if (region) {
        setViewState({
          level: 'region',
          selectedRegion: region.feature,
          selectedMunicipality: null,
        });
      }
    }
  }, [pathname, regionsData, viewState.level, initialRegionCode]);

  const handleRegionClick = (regionCode: string) => {
    const region = regionsData.find(
      (r) => r.feature.properties.codregion.toString() === regionCode
    );

    if (region) {
      setViewState({
        level: 'region',
        selectedRegion: region.feature,
        selectedMunicipality: null,
      });

      // Clear selected municipality data
      setSelectedMunicipalityData(null);

      // Update URL with slug
      const slug = getSlugFromCode(Number(regionCode));
      if (slug) {
        router.push(`/${slug}`, { scroll: false });
      }

      // Announce to screen readers
      onAnnounce(`Mostrando región ${region.feature.properties.Region}`);
    }
  };

  const handleMunicipalityClick = (municipalityCode: string) => {
    const municipality = municipalitiesData.find(
      (m) => m.feature.properties.cod_comuna.toString() === municipalityCode
    );

    if (municipality) {
      // Update viewState with selected municipality
      setViewState((prev) => ({
        ...prev,
        selectedMunicipality: municipality.feature,
      }));

      // Update municipality data for the panel
      setSelectedMunicipalityData({
        name: municipality.feature.properties.Comuna,
        regionName: viewState.selectedRegion?.properties.Region || '',
        municipalityId: municipality.feature.properties.cod_comuna,
        data: municipality.data,
      });

      // Announce to screen readers
      onAnnounce(`Mostrando detalles de ${municipality.feature.properties.Comuna}`);
    }
  };

  const handleBackToCountry = () => {
    setViewState({
      level: 'country',
      selectedRegion: null,
      selectedMunicipality: null,
    });

    // Clear selected municipality data
    setSelectedMunicipalityData(null);

    // Clear URL params
    router.push('/', { scroll: false });

    // Announce to screen readers
    onAnnounce('Mostrando vista de Chile completo');
  };

  return {
    viewState,
    selectedMunicipalityData,
    handleRegionClick,
    handleMunicipalityClick,
    handleBackToCountry,
  };
}
