"use client";

import { useEffect, useState } from "react";
import { Accordion } from "@/components/Accordion";

type RankRow = {
  rank: number;
  firstName: string;
  lastName: string;
  points: number;
  tickets: number;
  isYou: boolean;
};

type TicketRow = {
  id: string;
  entryNumber: string;
  firstName: string;
  lastName: string;
  isYou: boolean;
};

export function RankingLive({
  initialRanking,
  initialTickets,
}: {
  initialRanking: RankRow[];
  initialTickets: TicketRow[];
}) {
  const [ranking, setRanking] = useState(initialRanking);
  const [tickets, setTickets] = useState(initialTickets);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const res = await fetch("/api/ranking", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { ranking?: RankRow[]; tickets?: TicketRow[] };
        if (!alive) return;
        if (Array.isArray(data.ranking)) setRanking(data.ranking);
        if (Array.isArray(data.tickets)) setTickets(data.tickets);
      } catch {
        /* keep last snapshot */
      }
    }
    const id = window.setInterval(tick, 4000);
    tick();
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <>
      <Accordion
        title="Ranking — hoever reikt uw uitnodiging?"
        description="Eerpunten uit delen: +2 rechtstreeks, +1 via via. Geen prijs — bekijk uw populariteit."
      >
        {!ranking.length ? (
          <p className="px-5 py-4 text-white/70">Nog geen bijdragen. Stort €2 om te starten.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {ranking.map((row) => (
              <div
                key={`${row.rank}-${row.firstName}-${row.lastName}`}
                className={`flex items-baseline justify-between gap-3 px-5 py-3 ${
                  row.isYou ? "bg-yellow/10" : ""
                }`}
              >
                <p>
                  <span className="mr-3 font-display text-yellow">{row.rank}</span>
                  <span className={row.isYou ? "text-yellow" : ""}>
                    {row.firstName} {row.lastName}
                    {row.isYou ? " (u)" : ""}
                  </span>
                  <span className="ml-2 text-sm text-white/45">
                    {row.tickets} {row.tickets === 1 ? "bijdrage" : "bijdragen"}
                  </span>
                </p>
                <p className="font-display text-xl text-yellow">{row.points}</p>
              </div>
            ))}
          </div>
        )}
      </Accordion>

      <Accordion
        title="Uw stortingen"
        description="Elke bevestigde €2 helpt het doel. Geen ticket, geen kans op winst — alleen vrijwillige steun."
      >
        {!tickets.length ? (
          <p className="px-5 py-4 text-white/70">Nog geen stortingen.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {tickets.map((row, index) => (
              <div
                key={row.id}
                className={`flex flex-wrap items-baseline justify-between gap-3 px-5 py-3 ${
                  row.isYou ? "bg-yellow/10" : ""
                }`}
              >
                <p>
                  <span className="mr-3 font-display text-yellow">{index + 1}</span>
                  <span className={row.isYou ? "text-yellow" : ""}>
                    {row.firstName} {row.lastName}
                    {row.isYou ? " (u)" : ""}
                  </span>
                </p>
                <p className="font-mono text-sm text-yellow">{row.entryNumber}</p>
              </div>
            ))}
          </div>
        )}
      </Accordion>
    </>
  );
}
