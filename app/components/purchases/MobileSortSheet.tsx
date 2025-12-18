"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/app/components/ui/sheet";
import { Check, ArrowUp, ArrowDown } from "lucide-react";

export type SortingState = {
  id: string;
  desc: boolean;
} | null;

interface MobileSortSheetProps {
  currentSort: SortingState;
  onSortChange: (sort: SortingState) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SORT_OPTIONS = [
  { id: "chilecompra_code", label: "ID ChileCompra" },
  { id: "item_name", label: "Nombre del Item" },
  { id: "municipality_name", label: "Municipalidad" },
  { id: "quantity", label: "Cantidad" },
  { id: "unit_total_price", label: "Precio Unitario" },
  { id: "total_price", label: "Precio Total" },
  { id: "price_excess_percentage", label: "Porcentaje de Exceso" },
] as const;

export function MobileSortSheet({
  currentSort,
  onSortChange,
  open,
  onOpenChange,
}: MobileSortSheetProps) {
  const handleSelect = (id: string) => {
    if (currentSort?.id === id) {
      // Toggle direction or clear
      if (currentSort.desc) {
        // Was descending, clear sort
        onSortChange(null);
      } else {
        // Was ascending, switch to descending
        onSortChange({ id, desc: true });
      }
    } else {
      // New sort field, start with ascending
      onSortChange({ id, desc: false });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>Ordenar por</SheetTitle>
          <SheetDescription>
            Selecciona el criterio de ordenamiento
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 py-4 overflow-y-auto">
          {SORT_OPTIONS.map((option) => {
            const isActive = currentSort?.id === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                aria-current={isActive ? "true" : undefined}
              >
                <span className={isActive ? "font-medium" : ""}>
                  {option.label}
                </span>
                <div className="flex items-center gap-2">
                  {isActive && (
                    <>
                      {currentSort.desc ? (
                        <ArrowDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ArrowUp className="size-4 text-muted-foreground" />
                      )}
                      <Check className="size-4 text-primary" />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { SORT_OPTIONS };
