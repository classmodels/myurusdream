"use client";

import { useEffect, useState } from "react";

export function ActivityFeed() {
  const [items, setItems] = useState<{ text: string; at: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/activity", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <p key={`${item.at}-${i}`} className="border-l-2 border-yellow pl-4 text-white/80">
          {item.text}
        </p>
      ))}
    </div>
  );
}
