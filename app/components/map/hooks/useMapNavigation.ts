'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  MapViewState,
  EnrichedRegionData,
  EnrichedMunicipalityData,
  MunicipalityData,
} from '@/types/map';

interface SelectedMunicipalityData {
  name: string;
  regionName: string;
  data: MunicipalityData | null;
}

interface UseMapNavigationProps {
  regionsData: EnrichedRegionData[];
  municipalitiesData: EnrichedMunicipalityData[];
  onAnnounce: (message: string) => void;
}

export function useMapNavigation({
  regionsData,
  municipalitiesData,
  onAnnounce,
}: UseMapNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewState, setViewState] = useState<MapViewState>({
    level: 'country',
    selectedRegion: null,
    selectedMunicipality: null,
  });

  const [selectedMunicipalityData, setSelectedMunicipalityData] =
    useState<SelectedMunicipalityData | null>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);

  // Initialize view from URL params
  useEffect(() => {
    const regionParam = searchParams.get('region');
    if (regionParam && regionsData.length > 0) {
      const region = regionsData.find(
        (r) => r.feature.properties.codregion.toString() === regionParam
      );

      if (region && viewState.level === 'country') {
        setViewState({
          level: 'region',
          selectedRegion: region.feature,
          selectedMunicipality: null,
        });
      }
    }
  }, [searchParams, regionsData, viewState.level]);

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

      // Update URL
      const params = new URLSearchParams();
      params.set('region', regionCode);
      router.push(`?${params.toString()}`, { scroll: false });

      // Announce to screen readers
      onAnnounce(`Mostrando región ${region.feature.properties.Region}`);
    }
  };

  const handleMunicipalityClick = (municipalityCode: string) => {
    const municipality = municipalitiesData.find(
      (m) => m.feature.properties.cod_comuna.toString() === municipalityCode
    );

    if (municipality) {
      setSelectedMunicipalityData({
        name: municipality.feature.properties.Comuna,
        regionName: viewState.selectedRegion?.properties.Region || '',
        data: municipality.data,
      });
      setDialogOpen(true);

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

    // Clear URL params
    router.push('/', { scroll: false });

    // Announce to screen readers
    onAnnounce('Mostrando vista de Chile completo');
  };

  return {
    viewState,
    selectedMunicipalityData,
    dialogOpen,
    setDialogOpen,
    handleRegionClick,
    handleMunicipalityClick,
    handleBackToCountry,
  };
}
