import { getSessionUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { BerichtenInbox } from "@/components/BerichtenInbox";

export const dynamic = "force-dynamic";

export default async function BerichtenPage() {
  const dict = await getDictionary();
  const user = await getSessionUser("participant");

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-28">
      <div className="mx-auto w-full max-w-[600px]">
        <p className="font-display text-[0.7rem] tracking-[0.28em] text-yellow">{dict.notifications.label}</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">{dict.notifications.label}</h1>
        <p className="mt-3 text-sm text-white/60">{dict.notifications.pageLead}</p>
        <div className="mt-8">
          <BerichtenInbox loggedIn={Boolean(user)} />
        </div>
      </div>
    </div>
  );
}
