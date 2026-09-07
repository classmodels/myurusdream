import type { Metadata } from "next";
import { MeedoenScreen } from "./MeedoenScreen";
import { shareUrl } from "@/lib/share";
import { campaignShareMetadata } from "@/lib/share-meta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return campaignShareMetadata(shareUrl());
}

export default async function MeedoenPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <MeedoenScreen invitedBy={ref} />;
}
