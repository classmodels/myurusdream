import Link from "next/link";
import { cookies } from "next/headers";
import { MeedoenForm } from "./MeedoenForm";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { mollieConfigured } from "@/lib/mollie";
import { REF_COOKIE, normalizeReferralCode } from "@/lib/referral";
import { attachReferral } from "@/lib/referral-attach";
import { RepeatDonateButton } from "@/components/RepeatDonateButton";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pixelOrderHref, sponsorSignupHref } from "@/lib/sponsors";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function MeedoenScreen({ invitedBy }: { invitedBy?: string }) {
  const dict = await getDictionary();
  const m = dict.meedoen;
  const cookieStore = await cookies();
  const fromLink = normalizeReferralCode(invitedBy);
  let ref = fromLink || normalizeReferralCode(cookieStore.get(REF_COOKIE)?.value);
  const campaign = await getCampaign();
  const gate = paymentsAllowed(campaign);
  const participant = await getSessionUser("participant");
  // Eigen code in cookie/link telt niet als uitnodiging.
  if (participant?.referralCode && ref === participant.referralCode) {
    ref = "";
  }
  if (participant && ref) {
    await attachReferral({
      userId: participant.id,
      email: participant.email,
      phoneNormalized: participant.phoneNormalized,
      refCode: ref,
      payerIp: null,
    });
  }
  const paidCount = participant
    ? await prisma.payment.count({
        where: { userId: participant.id, status: "paid", kind: "contribution" },
      })
    : 0;
  const loggedInDonor = Boolean(participant && paidCount > 0);
  const depositsWord = paidCount === 1 ? dict.counter.deposit : dict.counter.deposits;

  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden">
      <img
        src="/images/urus-hero.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-24 pt-28 md:grid-cols-2">
        <div>
          <p className="font-display text-lg tracking-[0.08em] text-yellow md:text-xl">
            {m.thanksLead}
          </p>
          <h1 className="mt-3 font-display text-3xl leading-[1.2] md:text-4xl">
            {m.titleBefore} <span className="text-yellow">€2</span>
            {loggedInDonor ? m.extra : ""}
          </h1>
          <p className="mt-4 text-white/80">{loggedInDonor ? m.loggedInLead : m.lead}</p>
          <ul className="mt-8 space-y-2 text-yellow">
            <li>{m.bullet1}</li>
            <li className="!text-base">{m.bullet2}</li>
          </ul>
          <div className="mt-8 border border-yellow/30 bg-[#111] p-4 text-sm text-white/80">
            <p className="uppercase tracking-widest text-yellow">{m.ifNotReached}</p>
            <p className="mt-2">{m.ifNotReachedBody}</p>
          </div>
          <p className="mt-8 text-white/80">
            {m.businessBefore}{" "}
            <Link href={sponsorSignupHref("gold")} className="text-yellow">
              {m.becomeSponsor}
            </Link>{" "}
            {m.or}{" "}
            <Link href={pixelOrderHref()} className="text-yellow">
              {m.buyPixels}
            </Link>
            .
          </p>
          <Link href="/#how-it-works" className="btn-ghost mt-8">
            {m.howWorks}
          </Link>
        </div>
        {loggedInDonor ? (
          gate.allowed ? (
          <div className="card-dark space-y-4 p-5">
            <p className="font-display text-2xl">
              {m.hello.replace("{name}", participant?.firstName || "")}
            </p>
            <p className="text-white/75">
              {m.alreadyPaid
                .replace("{count}", String(paidCount))
                .replace("{deposits}", depositsWord)}
            </p>
            <RepeatDonateButton />
            <p className="text-[0.7rem] text-muted">{m.stayLogged}</p>
          </div>
          ) : (
            <MeedoenForm blockedReason={gate.reason} mollieReady={await mollieConfigured()} />
          )
        ) : (
          <MeedoenForm
            blockedReason={gate.allowed ? null : gate.reason}
            mollieReady={await mollieConfigured()}
            referralCode={ref}
          />
        )}
      </div>
    </div>
  );
}
