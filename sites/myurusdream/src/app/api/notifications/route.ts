import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { noticesVisibleToUser } from "@/lib/referral-rules";

export const dynamic = "force-dynamic";

const GUEST_SINCE_COOKIE = "myurusdream_notice_since";

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

function guestSinceFromCookie(raw: string | undefined): Date | null {
  if (!raw) return null;
  const ms = Number(raw);
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const parsed = new Date(ms);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET() {
  const user = await getSessionUser("participant");
  if (!user) {
    const store = await cookies();
    let since = guestSinceFromCookie(store.get(GUEST_SINCE_COOKIE)?.value);
    if (!since) {
      since = new Date();
      store.set(GUEST_SINCE_COOKIE, String(since.getTime()), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 400,
      });
    }
    const items = await prisma.notice.findMany({
      where: { userId: null, createdAt: { gte: since } },
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
      ...noticesVisibleToUser(user),
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
    where: noticesVisibleToUser(user),
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
