import { MeedoenScreen } from "./MeedoenScreen";

export const dynamic = "force-dynamic";

export default async function MeedoenPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <MeedoenScreen invitedBy={ref} />;
}
