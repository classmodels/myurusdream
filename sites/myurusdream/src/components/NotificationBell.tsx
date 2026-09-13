"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDict } from "@/lib/i18n/client";

type Item = {
  id: string;
  title: string;
  body: string;
  url: string;
  link: string | null;
  read: boolean;
};

export function NotificationBell({ loggedIn }: { loggedIn?: boolean }) {
  const dict = useDict();
  const t = dict.notifications;
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok || stop) return;
        const data = await res.json();
        let list: Item[] = data.items || [];
        if (!loggedIn) {
          const hidden = hiddenIds();
          list = list.filter((i) => !hidden.includes(i.id));
        }
        setUnread(loggedIn ? data.unread || 0 : list.length);
      } catch {
        /* keep last */
      }
    }
    load();
    const timer = setInterval(load, 15000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [loggedIn]);

  return (
    <Link
      href="/berichten"
      className="relative whitespace-nowrap text-[10px] uppercase tracking-[0.1em] text-white/75 hover:text-yellow"
      aria-label={t.label}
    >
      {t.label}
      {unread > 0 ? (
        <span className="ml-1 rounded-full bg-yellow px-1.5 text-[10px] text-black">{unread}</span>
      ) : null}
    </Link>
  );
}

function hiddenIds(): string[] {
  try {
    const raw = localStorage.getItem("myurusdream_hidden_notices");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
