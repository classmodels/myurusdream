import { LegalPage } from "@/components/LegalPage";

export default function CookiesPage() {
  return (
    <LegalPage title="Cookiebeleid">
      <p>
        myurusdream.be gebruikt in deze versie alleen essentiële cookies: een httpOnly sessiecookie
        na login of betaling, en een lokale voorkeur voor de cookiemelding.
      </p>
      <p>
        Er worden geen marketing- of trackingcookies geplaatst. Als dat later verandert, vragen
        we vooraf toestemming.
      </p>
      <p>
        U kunt cookies wissen via uw browser. Zonder de sessiecookie kunt u uw dashboard niet
        openen tot u opnieuw inlogt via de toegangslink.
      </p>
    </LegalPage>
  );
}
