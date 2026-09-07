import type { ReactNode } from "react";
import { AdminNav } from "@/components/AdminNav";

export function AdminChrome({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-5 pb-24 pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm tracking-[0.3em] text-yellow">Admin</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{title}</h1>
        </div>
        <a href="/api/admin/logout" className="btn-ghost text-sm">
          Uitloggen
        </a>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}

export function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-dark p-4">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl text-yellow">{value}</p>
    </div>
  );
}
