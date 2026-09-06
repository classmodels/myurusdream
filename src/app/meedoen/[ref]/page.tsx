import type { Metadata } from "next";
import { MeedoenScreen } from "../MeedoenScreen";
import { getShareCopy, shareUrl } from "@/lib/share";
import { TAGLINE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  const copy = await getShareCopy();
  const url = shareUrl(ref);
  return {
    title: "Doe mee voor €2",
    description: copy.text,
    openGraph: {
      title: "myurusdream.be | €2 voor een droom",
      description: copy.text,
      url,
      type: "website",
      locale: "nl_BE",
      images: [{ url: "/5.png", width: 1200, height: 630, alt: TAGLINE }],
    },
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
