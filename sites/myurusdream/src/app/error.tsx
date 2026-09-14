"use client";

export default function HostedSiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <p className="text-lg font-semibold">Deze pagina kon even niet geladen worden.</p>
      <button type="button" className="btn-yellow" onClick={() => reset()}>
        Opnieuw proberen
      </button>
    </div>
  );
}
