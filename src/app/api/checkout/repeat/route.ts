import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { getSessionUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { parseRefCookie } from "@/lib/referral";
import { attachReferral } from "@/lib/referral-attach";
import { contributionCheckoutResponse, createContributionPayment } from "@/lib/contribution-checkout";

export async function POST(req: Request) {
  const user = await getSessionUser("participant");
  if (!user) {
    return NextResponse.json({ error: "Log eerst in om opnieuw te storten." }, { status: 401 });
  }

  const ip = clientIp(req.headers);
  const limited = rateLimit(`checkout-repeat:${user.id}`, 20, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });
  }

  const campaign = await getCampaign();
  const gate = paymentsAllowed(campaign);
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const body = await req.json().catch(() => ({} as { referralCode?: string }));
  const refCode =
    String(body.referralCode || "").trim() || parseRefCookie(req.headers.get("cookie"));
  if (refCode) {
    await attachReferral({
      userId: user.id,
      email: user.email,
      phoneNormalized: user.phoneNormalized,
      refCode,
    });
  }

  const payment = await createContributionPayment({
    userId: user.id,
    campaignId: campaign.id,
    amountCents: campaign.contributionCents,
    ip,
    userAgent: req.headers.get("user-agent")?.slice(0, 300) || null,
    referralCode: refCode || null,
  });

  return contributionCheckoutResponse(payment);
}
