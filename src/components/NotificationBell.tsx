"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  title: string;
  body: string;
  url: string;
  link: string | null;
  read: boolean;
};

export function NotificationBell({ loggedIn }: { loggedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Item[]>([]);

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
        setItems(list);
      } catch {
        /* keep last */
      }
    }
    load();
    const t = setInterval(load, 15000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [loggedIn]);

  async function openBox() {
    setOpen(true);
    setUnread(0);
    if (loggedIn) {
      await fetch("/api/notifications", { method: "POST" }).catch(() => undefined);
      setItems((rows) => rows.map((r) => ({ ...r, read: true })));
    }
  }

  async function clearAll() {
    if (loggedIn) {
      await fetch("/api/notifications", { method: "DELETE" }).catch(() => undefined);
    } else {
      const ids = [...new Set([...hiddenIds(), ...items.map((i) => i.id)])];
      localStorage.setItem("myurusdream_hidden_notices", JSON.stringify(ids));
    }
    setItems([]);
    setUnread(0);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openBox())}
        className="relative text-xs uppercase tracking-[0.14em] text-white/75 hover:text-yellow"
        aria-label="Berichten"
      >
        Berichten
        {unread > 0 ? (
          <span className="ml-1 rounded-full bg-yellow px-1.5 text-[10px] text-black">{unread}</span>
        ) : null}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/70 p-4 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md border border-white/20 bg-black p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-2xl text-yellow">Berichten</p>
              <button type="button" className="text-xs uppercase tracking-widest text-white/70" onClick={() => setOpen(false)}>
                Sluiten
              </button>
            </div>
            {items.length ? (
              <>
                <ul className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <li key={item.id} className="border border-white/10 p-3">
                      <p className="font-display text-sm text-yellow">{item.title}</p>
                      <p className="mt-1 text-sm text-white/80">{item.body}</p>
                      {item.link && item.link !== "/" ? (
                        item.url.startsWith("http") ? (
                          <a
                            href={item.url}
                            className="btn-yellow mt-3 inline-block text-center text-sm"
                            onClick={() => setOpen(false)}
                          >
                            Open deze pagina
                          </a>
                        ) : (
                          <Link
                            href={item.url}
                            className="btn-yellow mt-3 inline-block text-center text-sm"
                            onClick={() => setOpen(false)}
                          >
                            Open deze pagina
                          </Link>
                        )
                      ) : null}
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn-ghost mt-4 w-full text-sm" onClick={clearAll}>
                  Wis alle berichten
                </button>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">Geen berichten.</p>
            )}
          </div>
        </div>
      ) : null}
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
