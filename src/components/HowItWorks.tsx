import Link from "next/link";

const steps = [
  { n: "01", title: "Stort €2 — zo vaak u wilt", icon: "wallet" },
  { n: "02", title: "Elke storting: 5 punten en een extra lotnummer", icon: "star" },
  { n: "03", title: "Na uw storting delen WhatsApp, Facebook en e-mail uw code mee", icon: "share" },
  { n: "04", title: "Wie via uw link stort, krijgt zelf 5 punten. U krijgt +2", icon: "people" },
  { n: "05", title: "Elke extra storting in uw lijn: +1 punt voor u", icon: "chart" },
  { n: "06", title: "Twee weekends via punten, twee via loting — alleen als het doel gehaald is", icon: "gift" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative z-0 -mt-[70px] overflow-hidden py-20 md:py-28">
      <span id="hoe" className="absolute top-0" aria-hidden />
      <div className="absolute inset-0">
        <img
          src="/images/urus-night.png"
          alt="Gele Urus bij nacht — sfeerbeeld"
          className="h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5">
        <p className="font-display text-5xl italic md:text-7xl">
          HOE <span className="text-yellow">WERKT HET?</span>
        </p>
        <p className="mt-4 max-w-xl text-white/70">
          Eén kleine, vrijwillige bijdrage — of meerdere, als u wilt. Geen abonnement. Na uw
          eerste €2 sturen de deelknoppen op de site automatisch uw persoonlijke code mee.
        </p>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="step-para flex items-center gap-4 border border-yellow/70 bg-black/70 px-6 py-4"
              >
                <span className="font-display text-2xl text-yellow">{s.n}</span>
                <StepIcon name={s.icon} />
                <p className="font-medium">{s.title}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <div className="border border-yellow/60 bg-black/70 p-6">
              <p className="font-display text-2xl text-yellow">UW KANSEN</p>
              <ul className="mt-3 space-y-2 text-white/80">
                <li>Elke €2: 5 punten, bijgeteld, plus een extra lotnummer.</li>
                <li>Wie uw persoonlijke link deelde: +2 bij elke storting via die link.</li>
                <li>Elke volgende storting in die lijn: +1 voor de eerdere doorstuurders.</li>
                <li>
                  Als het doel van €400.000 gehaald is: twee weekends voor de hoogste punten,
                  twee weekends geloot uit de lotinglijst (meer €2 = meer kansen).
                </li>
              </ul>
            </div>
            <div className="border border-yellow/60 bg-black/70 p-6">
              <p className="font-display text-2xl text-yellow">TRANSPARANTIE</p>
              <p className="mt-3 text-white/80">
                Iedereen kan de teller en het opgehaalde bedrag volgen. Uw punten en
                persoonlijke link staan in uw dashboard.
              </p>
              <Link href="/volg-alles" className="mt-4 inline-block text-sm uppercase tracking-widest text-yellow">
                Bekijk de live teller →
              </Link>
            </div>
            <p className="text-center text-sm text-white/60">
              <span className="text-yellow">♥</span> Vrijwillige steun van €2 — transparant, eenvoudig en zichtbaar
            </p>
            <Link href="/meedoen" className="btn-yellow">
              Ik doe mee voor €2
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepIcon({ name }: { name: string }) {
  const common = "h-7 w-7 shrink-0 text-white";
  if (name === "wallet") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
        <circle cx="16" cy="13.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (name === "star") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3l2.2 6.4H21l-5.3 3.9 2 6.2L12 16.8 6.3 19.5l2-6.2L3 9.4h6.8L12 3z" />
      </svg>
    );
  }
  if (name === "share") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="6" cy="12" r="2.2" />
        <circle cx="17" cy="6" r="2.2" />
        <circle cx="17" cy="18" r="2.2" />
        <path d="M8 11.2 15 7.2M8 12.8l7 4" />
      </svg>
    );
  }
  if (name === "people") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="9" cy="8" r="3" />
        <circle cx="16" cy="9" r="2.2" />
        <path d="M4 18c.8-3 3-4.5 5-4.5s4.2 1.5 5 4.5M14 18c.4-2 1.8-3.2 3.5-3.2 1.4 0 2.6.8 3.2 3.2" />
      </svg>
    );
  }
  if (name === "gift") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="11" width="16" height="9" />
        <path d="M4 11h16M12 11v9M12 11c0-3 4-5 4-2s-4 1-4 2c0-1-4-5-4-2s4 2 4 2" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 19V5M4 19h16" />
      <path d="M7 15l4-4 3 3 5-7" />
    </svg>
  );
}
