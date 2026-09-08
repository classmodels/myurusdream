import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { ParticipantDashboard } from "@/components/ParticipantDashboard";
import { MeldingenBlock } from "@/components/MeldingenBlock";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dict = await getDictionary();
  const user = await getSessionUser("participant");
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl space-y-12 px-5 pb-24 pt-28">
        <div>
          <p className="font-display text-sm tracking-[0.3em] text-yellow">{dict.nav.dashboard}</p>
          <h1 className="mt-3 font-display text-4xl">{dict.dashboard.title}</h1>
          <p className="mt-4 max-w-xl text-white/75">{dict.dashboard.lead}</p>
          <Link href="/inloggen" className="btn-yellow mt-6 inline-flex">
            {dict.dashboard.login}
          </Link>
        </div>
        <MeldingenBlock />
      </div>
    );
  }
  const data = await getDashboardData(user.id);
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl space-y-12 px-5 pb-24 pt-28">
        <MeldingenBlock />
      </div>
    );
  }
  return <ParticipantDashboard data={data} />;
}
