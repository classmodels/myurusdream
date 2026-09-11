"use client";

export function MailSelectAll({ checkboxName, label }: { checkboxName: string; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm normal-case tracking-normal">
      <input
        type="checkbox"
        className="w-auto"
        defaultChecked
        onChange={(e) => {
          const form = e.currentTarget.form;
          const checked = e.currentTarget.checked;
          const fromForm = form
            ? Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${checkboxName}"]`))
            : [];
          const linked = form?.id
            ? Array.from(
                document.querySelectorAll<HTMLInputElement>(
                  `input[form="${form.id}"][name="${checkboxName}"]`,
                ),
              )
            : [];
          for (const input of [...fromForm, ...linked]) input.checked = checked;
        }}
      />
      {label}
    </label>
  );
}
