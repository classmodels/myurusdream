"use client";

import { useActionState } from "react";
import { importMailList, type ImportMailState } from "@/app/admin/actions";

export function MailCsvImportForm({
  lists,
  defaultListId,
}: {
  lists: { id: string; name: string; count: number }[];
  defaultListId?: string;
}) {
  const [state, action, pending] = useActionState<ImportMailState, FormData>(importMailList, {});

  return (
    <form action={action} className="grid gap-3">
      <label className="grid gap-1 text-sm">
        Lijst
        <select name="listId" defaultValue={defaultListId || ""}>
          <option value="">Nieuwe lijst</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.count})
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Naam als u een nieuwe lijst maakt
        <input name="newName" placeholder="Bv. Bedrijven West-Vlaanderen" />
      </label>
      <label className="grid gap-1 text-sm">
        CSV-bestand
        <input
          name="file"
          type="file"
          accept=".csv,text/csv,.txt"
          required
          className="file:mr-3 file:border file:border-yellow/50 file:bg-transparent file:px-3 file:py-1 file:text-xs file:uppercase file:tracking-widest file:text-yellow"
        />
      </label>
      <p className="text-xs text-muted">
        Kolommen zoals email, voornaam, naam, bedrijf — komma of puntkomma. De hele lijst wordt
        geïmporteerd; bestaande adressen worden overgeslagen.
      </p>
      {state.error ? <p className="text-sm text-yellow">{state.error}</p> : null}
      <button className="btn-yellow w-fit" disabled={pending}>
        {pending ? "Bezig met importeren…" : "CSV importeren"}
      </button>
    </form>
  );
}
