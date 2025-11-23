import { Skeleton } from '@/app/components/ui/skeleton';

export function MapLoadingState() {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header Skeleton */}
      <header className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            <Skeleton className="h-6 w-48 bg-white/10" />
          </div>
          <Skeleton className="h-9 w-32 bg-white/10" />
        </div>
      </header>

      {/* Title Skeleton */}
      <div className="px-8 py-4 text-center">
        <Skeleton className="h-8 w-96 mx-auto bg-white/10" />
      </div>

      {/* Map Loading State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white/20 border-t-white" />
          <p className="text-white/80">Cargando datos del mapa...</p>
          <p className="text-white/50 text-sm">Preparando visualización</p>
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className="px-8 pb-8">
        <Skeleton className="h-16 w-full bg-white/10" />
      </div>
    </div>
  );
}
