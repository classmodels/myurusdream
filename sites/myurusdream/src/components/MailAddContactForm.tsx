"use client";

import { useActionState } from "react";
import { addMailContact, type AddContactState } from "@/app/admin/actions";

export function MailAddContactForm({ listId }: { listId: string }) {
  const [state, action, pending] = useActionState<AddContactState, FormData>(addMailContact, {});

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="listId" value={listId} />
      <label className="grid gap-1 text-sm">
        E-mail
        <input name="email" type="email" required placeholder="info@bedrijf.be" />
      </label>
      <label className="grid gap-1 text-sm">
        Bedrijf
        <input name="company" placeholder="Optioneel" />
      </label>
      <label className="grid gap-1 text-sm">
        Voornaam
        <input name="firstName" placeholder="Optioneel" />
      </label>
      <label className="grid gap-1 text-sm">
        Naam
        <input name="lastName" placeholder="Optioneel" />
      </label>
      {state.error ? <p className="text-sm text-yellow md:col-span-2">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-yellow md:col-span-2">{state.ok}</p> : null}
      <button className="btn-yellow w-fit" disabled={pending}>
        {pending ? "Bezig…" : "Adres toevoegen"}
      </button>
    </form>
  );
}
