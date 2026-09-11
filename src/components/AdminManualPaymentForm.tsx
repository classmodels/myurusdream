"use client";

import { useActionState } from "react";
import { createManualPayment, type ManualPaymentState } from "@/app/admin/actions";

export function AdminManualPaymentForm({ defaultKind = "sponsor" }: { defaultKind?: "sponsor" | "contribution" }) {
  const [state, action, pending] = useActionState<ManualPaymentState, FormData>(createManualPayment, {});

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <label className="grid gap-1 text-xs uppercase tracking-widest text-muted md:col-span-2">
        Type
        <select name="kind" defaultValue={defaultKind} className="normal-case">
          <option value="sponsor">Sponsor (zichtbaar op site)</option>
          <option value="contribution">Bijdrage / bedrag (deelnemer)</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs uppercase tracking-widest text-muted">
        Naam / bedrijf *
        <input name="name" required maxLength={80} placeholder="Bijv. Bakkerij Janssens" />
      </label>
      <label className="grid gap-1 text-xs uppercase tracking-widest text-muted">
        Bedrag (€) *
        <input
          name="amount"
          required
          inputMode="decimal"
          placeholder={defaultKind === "sponsor" ? "500" : "2"}
        />
      </label>
      <label className="grid gap-1 text-xs uppercase tracking-widest text-muted">
        Website (optioneel)
        <input name="url" maxLength={200} placeholder="www.bedrijf.be" />
      </label>
      <label className="grid gap-1 text-xs uppercase tracking-widest text-muted">
        E-mail (optioneel)
        <input name="email" type="email" maxLength={120} placeholder="factuur@bedrijf.be" />
      </label>
      <p className="text-sm text-muted md:col-span-2">
        Geen Mollie — het bedrag wordt meteen als betaald geteld. Logo of extra gegevens kunt u daarna
        nog aanpassen bij sponsors.
      </p>
      <button type="submit" className="btn-yellow w-fit md:col-span-2" disabled={pending}>
        {pending ? "Bezig…" : "Toevoegen"}
      </button>
      {state.error ? <p className="text-sm text-yellow md:col-span-2">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-yellow md:col-span-2">{state.ok}</p> : null}
    </form>
  );
}
