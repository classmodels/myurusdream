"use client";

import { saveTransactionFees } from "@/app/admin/actions";

export function AdminTransactionFeesForm({
  euros,
  deductOnFrontend,
}: {
  euros: string;
  deductOnFrontend: boolean;
}) {
  return (
    <form action={saveTransactionFees} className="grid gap-3">
      <label className="grid gap-1 text-sm">
        Transactiekosten in €
        <input name="euros" defaultValue={euros} placeholder="0.00" inputMode="decimal" />
      </label>
      <label className="flex items-start gap-2 normal-case tracking-normal">
        <input
          type="checkbox"
          name="deductFeesOnFrontend"
          defaultChecked={deductOnFrontend}
          className="mt-1 w-auto"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />
        <span>
          Trek deze kosten af van het brutobedrag op de live teller. Dat geldt meteen voor alle
          betalingen, ook die in het verleden.
        </span>
      </label>
      <button className="btn-yellow w-fit">Transactiekosten opslaan</button>
    </form>
  );
}
