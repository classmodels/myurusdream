"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { id: string; title: string; body: string; url: string; read: boolean };

export function NotificationBell({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!loggedIn) return;
    let stop = false;
    async function load() {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok || stop) return;
        const data = await res.json();
        setUnread(data.unread || 0);
        setItems(data.items || []);
      } catch {
        /* keep last */
      }
    }
    load();
    const t = setInterval(load, 20000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [loggedIn]);

  if (!loggedIn) return null;

  async function markRead() {
    setOpen((v) => !v);
    if (!open && unread) {
      await fetch("/api/notifications", { method: "POST" }).catch(() => undefined);
      setUnread(0);
      setItems((rows) => rows.map((r) => ({ ...r, read: true })));
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={markRead} className="relative text-white/80 hover:text-yellow" aria-label="Berichten">
        <span className="text-xs uppercase tracking-widest">Berichten</span>
        {unread > 0 ? (
          <span className="absolute -right-2 -top-2 rounded-full bg-yellow px-1.5 text-[10px] text-black">
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-80 max-w-[90vw] border border-white/15 bg-black p-3 shadow-xl">
          {items.length ? (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={item.url} className="block hover:text-yellow" onClick={() => setOpen(false)}>
                    <p className="font-display text-sm text-yellow">{item.title}</p>
                    <p className="text-xs text-white/70">{item.body}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Geen berichten.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
