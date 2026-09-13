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

export function BerichtenInbox({ loggedIn = false }: { loggedIn?: boolean }) {
  const dict = useDict();
  const t = dict.notifications;
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

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
        if (stop) return;
        setItems(list);
        setLoaded(true);
        if (loggedIn && list.some((i) => !i.read)) {
          await fetch("/api/notifications", { method: "POST" }).catch(() => undefined);
        }
      } catch {
        if (!stop) setLoaded(true);
      }
    }
    load();
    return () => {
      stop = true;
    };
  }, [loggedIn]);

  async function clearAll() {
    if (loggedIn) {
      await fetch("/api/notifications", { method: "DELETE" }).catch(() => undefined);
    } else {
      const ids = [...new Set([...hiddenIds(), ...items.map((i) => i.id)])];
      localStorage.setItem("myurusdream_hidden_notices", JSON.stringify(ids));
    }
    setItems([]);
  }

  return (
    <div className="border-y border-white/15">
      {!loaded ? (
        <p className="py-6 text-sm text-white/50">{dict.common.loading}</p>
      ) : items.length === 0 ? (
        <p className="py-6 text-sm text-white/55">{t.empty}</p>
      ) : (
        <>
          <ul className="divide-y divide-white/10">
            {items.map((item) => (
              <li key={item.id} className="py-4">
                <p className="font-display text-[0.7rem] tracking-[0.14em] text-yellow">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/75">{item.body}</p>
                {item.link && item.link !== "/" ? (
                  item.url.startsWith("http") ? (
                    <a href={item.url} className="mt-3 inline-block text-xs uppercase tracking-[0.14em] text-yellow hover:text-gold-bright">
                      {t.openPage} →
                    </a>
                  ) : (
                    <Link
                      href={item.url}
                      className="mt-3 inline-block text-xs uppercase tracking-[0.14em] text-yellow hover:text-gold-bright"
                    >
                      {t.openPage} →
                    </Link>
                  )
                ) : null}
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 py-4">
            <button
              type="button"
              onClick={clearAll}
              className="text-[0.65rem] uppercase tracking-[0.16em] text-white/45 hover:text-yellow"
            >
              {t.clearAll}
            </button>
          </div>
        </>
      )}
    </div>
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
