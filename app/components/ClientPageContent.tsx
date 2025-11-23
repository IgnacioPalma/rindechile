'use client';

import { useMapContext } from "../contexts/MapContext";
import { DetailPanel } from "./DetailPanel";
import MapContainerSuspense from "./map/MapContainerSuspense";

export function ClientPageContent() {
  const { detailPanelData } = useMapContext();

  return (
    <main className="w-full h-screen">
      <section className="flex flex-col tablet:flex-row w-full gap-8">
        <MapContainerSuspense />

        <div className="w-full tablet:w-3/5">
          <DetailPanel data={detailPanelData} />
        </div>
      </section>
    </main>
  );
}

// Explicit default export for module resolution
export default ClientPageContent;
