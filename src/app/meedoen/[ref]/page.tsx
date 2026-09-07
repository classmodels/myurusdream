import type { Metadata } from "next";
import { MeedoenScreen } from "../MeedoenScreen";
import { shareUrl } from "@/lib/share";
import { socialShareMetadata } from "@/lib/share-meta";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  return {
    title: "Doe mee voor €2",
    ...(await socialShareMetadata(shareUrl(ref))),
  };
}

export default async function MeedoenRefPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  return <MeedoenScreen invitedBy={ref} />;
}
