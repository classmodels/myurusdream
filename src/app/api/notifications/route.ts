import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function payload(
  items: { id: string; title: string; body: string; url: string | null; createdAt: Date; read: boolean }[],
  unread: number,
) {
  return NextResponse.json({
    unread,
    items: items.map((n) => {
      const url = n.url || "/";
      return {
        id: n.id,
        title: n.title,
        body: n.body,
        url,
        link: url !== "/" ? url : null,
        createdAt: n.createdAt,
        read: n.read,
      };
    }),
  });
}

export async function GET() {
  const user = await getSessionUser("participant");
  if (!user) {
    const items = await prisma.notice.findMany({
      where: { userId: null },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    return payload(
      items.map((n) => ({ ...n, read: false })),
      items.length,
    );
  }

  const items = await prisma.notice.findMany({
    where: {
      OR: [{ userId: user.id }, { userId: null }],
      NOT: { reads: { some: { userId: user.id, hidden: true } } },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { reads: { where: { userId: user.id } } },
  });
  const mapped = items.map((n) => ({ ...n, read: n.reads.length > 0 }));
  return payload(mapped, mapped.filter((n) => !n.read).length);
}

export async function POST() {
  const user = await getSessionUser("participant");
  if (!user) return NextResponse.json({ ok: true });
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

export async function DELETE() {
  const user = await getSessionUser("participant");
  if (!user) return NextResponse.json({ ok: true, guest: true });
  await prisma.notice.deleteMany({ where: { userId: user.id } });
  const leftover = await prisma.notice.findMany({
    where: { userId: null },
    select: { id: true },
  });
  await prisma.noticeRead.createMany({
    data: leftover.map((n) => ({ noticeId: n.id, userId: user.id, hidden: true })),
    skipDuplicates: true,
  });
  await prisma.noticeRead.updateMany({
    where: { userId: user.id },
    data: { hidden: true },
  });
  return NextResponse.json({ ok: true });
}
