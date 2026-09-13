import Link from "next/link";
import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden">
      <img src="/images/urus-night.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/78" />
      <div className="relative mx-auto max-w-md px-5 pb-24 pt-28">
        <p className="font-display text-sm tracking-[0.3em] text-yellow">Alleen voor de organisator</p>
        <h1 className="mt-3 font-display text-4xl">Admin</h1>
        <p className="mt-3 text-sm text-white/70">
          Dit is niet de campagne-homepage. De publieke site staat op de startpagina.
        </p>
        <p className="mt-2 text-sm text-muted">Lokaal: admin@myurusdream.local / admin123</p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
        <Link href="/" className="btn-yellow mt-8 w-full">
          Naar de publieke site
        </Link>
      </div>
    </div>
  );
}
