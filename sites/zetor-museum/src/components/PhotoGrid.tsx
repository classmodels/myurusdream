import { AssetImage as Image } from "@/components/AssetImage";

type Photo = { src: string; alt: string };

export function PhotoGrid({ photos, columns = 3 }: { photos: Photo[]; columns?: 2 | 3 | 4 }) {
  const cols =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-3 ${cols}`}>
      {photos.map((p) => (
        <figure key={p.src} className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-steel/40">
          <Image
            src={p.src}
            alt={p.alt}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-hangar to-transparent p-3 text-xs text-ink-dim opacity-0 transition group-hover:opacity-100">
            {p.alt}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
