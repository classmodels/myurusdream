# SiteButler

Website voor [www.sitebutler.be](https://www.sitebutler.be).

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

## Live zetten bij Combell

Combell Node.js start **niet** de Myurusdream-site als je alleen het domein wijzigt. Koppel deze GitHub-repo aan de Node.js-instance.

1. **Node.js-instance** (of de bestaande Myurusdream-instance hergebruiken)
   - Beheer hosting → **Node.js**
   - Repository: `https://github.com/classmodels/sitebutler.git`
   - Node.js-versie: **20** of **22**
   - Deploy key van Combell in GitHub zetten (Settings → Deploy keys)
2. **Pipeline uitvoeren** op die instance (`build` + `serve`)
3. **Websites & SSL** → Beheer website → **Website backend wijzigen** → Node.js → kies deze instance
4. SSL aanvragen voor `sitebutler.be` en `www.sitebutler.be`

`package.json` bevat de scripts die Combell eist: `build` en `serve`.
