import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { ParticipantDashboard } from "@/components/ParticipantDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDeelnemerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getSessionUser("admin");
  if (!admin) redirect("/admin/login");
  const { id } = await params;
  const data = await getDashboardData(id);
  if (!data || data.user.role === "admin") notFound();
  return <ParticipantDashboard data={data} preview />;
}
