# Website Tafag AG

Neue Website für [www.tafag.ch](https://www.tafag.ch), aufgebaut nach dem Konzept und mit den Modulen der
SPÄNI-Website (Vorlage siehe `docs/ANLEITUNG-NEUE-WEBSITE.md`).

Auftragsgrundlage ist `AGENTS.md`. Begleitdokumente: `STACK.md` (Technik-Entscheid),
`DESIGN-TOKENS.md` (Gestaltung), `OPEN-QUESTIONS.md` (offene Punkte), `ASSETS.md`, `REDIRECTS.md`.

Statische Website mit [Astro](https://astro.build) und [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (Nachfolger von Decap CMS), gehostet bei Hostpoint.
Inhalte werden im Browser unter `/admin` gepflegt; jede Änderung ist ein Commit in diesem Repository
und löst über GitHub Actions einen neuen Build aus.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/content/seiten/de/**/index.yml` | Seiten, aufgebaut aus Bausteinen. Ordner = Adresse (`de/dienstleistungen/index.yml` → `/de/dienstleistungen/`) |
| `src/content/kontakte/` | Kontaktpersonen (Baustein «Kontaktperson» verweist darauf) |
| `src/content/termine/` | Termine (zurzeit leer; vergangene werden beim Build ausgeblendet) |
| `src/content/formulare/` | Formulare: Felder (inkl. Datei-Upload), Empfänger, Betreff, Löschfrist |
| `src/content/produkte/` + `src/data/produktgruppen.json` | Produktkatalog → `/de/produkte/…` (Filter, Suche, Detailseiten) |
| `src/content/stellen/` | Stellen → `/de/jobs/offene-stellen/<stelle>/` mit JobPosting-Daten und Bewerbungsformular |
| `src/content/news/` | News für «Aktuelles» (LinkedIn-Übergangslösung, `src/lib/news.ts`) |
| `src/data/einstellungen.json` | Firma, Adresse, Telefon, Pikettnummer, Fusszeile |
| `src/data/navigation.json` | Hauptnavigation (sieben Punkte nach AGENTS.md §5) |
| `src/data/bereiche.json` | Bereichskacheln der Startseite (mit Bild) |
| `src/i18n/` | Oberflächentexte pro Sprache (keine Texte im Markup) |
| `src/styles/tokens.css`, `src/lib/marke.ts` | Farben; eine Marke (`tafag`), Mechanismus `data-marke` bleibt erhalten |
| `src/components/Gleis.astro` | Gleis-Motiv (Schienen mit Schwellen) am unteren Rand dunkler Flächen |
| `src/data/redirects.json` | Weiterleitungen alter Adressen → `dist/.htaccess` |
| `src/content.config.ts` | Schema aller Inhalte (leere CMS-Felder werden vorab zu `undefined`) |
| `src/components/bloecke/` | Die Bausteine: Text, Bild, Galerie, Downloads, Formular, Button, Kontaktperson, Termine, Video |
| `public/admin/` | Sveltia CMS (`config.yml` = Felder im CMS, gleiches Format wie Decap CMS) |
| `public/api/` | PHP: `formular.php` (Empfang), `liste.php` (passwortgeschützte Excel-Liste) |
| `scripts/nach-build.mjs` | erzeugt `dist/.htaccess` (Weiterleitungen, 404, HTTPS, Header) |
| `cloudflare-worker/` | OAuth-Vermittler für die GitHub-Anmeldung im CMS |
| `.github/workflows/deploy.yml` | Build und Upload zu Hostpoint |

## Lokal arbeiten

```sh
npm ci
npm run dev        # http://localhost:4321
npm run check      # Typen und Inhalte prüfen
npm run build      # Ergebnis in dist/
```

Formulare lokal testen: `npm run build && php -S localhost:8000 -t dist`.
Einsendungen landen dann in `formulardaten/dist/` (ausserhalb von `dist/`, nicht im Git).

## Neuer Baustein

1. Schema in `src/content.config.ts` ergänzen (und in `baustein` aufnehmen).
2. Komponente in `src/components/bloecke/` anlegen und in `src/components/Bausteine.astro` eintragen.
3. Felder in `public/admin/config.yml` unter `bloecke → types` ergänzen.

## Deployment

`deploy.yml` läuft bei jedem Push auf `main` oder `entwicklung`, nächtlich und von Hand:
`npm ci` → `astro check` → Build → `rsync --delete` zu Hostpoint.

| Branch | Ziel | Suchmaschinen |
|---|---|---|
| `main` | `vars.LIVE_PFAD` | erlaubt |
| `entwicklung` | `vars.TEST_PFAD` | `noindex` (Meta-Tag, `robots.txt`, Header) |

Einstellungen im Repository unter *Settings → Secrets and variables → Actions*:

- **Secrets**: `HOSTPOINT_SSH_KEY` (privater SSH-Schlüssel, öffentlicher Teil im Hostpoint Control Panel hinterlegt),
  `HOSTPOINT_HOST` (z. B. `sl123.web.hostpoint.ch`), `HOSTPOINT_USER`, optional `FORMULAR_PASSWORT`.
- **Variables**: `LIVE_PFAD` (z. B. `www/tafag.ch`), `LIVE_URL` (`https://www.tafag.ch`),
  `TEST_PFAD` (z. B. `www/test.tafag.ch`), `TEST_URL`.

Fehlt ein Pfad, wird gebaut, aber nicht hochgeladen.

## Vorschau auf GitHub Pages

`.github/workflows/vorschau-pages.yml` baut bei jedem Push auf den Entwicklungs-Branch die Test-Version
(Platzhalter sichtbar, `noindex`) und veröffentlicht sie unter https://ralphkessler.github.io/TafagWebsite/.
`scripts/vorschau-relativ.mjs` macht die Links relativ, weil Pages im Unterordner `/TafagWebsite/` ausliefert.
Formulare und `/admin` funktionieren dort nicht (kein PHP). Einmalig: *Settings → Pages → Source: GitHub Actions*.

## Formulare

- Das Formular schickt an `/api/formular.php` (auch Datei-Uploads: PDF, Bilder, Word; max. 10 MB pro Datei, 20 MB gesamt, 5 Dateien pro Feld; Dateien bis 15 MB hängen an der Mail). Spamschutz: verstecktes Honeypot-Feld, Mindestzeit von 3 Sekunden,
  höchstens 5 Einsendungen pro 10 Minuten und Adresse.
- Empfänger und erlaubte Felder kommen aus dem CMS und werden beim Build in `/api/formulare.php` geschrieben
  (von aussen nicht lesbar). Nur Felder, die im CMS definiert sind, werden angenommen.
- Einsendungen werden **ausserhalb des Webroots** gespeichert: `<Webroot>/../formulardaten/<Ordnername>/<formular>.jsonl`.
- **Zammad** (optional, bei TAFAG zurzeit nicht genutzt): Mit `ziel: zammad` legt `formular.php` über die Zammad-API ein Ticket an. Dazu Variable `ZAMMAD_URL` und Secret `ZAMMAD_TOKEN` setzen. Alle Formulare stehen auf `ziel: mail`.
- Liste: `/api/liste.php` mit Passwort, Download als `.xlsx`, hochgeladene Dateien direkt abrufbar.
- Löschfrist pro Formular (`loeschfrist_tage`, z. B. Bewerbungen 180 Tage): ältere Einträge und Dateien werden automatisch gelöscht. Das Passwort steht als Hash in
  `<Webroot>/../formulardaten/config.php` (setzt der Workflow aus `FORMULAR_PASSWORT`, oder von Hand –
  die Seite zeigt eine Anleitung, solange keine Datei existiert).
- Hostpoint: PHP **8.3** für die Website im Control Panel einstellen, sonst liefert das Formular HTML statt JSON.

## Datenschutz

- Keine externen Schriften, Skripte, Tracker oder Cookies auf der öffentlichen Website.
- Videos (YouTube/Vimeo) laden erst nach Klick, YouTube über `youtube-nocookie.com`.
- Bilder werden im CMS hochgeladen (`public/uploads/`) und selbst ausgeliefert.
- Nur der Redaktionsbereich `/admin` lädt Sveltia CMS von unpkg.com.

## CMS lokal testen

`npm run dev`, dann in Chrome oder Edge `http://localhost:4321/admin/` öffnen und **«Mit lokalem Repository
arbeiten»** wählen (Projektordner auswählen). Sveltia schreibt die Änderungen direkt in die Dateien; danach
wie gewohnt committen. `decap-server` und `local_backend` braucht es nicht mehr.

## Stolpersteine

| Thema | Lösung |
|---|---|
| Leere CMS-Felder (`''`/`null`) | im Schema per `z.preprocess` in `undefined` umwandeln (siehe `content.config.ts`) |
| Commits von GitHub Actions starten keinen Build | `gh workflow run deploy.yml --ref <branch>` (so für den nächtlichen Test-Build gelöst) |
| Viele Builds kurz hintereinander | `concurrency` – «cancelled» ist normal |
| Hostpoint = FreeBSD | kein `xargs -d`, kein GNU-`sed -i`, nur einfache Befehle auf dem Server |
| CSS für Elemente aus JavaScript | `:global(...)` (Lightbox, Video-iframe) |
| Grosse Fotomengen | nicht ins Repository, extern ablegen und beim Build abgleichen |
| Test und Live trennen | CMS-`branch` in `public/admin/config.yml`: Testphase `entwicklung`, Livegang `main` |

## Livegang

Platzhalter («TODO: …», «Bild folgt») erscheinen nur im Test-Build (`PUBLIC_NOINDEX=true`); im Live-Build blendet
`src/lib/hilfen.ts` sie aus und lässt leere Abschnitte weg.

- [ ] Impressum (UID CHE-100.407.537) und Datenschutz (Stand Oktober 2026) vom Verantwortlichen freigegeben
- [x] Pikettnummer bestätigt (`src/data/einstellungen.json`)
- [ ] Alle Formulare einmal abgeschickt (Mail angekommen, Liste funktioniert)
- [ ] Weiterleitungen alter Adressen (`src/data/redirects.json`)
- [ ] Favicon, Logo, Social-Media-Links, E-Mail-Adressen geprüft
- [ ] `entwicklung` in `main` zusammenführen, CMS-`branch` auf `main`
- [ ] Cloudflare-Worker: Live-Domain in `ALLOWED_DOMAINS`; OAuth-App: Homepage-URL anpassen
- [ ] Domain bei Hostpoint auf den Live-Ordner zeigen lassen, PHP 8.3, SSL-Zertifikat aktiv
- [ ] Redaktoren ins Repository einladen und kurz in `/admin` einführen
