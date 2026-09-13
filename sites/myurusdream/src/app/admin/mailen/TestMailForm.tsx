"use client";

import { useActionState } from "react";
import { sendTestMail, type TestMailState } from "../actions";

export function TestMailForm() {
  const [state, action, pending] = useActionState<TestMailState, FormData>(sendTestMail, {});

  return (
    <form action={action} className="grid gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1">
          Testmail naar
          <input name="to" type="email" required placeholder="uw@adres.be" className="max-w-xs" />
        </label>
        <button className="btn-ghost" disabled={pending}>
          {pending ? "Bezig…" : "Testmail sturen"}
        </button>
      </div>
      {state.error ? <p className="text-sm text-yellow">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-yellow">{state.ok}</p> : null}
    </form>
  );
}
