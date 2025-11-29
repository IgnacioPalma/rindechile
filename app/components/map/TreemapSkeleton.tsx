import { Skeleton } from "@/app/components/ui/skeleton";

export function TreemapSkeleton() {
  return (
    <div className="relative">
      {/* Breadcrumb Skeleton */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* SVG Treemap Skeleton */}
      <div className="relative w-full">
        <Skeleton className="w-full h-[400px] rounded-lg" />
      </div>

      {/* Legend Skeleton */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}
