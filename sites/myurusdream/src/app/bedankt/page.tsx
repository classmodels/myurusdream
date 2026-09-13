import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { EnsureSession } from "@/components/EnsureSession";
import { fulfillPaidPayment } from "@/lib/payments";
import { getMollie, mollieConfigured } from "@/lib/mollie";
import { ShareRow } from "@/components/ShareRow";
import { RepeatDonateButton } from "@/components/RepeatDonateButton";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export default async function BedanktPage({
  searchParams,
}: {
  searchParams: Promise<{ pid?: string }>;
}) {
  const dict = await getDictionary();
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
      ? dict.bedankt.sponsor
      : kind === "pixel"
        ? dict.bedankt.pixel
        : dict.bedankt.title;

  return (
    <div className="relative isolate min-h-[70svh] overflow-hidden">
      <img src="/images/urus-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/72" />
      <div className="relative mx-auto max-w-xl px-5 pb-24 pt-28 text-center">
        <p className="font-display text-sm tracking-[0.3em] text-yellow">{dict.bedankt.kicker}</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">
          {confirmed ? thanksTitle : dict.bedankt.waiting}
        </h1>
        {confirmed && pid ? <EnsureSession paymentId={pid} /> : null}

        {confirmed && kind === "contribution" ? (
          <p className="mt-5 text-white/75">{dict.bedankt.lead}</p>
        ) : null}

        {confirmed && (kind === "sponsor" || kind === "pixel") ? (
          <p className="mt-5 text-white/75">
            Uw account staat klaar. Open het dashboard om uw logo te wijzigen en te zien hoeveel
            bezoekers via uw link naar uw site gingen.
          </p>
        ) : null}

        {confirmed && kind === "contribution" && fullUser ? (
          <div className="mt-8">
            <p className="mb-4 text-sm text-white/70">{dict.bedankt.shareLink}</p>
            <ShareRow compact referralCode={fullUser.referralCode} />
            <div className="mt-6">
              <RepeatDonateButton className="inline-block" />
            </div>
          </div>
        ) : null}

        {!confirmed ? (
          <p className="mt-6 text-white/75">
            De bevestiging kan enkele seconden duren. Vernieuw de pagina.
          </p>
        ) : null}

        <p className="mt-10 flex flex-wrap justify-center gap-6 text-sm uppercase tracking-widest">
          <Link href="/dashboard" className="text-yellow">
            Dashboard
          </Link>
          <Link href="/" className="text-white/70 hover:text-yellow">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}
