import { LoginForm } from "./LoginForm";

export default function InloggenPage() {
  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-28">
      <h1 className="font-display text-5xl">Dashboard openen</h1>
      <p className="mt-4 text-white/70">
        Vul het e-mailadres in waarmee u €2 bijdroeg. Lokaal tonen we de toegangslink op het
        scherm omdat er geen e-mailserver is ingesteld.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
