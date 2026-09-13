"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RESERVED_PUBLIC_SLUGS } from "@/lib/preview-model";
import { usePathname } from "next/navigation";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const first = pathname.split("/").filter(Boolean)[0] || "";
  const clientLive = Boolean(first) && !RESERVED_PUBLIC_SLUGS.has(first);
  const bare = pathname.startsWith("/test/") || pathname.startsWith("/s/") || clientLive;

  if (bare) {
    return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
