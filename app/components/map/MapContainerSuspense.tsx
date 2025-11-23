'use client';

import { Suspense } from "react";
import { MapContainer } from "./MapContainer";
import { Skeleton } from "@/app/components/ui/skeleton";

interface MapContainerSuspenseProps {
  initialRegionCode?: number;
}

function MapLoadingFallback() {
  return (
    <div className="w-full h-screen flex flex-col">
      <header className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-foreground/10" />
            <Skeleton className="h-6 w-48 bg-foreground/10" />
          </div>
          <Skeleton className="h-9 w-32 bg-foreground/10" />
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white/20 border-t-white" />
          <p className="text-white/80">Cargando mapa...</p>
        </div>
      </div>
    </div>
  );
}

export default function MapContainerSuspense() {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <MapContainer />
    </Suspense>
  );
}
