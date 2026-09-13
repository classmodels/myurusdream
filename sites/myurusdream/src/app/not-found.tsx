import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative isolate min-h-[70svh] overflow-hidden">
      <img src="/images/urus-night.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative mx-auto max-w-2xl px-5 py-32 text-center">
        <p className="font-display text-sm tracking-[0.35em] text-yellow">404</p>
        <h1 className="mt-4 font-display text-5xl">Deze pagina bestaat niet</h1>
        <p className="mt-4 text-white/75">Ga terug naar de campagne of bekijk hoe het werkt.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-yellow">
            Naar de homepage
          </Link>
          <Link href="/#how-it-works" className="btn-ghost">
            Hoe het werkt
          </Link>
        </div>
      </div>
    </div>
  );
}
