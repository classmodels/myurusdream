import Link from "next/link";
import { cookies } from "next/headers";
import { MeedoenForm } from "./MeedoenForm";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { mollieConfigured } from "@/lib/mollie";
import { REF_COOKIE, normalizeReferralCode } from "@/lib/referral";
import { RepeatDonateButton } from "@/components/RepeatDonateButton";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pixelOrderHref, sponsorSignupHref } from "@/lib/sponsors";

export async function MeedoenScreen({ invitedBy }: { invitedBy?: string }) {
  const cookieStore = await cookies();
  const fromLink = normalizeReferralCode(invitedBy);
  const ref = fromLink || normalizeReferralCode(cookieStore.get(REF_COOKIE)?.value);
  const campaign = await getCampaign();
  const gate = paymentsAllowed(campaign);
  const participant = await getSessionUser("participant");
  const paidCount = participant
    ? await prisma.payment.count({
        where: { userId: participant.id, status: "paid", kind: "contribution" },
      })
    : 0;
  const loggedInDonor = Boolean(participant && paidCount > 0);

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
            Bedankt om mee te willen doen!
          </p>
          <h1 className="mt-3 font-display text-3xl leading-[1.2] md:text-4xl">
            Ik stort <span className="text-yellow">€2</span>
            {loggedInDonor ? " extra" : ""}
          </h1>
          <p className="mt-4 text-white/80">
            {loggedInDonor
              ? "U bent al ingelogd. Eén knop volstaat — we vragen uw naam, e-mail en gsm niet opnieuw. Elke extra €2 is +5 punten en een extra lotnummer."
              : "Geen account vooraf nodig. Bij uw €2 maken we automatisch een klein dashboard-account. U krijgt 5 punten, een lotnummer en een persoonlijke link. U mag later zo vaak extra €2 storten als u wilt."}
          </p>
          <ul className="mt-8 space-y-2 text-yellow">
            <li>Dit is geen goed doel, investering of belofte op winst.</li>
            <li className="!text-base">Dit is een open en transparante persoonlijke campagne.</li>
          </ul>
          <div className="mt-8 border border-yellow/30 bg-[#111] p-4 text-sm text-white/80">
            <p className="uppercase tracking-widest text-yellow">Als het doel niet wordt bereikt</p>
            <p className="mt-2">
              De campagne kan na de afloopdatum verlengd of stopgezet worden. Uw €2 of
              sponsorgeld wordt niet terugbetaald. We beloven geen succes — wel dat we open
              zeggen wat er volgt.
            </p>
          </div>
          <p className="mt-8 text-white/80">
            Bedrijf of zelfstandige?{" "}
            <Link href={sponsorSignupHref("gold")} className="text-yellow">
              Word sponsor
            </Link>{" "}
            of{" "}
            <Link href={pixelOrderHref()} className="text-yellow">
              koop pixels vanaf €10
            </Link>
            .
          </p>
          <Link href="/#how-it-works" className="btn-ghost mt-8">
            Bekijk hoe het werkt
          </Link>
        </div>
        {loggedInDonor ? (
          gate.allowed ? (
          <div className="card-dark space-y-4 p-5">
            <p className="font-display text-2xl">Hallo {participant?.firstName}</p>
            <p className="text-white/75">
              U hebt al {paidCount} {paidCount === 1 ? "storting" : "stortingen"}. Nog eens €2
              is één klik.
            </p>
            <RepeatDonateButton />
            <p className="text-[0.7rem] text-muted">
              U blijft ingelogd. Geen extra formulier, geen nieuwe gegevens.
            </p>
          </div>
          ) : (
            <MeedoenForm blockedReason={gate.reason} mollieReady={mollieConfigured()} />
          )
        ) : (
          <MeedoenForm
            blockedReason={gate.allowed ? null : gate.reason}
            mollieReady={mollieConfigured()}
            referralCode={ref}
          />
        )}
      </div>
    </div>
  );
}
