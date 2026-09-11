import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import {
  branches,
  contentPackages,
  portfolio,
  processSteps,
  reviews,
  services,
  usps,
} from "@/lib/content";

const serviceStyles = [
  { left: "bg-[#007aff]", right: "from-[#007aff] via-[#3b82f6] to-[#0d9488]" },
  { left: "bg-[#0d9488]", right: "from-[#0d9488] via-[#14b8a6] to-[#12b76a]" },
  { left: "bg-[#16a34a]", right: "from-[#16a34a] via-[#22c55e] to-[#0d9488]" },
  { left: "bg-[#ef4444]", right: "from-[#ef4444] via-[#f87171] to-[#007aff]" },
  { left: "bg-[#7c3aed]", right: "from-[#7c3aed] via-[#3b82f6] to-[#14b8a6]" },
  { left: "bg-[#0ea5e9]", right: "from-[#0ea5e9] via-[#007aff] to-[#0d9488]" },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="mesh-hero hero-shell">
        <div className="glow-blob -left-20 top-10 h-72 w-72 bg-[#007aff]/30" />
        <div className="glow-blob right-10 top-24 h-64 w-64 bg-[#14b8a6]/25" />

        <div className="container-x relative grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 md:py-24">
          <div>
            <p className="eyebrow">Website laten maken · Alle branches</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.08] font-extrabold tracking-tight text-ink sm:text-5xl md:text-[3.35rem]">
              Professionele websites die{" "}
              <span className="text-blue">uw bedrijf vooruithelpen</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              SitePilot bouwt complete websites voor bakkers tot grote organisaties —
              desgewenst inclusief logo, teksten, fotografie en video. Offerte binnen 24 uur,
              eerste ontwerp binnen 48 uur.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/offerte" className="btn-soft">
                Offerte aanvragen
              </Link>
              <Link href="/diensten" className="btn-ghost">
                Bekijk diensten
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              <span className="chip chip-blue">Vanaf €1.250</span>
              <span className="chip chip-teal">Support 24/7</span>
              <span className="chip chip-coral">Alles onder één dak</span>
            </div>
          </div>

          <div className="pill-media bg-gradient-to-br from-[#007aff] via-[#14b8a6] to-[#12b76a] p-7 md:p-9">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_45%)]" />
            <div className="relative flex h-full min-h-[360px] flex-col justify-between md:min-h-[430px]">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-white/80 uppercase">
                  SitePilot in cijfers
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl">
                  Zakelijk. Compleet.
                  <br />
                  Resultaatgericht.
                </h2>
              </div>
              <ul className="space-y-3">
                {[
                  ["24u", "Heldere offerte"],
                  ["48u", "Eerste ontwerp"],
                  ["1 team", "Website + content"],
                  ["Alle branches", "Lokaal tot corporate"],
                ].map(([k, v]) => (
                  <li
                    key={k}
                    className="flex items-center justify-between rounded-md bg-white/15 px-4 py-3 backdrop-blur-sm"
                  >
                    <span className="text-lg font-extrabold text-white">{k}</span>
                    <span className="text-sm font-semibold text-white/90">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x mt-8 mb-4 md:mt-10">
        <div className="info-rail grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {usps.map((u) => (
            <div key={u.title}>
              <p className="font-bold text-ink">{u.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{u.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow">Diensten</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-ink md:text-4xl">
              Meer dan enkel een <span className="text-teal">website</span>
            </h2>
            <p className="mt-3 text-ink-soft">
              Kies modules die u nodig heeft — of laat het volledige traject door ons uitvoeren.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {services.map((s, i) => {
              const style = serviceStyles[i % serviceStyles.length];
              return (
                <Link
                  key={s.slug}
                  href={`/diensten/${s.slug}`}
                  className="group flex overflow-hidden text-white transition hover:brightness-[1.04]"
                >
                  {/* Links: kleurblok met nummer */}
                  <div
                    className={`flex w-[4.75rem] shrink-0 flex-col items-center justify-center sm:w-24 ${style.left}`}
                  >
                    <span className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Rechts: gradient + overlay */}
                  <div className={`relative min-w-0 flex-1 bg-gradient-to-br ${style.right}`}>
                    <div className="absolute inset-0 bg-[rgba(8,12,20,0.42)] transition group-hover:bg-[rgba(8,12,20,0.32)]" />
                    <div className="relative p-5 md:p-6">
                      <h3 className="text-lg font-bold">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/90">{s.summary}</p>
                      <p className="mt-3 text-sm font-bold">Details bekijken →</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-8">
            <Link href="/diensten" className="btn-secondary text-sm">
              Alle diensten
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-bg-alt">
        <div className="container-x">
          <div className="mb-10">
            <p className="eyebrow">Content onder één dak</p>
            <h2 className="mt-3 whitespace-nowrap font-[family-name:var(--font-display)] text-2xl font-bold text-ink sm:text-3xl md:text-4xl">
              Logo, teksten, foto &amp; video — <span className="text-coral">apart of samen</span>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {contentPackages.map((c, i) => {
              const headers = [
                "bg-[#007aff]",
                "bg-[#0d9488]",
                "bg-[#16a34a]",
                "bg-[#ef4444]",
              ] as const;
              return (
                <article
                  key={c.title}
                  className="overflow-hidden border border-[#d7e3f2] bg-white shadow-[0_16px_36px_rgba(0,0,0,0.26)]"
                >
                  <div className={`px-5 py-6 ${headers[i]}`}>
                    <h3 className="text-lg font-bold text-white">{c.title}</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-xl font-extrabold text-blue-deep">{c.price}</p>
                    <p className="mt-2 text-sm text-muted-on-light">{c.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow">Sectoren</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-ink md:text-4xl">
              Ervaring in <span className="text-blue">uiteenlopende markten</span>
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {branches.map((b, i) => (
              <div
                key={b}
                className={`rounded-md border px-4 py-5 text-sm font-semibold ${
                  [
                    "border-blue/40 bg-blue/10 text-[#93c5fd]",
                    "border-teal/40 bg-teal/10 text-[#5eead4]",
                    "border-green/40 bg-green/10 text-[#86efac]",
                    "border-coral/40 bg-coral/10 text-[#fca5a5]",
                    "border-purple-400/40 bg-purple-500/10 text-[#c4b5fd]",
                  ][i % 5]
                }`}
              >
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Werkwijze — tekst links, stappen rechts onder elkaar */}
      <section className="section overflow-visible bg-bg-alt">
        <div className="container-x overflow-visible">
          <div className="grid gap-10 overflow-visible lg:grid-cols-[1.35fr_0.65fr] lg:gap-8">
            <div className="relative overflow-visible lg:sticky lg:top-28 lg:self-start">
              {/* Gradient: stopt ±60px onder de tekst */}
              <div className="relative z-0 w-[calc(100%+80px)] bg-gradient-to-br from-[#007aff] via-[#0d9488] to-[#16a34a] px-7 pb-[90px] pt-10 md:px-9 md:pt-12">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
                <div className="pointer-events-none absolute bottom-0 left-10 h-36 w-36 rounded-full bg-[#ef4444]/25 blur-2xl" />

                <p className="relative text-xs font-bold tracking-[0.16em] text-white/85 uppercase">
                  Werkwijze
                </p>
                <h2 className="relative mt-6 font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.08] tracking-[0.04em] text-white uppercase md:text-5xl lg:text-6xl [text-shadow:0.5px_0_0_currentColor,-0.5px_0_0_currentColor,0_0.5px_0_currentColor,0_-0.5px_0_currentColor]">
                  <span className="block">Van intake</span>
                  <span className="mt-2 block">Tot live</span>
                  <span className="mt-2 block text-white/95">Helder proces</span>
                </h2>
                <p className="relative mt-8 text-sm font-semibold tracking-wide text-white/90 uppercase">
                  Vijf duidelijke stappen. Geen verrassingen,
                  <span className="mt-2 block">wel tempo en overzicht.</span>
                </p>
              </div>

              {/* Rode box BUITEN de gradient — hangt eronderuit */}
              <div className="relative z-10 -mt-[62px] -mr-[152px] ml-auto flex w-[min(100%,28rem)] flex-col rounded-tr-3xl rounded-br-3xl rounded-bl-3xl bg-coral px-7 py-6 text-base leading-snug text-white md:-mr-[232px] md:w-[30rem] md:px-8 md:py-7 md:text-lg">
                <p>
                  Écht maatwerk maakt van een &lsquo;gewone website&rsquo; een{" "}
                  <strong>professionele website!</strong>
                </p>
                <Link
                  href="/werkwijze"
                  className="mt-4 ml-auto inline-flex border border-white/50 bg-white px-4 py-2.5 text-sm font-bold tracking-wide text-coral uppercase transition hover:bg-white/90"
                >
                  Volledige werkwijze
                </Link>
              </div>
            </div>

            <div className="relative z-20 flex justify-end lg:-mt-[76px] lg:self-start">
              <div className="w-full max-w-[21rem] border border-line bg-[#121a2b] shadow-[0_16px_40px_rgba(0,0,0,0.35)] lg:max-w-[24rem]">
              {processSteps.map((step, i) => {
                const accents = [
                  "text-[#60a5fa]",
                  "text-[#2dd4bf]",
                  "text-[#4ade80]",
                  "text-[#f87171]",
                  "text-[#a78bfa]",
                ] as const;
                return (
                  <article
                    key={step.step}
                    className={`flex gap-3.5 px-4 py-3.5 ${
                      i < processSteps.length - 1 ? "border-b border-line" : ""
                    }`}
                  >
                    <p
                      className={`w-9 shrink-0 font-[family-name:var(--font-display)] text-2xl font-extrabold ${accents[i]}`}
                    >
                      {step.step}
                    </p>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold tracking-wide text-ink uppercase">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs leading-snug text-ink-soft">
                        {step.text}
                      </p>
                    </div>
                  </article>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow">Referenties</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-ink md:text-4xl">
                Cases met <span className="text-coral">meetbaar resultaat</span>
              </h2>
            </div>
            <Link href="/portfolio" className="btn-ghost text-sm">
              Alle referenties
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {portfolio.slice(0, 3).map((item, i) => (
              <article key={item.title} className="overflow-hidden rounded-tr-2xl bg-[#121a2b] ring-1 ring-line">
                <div
                  className={`flex h-40 items-end bg-gradient-to-br p-6 ${
                    i === 0
                      ? "from-blue to-teal"
                      : i === 1
                        ? "from-teal to-green"
                        : "from-coral to-blue"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold tracking-wider text-white/85 uppercase">
                      {item.sector}
                    </p>
                    <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="font-semibold text-teal">{item.result}</p>
                  <p className="mt-2 text-sm text-ink-soft">{item.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-white/5 px-3 py-1 text-xs font-bold text-ink-soft"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-bg-alt">
        <div className="container-x grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">Klantfeedback</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-ink md:text-4xl">
              Wat opdrachtgevers zeggen
            </h2>
            <div className="mt-8 grid gap-4">
              {reviews.slice(0, 2).map((r, i) => (
                <blockquote
                  key={r.name}
                  className={`card p-6 ${i === 0 ? "card-blue" : "card-teal"}`}
                >
                  <p className="text-sm font-bold tracking-wide text-blue-deep uppercase">
                    Beoordeling 5/5
                  </p>
                  <p className="mt-3 leading-relaxed text-ink-on-light">&ldquo;{r.quote}&rdquo;</p>
                  <footer className="mt-4 border-t border-[#dbe4f0] pt-4">
                    <p className="font-bold text-ink-on-light">{r.name}</p>
                    <p className="text-sm text-muted-on-light">{r.role}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-tr-2xl bg-gradient-to-br from-[#007aff] to-[#0d9488] p-7 text-white shadow-xl">
              <p className="text-xs font-bold tracking-[0.16em] text-white/80 uppercase">
                Snel starten
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold">
                Offerte binnen 24 uur
              </h3>
              <p className="mt-3 text-sm text-white/90">
                Vertel wat u nodig heeft. U krijgt een helder voorstel met scope, timing en prijs.
              </p>
              <Link
                href="/offerte"
                className="mt-6 inline-flex rounded-md bg-white px-5 py-3 text-sm font-bold text-[#0056c7]"
              >
                Offerte aanvragen
              </Link>
            </div>
            <div className="card card-coral p-6">
              <h3 className="font-bold text-ink-on-light">Nog geen content?</h3>
              <p className="mt-2 text-sm text-muted-on-light">
                Geen probleem. Wij verzorgen logo, teksten, fotografie en video zodat u niet
                met vijf leveranciers hoeft te werken.
              </p>
              <Link href="/briefing" className="mt-4 inline-block text-sm font-bold text-blue-deep">
                Briefing uploaden →
              </Link>
            </div>
            <div className="card card-purple p-6">
              <h3 className="font-bold text-ink-on-light">Transparante prijzen</h3>
              <p className="mt-2 text-sm text-muted-on-light">
                Essentie vanaf €1.250 · Compleet vanaf €2.995 · Op maat op aanvraag.
              </p>
              <Link href="/prijzen" className="mt-4 inline-block text-sm font-bold text-blue-deep">
                Bekijk pakketten →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
