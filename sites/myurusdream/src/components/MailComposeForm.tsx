"use client";

import { useActionState } from "react";
import { deleteMailContact, sendMailCampaign, type SendMailState } from "@/app/admin/actions";
import { MailSelectAll } from "@/components/MailSelectAll";

type ListOption = { id: string; name: string; count: number };
type ContactOption = { id: string; email: string; label: string };

export function MailComposeForm({
  lists,
  contacts,
  listId,
  showAccounts,
}: {
  lists?: ListOption[];
  contacts?: ContactOption[];
  listId?: string;
  showAccounts?: boolean;
}) {
  const [state, action, pending] = useActionState<SendMailState, FormData>(sendMailCampaign, {});

  return (
    <form action={action} className="grid gap-3">
      {listId ? <input type="hidden" name="listId" value={listId} /> : null}

      <div className="space-y-2 border border-white/10 p-3">
        {lists?.length ? (
          <>
            <MailSelectAll checkboxName="listIds" label="Alles selecteren" />
            {showAccounts ? (
              <label className="flex items-center gap-2 text-sm normal-case tracking-normal">
                <input type="checkbox" name="accounts" className="w-auto" />
                Alle accounts op de site
              </label>
            ) : null}
            {lists.map((l) => (
              <label key={l.id} className="flex items-center gap-2 text-sm normal-case tracking-normal">
                <input type="checkbox" name="listIds" value={l.id} defaultChecked className="w-auto" />
                {l.name} ({l.count})
              </label>
            ))}
          </>
        ) : null}

        {contacts?.length ? (
          <>
            <MailSelectAll checkboxName="contactIds" label="Alles selecteren" />
            <ul className="max-h-[22rem] space-y-1 overflow-auto text-sm">
              {contacts.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 py-2">
                  <label className="flex min-w-0 flex-1 items-center gap-2 normal-case tracking-normal">
                    <input type="checkbox" name="contactIds" value={c.id} defaultChecked className="w-auto" />
                    <span className="truncate">{c.label}</span>
                  </label>
                  {listId ? (
                    <button
                      type="submit"
                      formNoValidate
                      formAction={deleteMailContact}
                      name="contactId"
                      value={c.id}
                      className="btn-danger"
                    >
                      Weg
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {!lists?.length && !contacts?.length ? (
          <p className="text-sm text-muted">Nog geen lijsten of adressen om te selecteren.</p>
        ) : null}
      </div>

      <input name="subject" placeholder="Onderwerp" required />
      <textarea
        name="body"
        rows={8}
        placeholder="Typ hier de tekst. Placeholders: {{voornaam}} {{bedrijf}} {{email}}"
        required
      />
      {state.error ? <p className="text-sm text-yellow">{state.error}</p> : null}
      <button className="btn-yellow w-fit" disabled={pending}>
        {pending ? "Bezig met versturen…" : contacts?.length ? "Mail naar selectie versturen" : "Versturen"}
      </button>
    </form>
  );
}
