import { LegalPage } from "@/components/LegalPage";
import { LAMBORGHINI_DISCLAIMER, NOT_CHARITY_LINES } from "@/lib/constants";

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      {NOT_CHARITY_LINES.map((l) => (
        <p key={l}>{l}</p>
      ))}
      <p>{LAMBORGHINI_DISCLAIMER}</p>
      <p>
        Foto’s van een Urus dienen als sfeerbeeld van de droom. Zij impliceren geen
        partnership, sponsoring of goedkeuring door de autofabrikant. Er wordt geen officieel
        merkenlogo van de fabrikant als huisstijl gebruikt.
      </p>
      <p>
        De campagne belooft geen winst, geen eigendomsaandeel en geen gegarandeerde aankoop
        of levering van een voertuig.
      </p>
    </LegalPage>
  );
}
