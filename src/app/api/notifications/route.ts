import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser("participant");
  if (!user) return NextResponse.json({ items: [], unread: 0 });

  const items = await prisma.notice.findMany({
    where: { OR: [{ userId: user.id }, { userId: null }] },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { reads: { where: { userId: user.id } } },
  });

  return NextResponse.json({
    unread: items.filter((n) => n.reads.length === 0).length,
    items: items.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      url: n.url || "/",
      createdAt: n.createdAt,
      read: n.reads.length > 0,
    })),
  });
}

export async function POST() {
  const user = await getSessionUser("participant");
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const items = await prisma.notice.findMany({
    where: { OR: [{ userId: user.id }, { userId: null }] },
    select: { id: true },
  });
  await prisma.noticeRead.createMany({
    data: items.map((n) => ({ noticeId: n.id, userId: user.id })),
    skipDuplicates: true,
  });
  return NextResponse.json({ ok: true });
}
