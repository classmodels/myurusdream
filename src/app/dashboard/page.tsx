import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { ParticipantDashboard } from "@/components/ParticipantDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser("participant");
  if (!user) redirect("/inloggen");
  const data = await getDashboardData(user.id);
  if (!data) redirect("/inloggen");
  return <ParticipantDashboard data={data} />;
}
