import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServicePageShell } from "@/components/ServicePageShell";
import { WebSolutionsRail } from "@/components/WebSolutionsRail";
import { carePackages, getService, packages, services } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Dienst" };
  return {
    title: service.title,
    description: service.summary,
  };
}

export default async function DienstDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const websitePackages =
    slug === "websites" ? (
      <div className="mt-10">
        <p className="eyebrow">Websitepakketten</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink md:text-3xl">
          Welk type website past bij u?
        </h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Kies het traject dat aansluit bij uw noden. Concrete prijzen staan op de prijzenpagina.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {packages.map((pkg, i) => {
            const headers = [
              "bg-gradient-to-r from-[#007aff] to-[#60a5fa]",
              "bg-gradient-to-r from-[#0d9488] to-[#2dd4bf]",
              "bg-gradient-to-r from-[#ef4444] to-[#f87171]",
            ] as const;
            const bodies = [
              "bg-gradient-to-b from-[#dbeafe] via-[#eff6ff] to-white",
              "bg-gradient-to-b from-[#ccfbf1] via-[#f0fdfa] to-white",
              "bg-gradient-to-b from-[#fee2e2] via-[#fef2f2] to-white",
            ] as const;
            return (
              <article
                key={pkg.id}
                className={`overflow-hidden rounded-xl shadow-[0_16px_36px_rgba(0,0,0,0.26)] ${bodies[i]}`}
              >
                <div className={`px-5 py-3.5 ${headers[i]}`}>
                  <p className="text-xs font-bold tracking-wide text-white uppercase">{pkg.tag}</p>
                </div>
                <div className="p-5">
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink-on-light">
                    {pkg.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-on-light">{pkg.description}</p>
                  <ul className="mt-4 space-y-1.5">
                    {pkg.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-ink-on-light">
                        <span className="text-green">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/prijzen" className="mt-5 inline-block text-sm font-bold text-blue-deep hover:underline">
                    Prijzen bekijken →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    ) : null;

  const careBlock =
    slug === "support" ? (
      <div className="mt-10">
        <p className="eyebrow">Pilot Care</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink md:text-3xl">
          Hosting &amp; beheer na livegang
        </h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Wat erin zit — zonder prijzen hier. Bedragen vindt u onder Prijzen.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {carePackages.map((pkg, i) => {
            const headers = [
              "bg-gradient-to-r from-[#007aff] to-[#60a5fa]",
              "bg-gradient-to-r from-[#0d9488] to-[#2dd4bf]",
            ] as const;
            const bodies = [
              "bg-gradient-to-b from-[#dbeafe] via-[#eff6ff] to-white",
              "bg-gradient-to-b from-[#ccfbf1] via-[#f0fdfa] to-white",
            ] as const;
            return (
              <article
                key={pkg.id}
                className={`relative overflow-visible rounded-xl shadow-[0_16px_36px_rgba(0,0,0,0.26)] ${bodies[i]}`}
              >
                <div className={`relative rounded-t-xl px-7 py-3.5 ${headers[i]}`}>
                  <p className="pr-28 text-xs font-bold tracking-wide text-white uppercase">{pkg.tag}</p>
                  {pkg.highlight && (
                    <span className="absolute right-4 bottom-0 z-20 translate-y-1/2 rounded-md bg-blue px-3 py-1 text-xs font-bold whitespace-nowrap text-white shadow-sm">
                      Aanbevolen
                    </span>
                  )}
                </div>
                <div className="p-7">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink-on-light">
                    {pkg.name}
                  </h3>
                  <p className="mt-3 text-sm text-muted-on-light">{pkg.description}</p>
                  <ul className="mt-5 space-y-2.5">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-ink-on-light">
                        <span className="text-green">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/prijzen" className="btn-secondary mt-8 inline-flex text-sm">
                    Bekijk prijzen
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    ) : null;

  return (
    <ServicePageShell
      service={service}
      below={slug === "websites" ? <WebSolutionsRail /> : undefined}
    >
      {websitePackages}
      {careBlock}
    </ServicePageShell>
  );
}
