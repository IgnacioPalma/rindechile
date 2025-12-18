"use client";

import { X } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import type { SortingState } from "./MobileSortSheet";
import { SORT_OPTIONS } from "./MobileSortSheet";

interface FilterChipsProps {
  search: string | null;
  municipalityName: string | null;
  sorting: SortingState;
  onClearSearch: () => void;
  onClearMunicipality: () => void;
  onClearSort: () => void;
  onClearAll: () => void;
}

function getSortLabel(sortId: string): string {
  const option = SORT_OPTIONS.find((opt) => opt.id === sortId);
  return option?.label ?? sortId;
}

export function FilterChips({
  search,
  municipalityName,
  sorting,
  onClearSearch,
  onClearMunicipality,
  onClearSort,
  onClearAll,
}: FilterChipsProps) {
  const hasAnyFilter = search || municipalityName || sorting;

  if (!hasAnyFilter) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {search && (
        <Badge variant="secondary" className="gap-1 pr-1 max-w-[200px]">
          <span className="truncate">Busqueda: {search}</span>
          <button
            onClick={onClearSearch}
            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
            aria-label="Eliminar filtro de busqueda"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      {municipalityName && (
        <Badge variant="secondary" className="gap-1 pr-1 max-w-[200px]">
          <span className="truncate">Municipio: {municipalityName}</span>
          <button
            onClick={onClearMunicipality}
            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
            aria-label="Eliminar filtro de municipio"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      {sorting && (
        <Badge variant="outline" className="gap-1 pr-1">
          <span>
            Orden: {getSortLabel(sorting.id)} ({sorting.desc ? "desc" : "asc"})
          </span>
          <button
            onClick={onClearSort}
            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
            aria-label="Eliminar ordenamiento"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 px-2 text-xs"
      >
        Limpiar todo
      </Button>
    </div>
  );
}
