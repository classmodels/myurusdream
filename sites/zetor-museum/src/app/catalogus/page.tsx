import type { Metadata } from "next";
import { CatalogExplorer } from "@/components/CatalogExplorer";
import { catalogEntries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Catalogus",
};

export default function CatalogusPage() {
  return (
    <CatalogExplorer
      entries={catalogEntries.map((e) => ({
        id: e.id,
        name: e.name,
        image: e.image,
        year: e.year,
        origin: e.origin,
        specs: e.specs,
      }))}
    />
  );
}
