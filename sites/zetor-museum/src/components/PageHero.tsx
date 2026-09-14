import Image from "next/image";

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="relative min-h-[42vh] overflow-hidden border-b border-steel md:min-h-[48vh]">
      <Image src={image} alt={imageAlt} fill priority className="object-cover object-center" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-hangar via-hangar/80 to-hangar/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-hangar via-transparent to-hangar/40" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-12 pt-24 md:px-6 md:pb-16">
        <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-brass uppercase">{eyebrow}</p>
        <h1 className="font-display mt-2 max-w-4xl text-5xl tracking-wide text-ink md:text-7xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-dim md:text-lg">{lead}</p>
      </div>
    </section>
  );
}
