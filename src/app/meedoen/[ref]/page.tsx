import { MeedoenScreen } from "../MeedoenScreen";

export const dynamic = "force-dynamic";

export default async function MeedoenRefPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  return <MeedoenScreen invitedBy={ref} />;
}
