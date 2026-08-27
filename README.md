# DroomOp2

Persoonlijke, transparante campagne: **kunnen 200.000 mensen met €2 samen één autodroom mogelijk maken?**

- Site: **DroomOp2** (droomop2.be)
- Tagline: *Kan €2 een droom op wielen waarmaken?*
- Lokaal: **http://127.0.0.1:3001** (poort 3001, zodat ModelPort op 3000 kan blijven)

Dit is **geen goed doel**, geen investering en geen winstbelofte. Open persoonlijke campagne.

Deze onafhankelijke campagne is **niet verbonden aan, georganiseerd door of gesponsord door Automobili Lamborghini S.p.A.** Er wordt geen officieel Lamborghini-logo als huisstijl gebruikt.

## Starten (lokaal, SQLite, geen Docker)

```bash
cd /Users/vangyzelalain/Desktop/droomop2
cp .env.example .env   # of gebruik het bestaande .env
npm install
npx prisma generate
npm run db:setup       # prisma db push + seed (0 betalingen)
npm run dev            # http://127.0.0.1:3001
```

### Admin (lokaal)

- URL: http://127.0.0.1:3001/admin
- E-mail: `admin@droomop2.local`
- Wachtwoord: `admin123`

Wijzig dit in productie via `ADMIN_EMAIL` / `ADMIN_PASSWORD` en daarna opnieuw seeden of het wachtwoord in de database updaten.

**Eerste echte testbetaling:** in admin eerst scenario A/B/C instellen (“wat als het doel niet wordt bereikt”). Zonder die keuze is betalen geblokkeerd.

## Productie: PostgreSQL

Lokaal gebruikt Prisma **SQLite** (`DATABASE_URL="file:./dev.db"`).

Voor productie: zelfde schema, andere URL, bijvoorbeeld:

```
DATABASE_URL="postgresql://user:pass@host:5432/droomop2"
```

Geldbedragen staan overal in **integer cents**. Geen floats.

Daarna:

```
npx prisma migrate deploy
npm run build
npm start   # of een host zoals Vercel / Node
```

## Environment

| Variabele | Doel |
| --- | --- |
| `DATABASE_URL` | SQLite lokaal, PostgreSQL in productie |
| `SESSION_SECRET` | HMAC/sessies |
| `NEXT_PUBLIC_SITE_URL` | o.a. `http://127.0.0.1:3001` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seed van de admin |
| `DISABLED_PENDING_LEGAL_APPROVAL` | default `true` — publieke referrals/punten UIT |
| `PRIZE_FEATURE_ENABLED` | default `false` — winactie publiek UIT |
| `MULTI_LEVEL_REFERRALS` | default `false` |
| `MOLLIE_API_KEY` | **alleen** `test_...` in deze versie |
| `MOLLIE_WEBHOOK_URL` | publieke webhook-URL (ngrok) als je Mollie test |

Zonder Mollie-sleutel blijft de checkout werken in **testmodus** (melding + lokale simulatieknop). Geen kaartgegevens op deze server.

## Juridische vlaggen

- Publieke referral/punten: **uit** tot `DISABLED_PENDING_LEGAL_APPROVAL=false` **én** checklist “referral juridisch goedgekeurd” **én** admin-toggle.
- Winactie: **uit** tot `PRIZE_FEATURE_ENABLED=true` **én** checklist **én** admin-toggle.
- Multi-level: **uit**.
- LIVE-schakelaar in admin: alleen als de volledige publicatiecheck is afgevinkt.
- Teller: alleen echte `paid` betalingen. Seed bevat **€0**, geen demo-bedrag van €127.842.

Juridische pagina’s dragen **[JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]**.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Prisma · Mollie hosted checkout
