# Cloudflare-Worker für die CMS-Anmeldung

Das CMS (Sveltia CMS, früher Decap CMS – beide nutzen dasselbe Verfahren) meldet Redaktoren über GitHub an. Weil die Website statisch ist (Hostpoint),
übernimmt dieser kleine Worker den OAuth-Austausch.

## Einrichten

1. **GitHub-OAuth-App** anlegen: GitHub → Settings → Developer settings → OAuth Apps → *New OAuth App*
   (am besten im Konto bzw. in der Organisation, der das Repository gehört).
   - Homepage URL: `https://test.tafag.ch` (beim Livegang auf die Live-Domain ändern)
   - Authorization callback URL: `https://decap-oauth.<konto>.workers.dev/callback`
2. **Worker** bereitstellen (im Ordner `cloudflare-worker/`):
   ```sh
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```
   Alternativ im Cloudflare-Dashboard einen Worker anlegen und `worker.js` hineinkopieren.
3. `ALLOWED_DOMAINS` enthält alle Domains, auf denen `/admin` benutzt wird (kommagetrennt, ohne `https://`).
   **Beim Livegang die Live-Domain ergänzen.**
4. In `public/admin/config.yml` bei `base_url` die Worker-Adresse eintragen.
