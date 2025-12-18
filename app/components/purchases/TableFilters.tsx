"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { TableCombobox } from "./TableCombobox";
import { SmartSearch } from "./SmartSearch";
import { MobileSortSheet, type SortingState } from "./MobileSortSheet";
import { FilterChips } from "./FilterChips";
import type { FilterOptions } from "./PurchasesTable";

interface TableFiltersProps {
  search: string | null;
  municipalityName: string | null;
  sorting: SortingState;
  filterOptions: FilterOptions;
  onSearchChange: (value: string | null) => void;
  onMunicipalityChange: (value: string | null) => void;
  onSortChange: (sort: SortingState) => void;
  onClearAll: () => void;
}

export function TableFilters({
  search,
  municipalityName,
  sorting,
  filterOptions,
  onSearchChange,
  onMunicipalityChange,
  onSortChange,
  onClearAll,
}: TableFiltersProps) {
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Sort Button (mobile only) */}
      <div className="flex gap-2">
        <SmartSearch
          value={search ?? ""}
          onChange={(value) => onSearchChange(value || null)}
          placeholder="Buscar item o codigo..."
        />
        {/* Mobile sort button */}
        <Button
          variant="outline"
          size="icon"
          className="tablet:hidden shrink-0"
          onClick={() => setIsSortSheetOpen(true)}
          aria-label="Ordenar resultados"
        >
          <ArrowUpDown className="size-4" />
        </Button>
      </div>

      {/* Row 2: Municipality filter (collapsible on mobile, visible on tablet+) */}
      <div className="tablet:hidden">
        <Collapsible open={isMoreFiltersOpen} onOpenChange={setIsMoreFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 -ml-2">
              Mas filtros
              <ChevronDown
                className={`size-4 transition-transform ${isMoreFiltersOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <TableCombobox
              options={filterOptions.municipalities}
              value={municipalityName ?? ""}
              onValueChange={(value) => onMunicipalityChange(value || null)}
              placeholder="Filtrar por municipio..."
              searchPlaceholder="Buscar municipios..."
              emptyText="No se encontraron municipios."
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Tablet+: Always visible municipality filter */}
      <div className="hidden tablet:block">
        <TableCombobox
          options={filterOptions.municipalities}
          value={municipalityName ?? ""}
          onValueChange={(value) => onMunicipalityChange(value || null)}
          placeholder="Filtrar por municipio..."
          searchPlaceholder="Buscar municipios..."
          emptyText="No se encontraron municipios."
        />
      </div>

      {/* Row 3: Filter chips */}
      <FilterChips
        search={search}
        municipalityName={municipalityName}
        sorting={sorting}
        onClearSearch={() => onSearchChange(null)}
        onClearMunicipality={() => onMunicipalityChange(null)}
        onClearSort={() => onSortChange(null)}
        onClearAll={onClearAll}
      />

      {/* Mobile sort sheet */}
      <MobileSortSheet
        currentSort={sorting}
        onSortChange={onSortChange}
        open={isSortSheetOpen}
        onOpenChange={setIsSortSheetOpen}
      />
    </div>
  );
}
