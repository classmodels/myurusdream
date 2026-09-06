import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { EnsureSession } from "@/components/EnsureSession";
import { SHARE_TEXT } from "@/lib/constants";
import { fulfillPaidPayment } from "@/lib/payments";
import { getMollie, mollieConfigured } from "@/lib/mollie";
import { ShareRow } from "@/components/ShareRow";
import { RepeatDonateButton } from "@/components/RepeatDonateButton";

export const dynamic = "force-dynamic";

export default async function BedanktPage({
  searchParams,
}: {
  searchParams: Promise<{ pid?: string }>;
}) {
  const { pid } = await searchParams;
  let user = await getSessionUser("participant");

  if (pid && (await mollieConfigured())) {
    const payment = await prisma.payment.findUnique({ where: { id: pid } });
    if (payment?.mollieId && payment.status !== "paid") {
      try {
        const remote = await (await getMollie()).payments.get(payment.mollieId);
        if (remote.status === "paid") {
          await fulfillPaidPayment(payment.id);
        }
      } catch {
        /* webhook may still arrive */
      }
    }
  }

  if (pid && !user) {
    const payment = await prisma.payment.findUnique({
      where: { id: pid },
      include: { user: true },
    });
    if (payment?.status === "paid") {
      user = payment.user;
    }
  }

  const paid = pid
    ? await prisma.payment.findUnique({ where: { id: pid } })
    : user
      ? await prisma.payment.findFirst({
          where: { userId: user.id, status: "paid" },
          orderBy: { paidAt: "desc" },
        })
      : null;

  const confirmed = paid?.status === "paid";
  const fullUser = user || (paid ? await prisma.user.findUnique({ where: { id: paid.userId } }) : null);
  const kind = paid?.kind || "contribution";
  const thanksTitle =
    kind === "sponsor"
      ? "Bedankt. Uw merk staat straks in beeld."
      : kind === "pixel"
        ? "Bedankt. Uw pixels zijn van u."
        : "Bedankt. U bent deel van de droom.";
  const thanksBody =
    kind === "sponsor"
      ? "Zodra de betaling bevestigd is, verschijnt uw naam op de sponsorpagina — groter naarmate het bedrag groter is. Bij de live trekking blijft u in beeld."
      : kind === "pixel"
        ? "Uw vakken komen op de pixelmuur zodra de betaling bevestigd is. Logo of naam, klikbaar."
        : SHARE_TEXT;

  return (
    <div className="relative isolate min-h-[70svh] overflow-hidden">
      <img src="/images/urus-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/72" />
      <div className="relative mx-auto max-w-3xl px-5 pb-24 pt-28 text-center">
        <p className="font-display text-sm tracking-[0.3em] text-yellow">Bevestiging</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl">
          {confirmed ? thanksTitle : "We wachten op bevestiging."}
        </h1>
        <p className="mt-6 text-white/80">
          {confirmed
            ? thanksBody
            : "Als u via Mollie betaalde, kan de bevestiging enkele seconden duren. Vernieuw deze pagina. Daarna bent u automatisch ingelogd in uw dashboard."}
        </p>
        {confirmed && pid ? <EnsureSession paymentId={pid} /> : null}
        {confirmed ? (
          <div className="mt-10">
            {kind === "contribution" && fullUser ? (
              <p className="mb-5 text-white/80">
                +5 punten en een extra lotnummer. De knoppen hieronder sturen uw persoonlijke
                code mee. U mag zo vaak extra €2 storten als u wilt.
              </p>
            ) : null}
            <ShareRow referralCode={kind === "contribution" ? fullUser?.referralCode : undefined} />
            {kind === "contribution" ? (
              <div className="mt-6 flex justify-center">
                <RepeatDonateButton />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-10">
            <p className="mb-4 text-sm uppercase tracking-widest text-white/55">Deel de campagne alvast</p>
            <ShareRow />
          </div>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/dashboard" className="btn-ghost">
            Naar dashboard
          </Link>
          <Link href="/volg-alles" className="btn-yellow">
            Volg alles mee
          </Link>
          {kind === "sponsor" || kind === "pixel" ? (
            <Link href={kind === "pixel" ? "/koop-pixels" : "/sponsors"} className="btn-ghost">
              {kind === "pixel" ? "Naar de pixelmuur" : "Naar de sponsors"}
            </Link>
          ) : null}
          <Link href="/" className="self-center text-sm uppercase tracking-widest text-yellow">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
