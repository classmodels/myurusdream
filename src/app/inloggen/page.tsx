import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function InloggenPage() {
  const user = await getSessionUser("participant");
  if (user) redirect("/dashboard");
  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden">
      <img src="/images/urus-villa.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/72" />
      <div className="relative mx-auto max-w-md px-5 pb-24 pt-28">
        <p className="font-display text-sm tracking-[0.3em] text-yellow">Deelnemers</p>
        <h1 className="mt-3 font-display text-5xl">Dashboard openen</h1>
        <p className="mt-4 text-white/75">
          Na uw €2 blijft u ingelogd op dit toestel. Bent u uitgelogd? Open het dashboard opnieuw
          met hetzelfde e-mailadres én gsm-nummer als bij uw storting.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/" className="btn-ghost">
            Terug naar de homepage
          </Link>
          <Link href="/meedoen" className="text-sm uppercase tracking-widest text-yellow">
            Nog niet meegedaan? €2 →
          </Link>
        </div>
      </div>
    </div>
  );
}
