'use client';

import { useMapContext } from "../contexts/MapContext";
import { DetailPanel } from "./DetailPanel";
import MapContainerSuspense from "./map/MapContainerSuspense";
import { PurchasesTable } from "./purchases/PurchasesTable";
import { DetailPanelSkeleton } from "./DetailPanelSkeleton";
import { PurchasesTableSkeleton } from "./purchases/PurchasesTableSkeleton";

export function ClientPageContent() {
  const { detailPanelData, loading } = useMapContext();

  return (
    <main className="flex flex-col gap-8 w-full">
      <section className="flex flex-col tablet:flex-row w-full gap-8">
        <MapContainerSuspense />

        <div className="w-full tablet:w-3/5">
          {loading ? (
            <DetailPanelSkeleton />
          ) : (
            <DetailPanel data={detailPanelData} />
          )}
        </div>
      </section>

      <section className="w-full">
        {loading ? (
          <PurchasesTableSkeleton />
        ) : (
          <PurchasesTable />
        )}
      </section>
    </main>
  );
}

// Explicit default export for module resolution
export default ClientPageContent;
