import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getSessionUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ResetReferralClient } from "@/components/ResetReferralClient";

export const dynamic = "force-dynamic";

export default async function InloggenPage() {
  const dict = await getDictionary();
  const user = await getSessionUser("participant");
  if (user) redirect("/dashboard");
  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden">
      <ResetReferralClient />
      <img src="/images/urus-villa.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/72" />
      <div className="relative mx-auto max-w-md px-5 pb-24 pt-28">
        <p className="font-display text-sm tracking-[0.3em] text-yellow">{dict.inloggen.kicker}</p>
        <h1 className="mt-3 font-display text-5xl">{dict.inloggen.title}</h1>
        <p className="mt-4 text-white/75">{dict.inloggen.lead}</p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/" className="btn-ghost">
            {dict.meedoen.backHome}
          </Link>
          <Link href="/meedoen" className="text-sm uppercase tracking-widest text-yellow">
            {dict.inloggen.ctaJoin}
          </Link>
        </div>
      </div>
    </div>
  );
}
