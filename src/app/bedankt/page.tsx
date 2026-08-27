import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { shareLinks } from "@/lib/share";
import { SHARE_TEXT } from "@/lib/constants";
import { fulfillPaidPayment } from "@/lib/payments";
import { getMollie, mollieConfigured } from "@/lib/mollie";

export const dynamic = "force-dynamic";

export default async function BedanktPage({
  searchParams,
}: {
  searchParams: Promise<{ pid?: string }>;
}) {
  const { pid } = await searchParams;
  let user = await getSessionUser("participant");

  if (pid && mollieConfigured()) {
    const payment = await prisma.payment.findUnique({ where: { id: pid } });
    if (payment?.mollieId && payment.status !== "paid") {
      try {
        const remote = await getMollie().payments.get(payment.mollieId);
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

  const paid = user
    ? await prisma.payment.findFirst({
        where: { userId: user.id, status: "paid" },
        orderBy: { paidAt: "desc" },
      })
    : pid
      ? await prisma.payment.findUnique({ where: { id: pid } })
      : null;

  const confirmed = paid?.status === "paid";
  const fullUser = user || (paid ? await prisma.user.findUnique({ where: { id: paid.userId } }) : null);
  const links = shareLinks(fullUser?.referralCode);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 text-center">
      <p className="font-display text-sm tracking-[0.3em] text-yellow">Bevestiging</p>
      <h1 className="mt-4 font-display text-5xl md:text-6xl">
        {confirmed ? "Bedankt. U bent deel van de droom." : "We wachten op bevestiging."}
      </h1>
      <p className="mt-6 text-white/75">
        {confirmed
          ? SHARE_TEXT
          : "Als u via Mollie betaalde, kan de bevestiging enkele seconden duren. Vernieuw deze pagina of open uw dashboard zodra de e-mail/link binnen is."}
      </p>
      {confirmed ? (
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a className="btn-yellow" href={links.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a className="btn-ghost" href={links.facebook} target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a className="btn-ghost" href={links.email}>
            E-mail
          </a>
          <CopyLink url={links.url} />
        </div>
      ) : null}
      <div className="mt-10 flex justify-center gap-4">
        <Link href="/dashboard" className="btn-ghost">
          Naar dashboard
        </Link>
        <Link href="/volg-alles" className="text-sm uppercase tracking-widest text-yellow self-center">
          Volg alles mee
        </Link>
      </div>
    </div>
  );
}

function CopyLink({ url }: { url: string }) {
  return (
    <form action={undefined}>
      <a className="btn-ghost" href={url}>
        Kopieer / open link
      </a>
    </form>
  );
}
