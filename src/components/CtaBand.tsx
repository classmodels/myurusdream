import Link from "next/link";

export function CtaBand({
  title = "Klaar om uw website professioneel aan te pakken?",
  text = "Vraag een vrijblijvende offerte aan. U ontvangt binnen 24 uur een duidelijk voorstel.",
  className = "section pt-0",
  sideEyebrow,
  sideTitle,
  withMesh = false,
  sideAsH1 = false,
}: {
  title?: string;
  text?: string;
  className?: string;
  sideEyebrow?: string;
  sideTitle?: string;
  withMesh?: boolean;
  sideAsH1?: boolean;
}) {
  const hasSide = Boolean(sideEyebrow || sideTitle);
  const SideHeading = sideAsH1 ? "h1" : "p";

  const band = (
    <div className="container-x">
        <div className="relative overflow-hidden rounded-tr-[1.4rem] bg-gradient-to-br from-[#007aff] via-[#14b8a6] to-[#12b76a] px-5 py-6 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:rounded-tr-[2rem] md:px-12 md:py-9">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-16 left-20 h-40 w-40 rounded-full bg-[#ff5a5f]/35 blur-2xl" />

        <div
          className={`relative grid gap-8 ${hasSide ? "lg:grid-cols-[1.15fr_0.85fr] lg:items-end" : ""}`}
        >
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-white/20 px-3 py-1.5 text-[0.72rem] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
                Offerte 24u
              </span>
              <span className="rounded-md bg-white/20 px-3 py-1.5 text-[0.72rem] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
                Ontwerp 48u
              </span>
              <span className="rounded-md bg-white/20 px-3 py-1.5 text-[0.72rem] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
                Support 24/7
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold md:text-4xl">
              {title}
            </h2>
            <p className="mt-2 text-white/90">{text}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/offerte"
                className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-bold text-[#007aff] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f5f9ff]"
              >
                Offerte aanvragen
              </Link>
              <Link
                href="/briefing"
                className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Briefing uploaden
              </Link>
            </div>
          </div>

          {hasSide && (
            <div className="lg:pb-1 lg:text-right">
              {sideEyebrow && (
                <p className="text-[0.72rem] font-bold tracking-[0.16em] text-white/75 uppercase">
                  {sideEyebrow}
                </p>
              )}
              {sideTitle && (
                <SideHeading className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold leading-tight text-white md:text-3xl lg:text-[1.85rem]">
                  {sideTitle}
                </SideHeading>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (withMesh) {
    return (
      <section className={`mesh-hero ${className}`}>
        <div className="pt-8 pb-4 md:pt-10 md:pb-5">{band}</div>
      </section>
    );
  }

  return <section className={className}>{band}</section>;
}
