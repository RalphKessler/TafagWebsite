# Anleitung: Neue Website nach dem SPÄNI-Konzept

Diese Anleitung beschreibt, wie eine neue Kundenwebsite mit **demselben Konzept und denselben Modulen**
wie die Website der SPÄNI Elektro-Mechanik AG entsteht. Statt alles neu zu bauen, wird das SPÄNI-Projekt
als **Vorlage** kopiert, von Kundeninhalten befreit und für den neuen Kunden angepasst.

---

## 1. Das Konzept in Kürze

| Baustein | Lösung |
|---|---|
| Website | **Astro**, statisch erzeugt – keine Datenbank, kein Server-CMS, schnell und sicher |
| Inhalte | YAML/JSON-Dateien im **Git-Repository** – jede Änderung nachvollziehbar und rückgängig zu machen |
| Redaktion | **Sveltia CMS** unter `/admin` (Nachfolger von Decap CMS), Anmeldung mit GitHub über einen Cloudflare Worker |
| Seitenaufbau | Seiten bestehen aus **Bausteinen** (Text, Bild+Text, Leistungen, Ablauf, Formular …), im CMS frei kombinierbar |
| Marken | **Bereichsmarken** über `data-marke` auf `<body>`: Akzentfarbe, Logo im Seitenkopf, Markenbalken wechseln pro Bereich |
| Formulare | **PHP** auf dem Webhosting: Upload, Spamschutz, Speicherung ausserhalb des Webroots, Mail, optional Zammad-Ticket, Liste mit Excel-Export |
| Veröffentlichung | **GitHub Actions** baut und lädt per SSH/rsync zu **Hostpoint**: `entwicklung` → Test (noindex), `main` → Live |
| Platzhalter | Fehlende Angaben als `TODO: …` – sichtbar nur auf der Test-Website, live automatisch ausgeblendet |
| Mehrsprachigkeit | vorbereitet: URLs mit Sprachpräfix (`/de/…`), Oberflächentexte in `src/i18n/de.json`, `hreflang` |

---

## 2. Ablauf auf einen Blick

1. Vorlage kopieren, neues Repository anlegen (Abschnitt 3)
2. SPÄNI-Inhalte entfernen (Abschnitt 4)
3. Kunde, Design und Marken anpassen (Abschnitt 5)
4. Nicht benötigte Module weglassen (Abschnitt 7)
5. CMS und Anmeldung einrichten (Abschnitt 8)
6. Hostpoint und GitHub Actions einrichten (Abschnitt 9)
7. Inhalte erfassen, prüfen, live schalten (Abschnitte 10 und 11)

---

## 3. Vorlage kopieren

```sh
# Stand der SPÄNI-Website holen (Branch anpassen, sobald «main» existiert)
git clone --depth 1 -b claude/clever-curie-5z4n4p https://github.com/SPAENI-AG/Website.git kunde-website
cd kunde-website

# SPÄNI-Verlauf entfernen und neu beginnen
rm -rf .git
git init -b main
npm ci
npm run build          # muss fehlerfrei durchlaufen, bevor du etwas änderst
```

Neues, **privates** Repository beim Kunden bzw. in deiner Organisation anlegen, dann:

```sh
git remote add origin https://github.com/KUNDE-ORG/Website.git
git add -A && git commit -m "Vorlage aus SPÄNI-Projekt übernommen"
git push -u origin main
git switch -c entwicklung && git push -u origin entwicklung
```

Voraussetzungen lokal: Node.js 22 (`.nvmrc`), Git, Python 3 mit `openpyxl` und `pyyaml` (nur für den Excel-Austausch).

---

## 4. SPÄNI-Inhalte entfernen

Pro Sammlung **eine Beispieldatei behalten** und anpassen – sie dient als Muster und hält den Build lauffähig.

| Ordner / Datei | Vorgehen |
|---|---|
| `src/content/seiten/de/` | Startseite (`index.yml`), Impressum, Datenschutz behalten und neu schreiben; alle übrigen Seiten löschen und nach der neuen Struktur anlegen |
| `src/content/produkte/` | ein Produkt als Muster behalten oder Modul weglassen (Abschnitt 7) |
| `src/content/stellen/`, `kontakte/`, `termine/`, `news/` | je eine Beispieldatei behalten oder leeren |
| `src/content/formulare/` | `kontakt.yml` behalten, Empfänger anpassen; weitere Formulare nach Bedarf |
| `public/uploads/` | komplett leeren (Logos, Team, Produktbilder, Downloads gehören SPÄNI) |
| `public/favicon.png`, `apple-touch-icon.png` | aus dem Kundenlogo neu erstellen |
| `AGENTS.md`, `ASSETS.md`, `OPEN-QUESTIONS.md`, `AUFGABEN.md`, `REDIRECTS.md`, `docs/QUELLEN.md` | leeren und für den neuen Kunden neu beginnen |
| `src/data/redirects.json` | auf `{ "weiterleitungen": [] }` zurücksetzen |

Danach `npm run build` – Fehler zeigen dir, wo noch Verweise auf gelöschte Inhalte stehen
(z. B. Kontaktpersonen in Bausteinen, Produktgruppen in der Navigation).

---

## 5. Kunde, Design und Marken anpassen

### 5.1 Stammdaten und Struktur

| Datei | Inhalt |
|---|---|
| `astro.config.mjs` | `site` = Live-Adresse des Kunden |
| `package.json` | `name` |
| `src/data/einstellungen.json` | Firma, Adresse, Kanton, Telefon, E-Mail, Logo-Pfad, LinkedIn, Fusszeilen-Links |
| `src/data/navigation.json` | Hauptmenü und Untermenüs (Reihenfolge = Anzeige) |
| `src/data/bereiche.json` | Bereichskacheln der Startseite (Titel, Marke, Text, Links) |
| `src/data/produktgruppen.json` | Produktgruppen (Slug, Titel, Marke, Einleitung) |
| `src/i18n/de.json` | alle festen Oberflächentexte (Knöpfe, Überschriften der Startseite, Formularhinweise) |
| `src/content/seiten/de/index.yml` | Titel und Einleitung der Startseite (Hero) |

### 5.2 Design

| Datei | Inhalt |
|---|---|
| `src/styles/tokens.css` | Farben, Schrift, Radien, Abstände – **zuerst hier** die Kundenfarben setzen |
| `src/styles/global.css` | Grundstil, Knöpfe, Raster |
| `src/components/Welle.astro` | Wellen-Motiv aus dem SPÄNI-Logo → durch ein eigenes Motiv ersetzen oder entfernen |
| `src/components/Kopf.astro` | Logo-Grösse (`.logo img { height }`) und Umbruchpunkt des Menüs (`@media (max-width: 1520px)`) an Logo und Anzahl Menüpunkte anpassen |
| `src/components/start/Hero.astro` | Bild und Knöpfe der Startseite |
| Schrift | `@fontsource-variable/manrope` in `package.json` durch die Kundenschrift ersetzen (selbst ausgeliefert, kein Google-Fonts-Aufruf) |

Vorher den Designplan in `DESIGN-TOKENS.md` festhalten (Farbwerte, Schriften, Layoutprinzipien, Kontraste nach WCAG AA).

### 5.3 Bereichsmarken

Die Vorlage kennt drei Marken mit den internen Schlüsseln `spaeni`, `verpama`, `d2c`.

- **Schnell:** Schlüssel behalten, nur Farben (`tokens.css`), Logos (`src/lib/marke.ts` → `markenLogo`),
  Zusatztext (`src/i18n/de.json` → `verpamaZusatz`) und Beschriftungen im CMS ändern.
- **Sauber (empfohlen):** Schlüssel umbenennen, z. B. `haupt`, `marke2`, `marke3`, und in allen Fundstellen ersetzen:
  ```sh
  grep -rn "spaeni\|verpama\|d2c" src public/admin --include=*.ts --include=*.astro --include=*.css --include=*.json --include=*.yml
  ```
  Betroffen sind u. a. `src/lib/marke.ts` (Pfad → Marke), `src/content.config.ts` (Auswahllisten),
  `src/styles/tokens.css`, `src/components/Seitenkopf.astro`, `Querverweise.astro`, `Katalog.astro`,
  `public/admin/config.yml` (Auswahl «Marke»).
- **Nur eine Marke:** `markeAusPfad()` immer `'haupt'` liefern lassen; die Markenfelder im CMS ausblenden.

---

## 6. Modulkatalog

### 6.1 Bausteine (Seitenbaukasten)

Alle Bausteine: Schema in `src/content.config.ts`, Darstellung in `src/components/bloecke/`,
Verteiler in `src/components/Bausteine.astro`, Felder im CMS in `public/admin/config.yml` (`bloecke → types`).
Viele Bausteine haben ein Feld **Hintergrund** (weiss / hellgrau / dunkelblau) für den Rhythmus der Seite.

| Baustein | Zweck | Wichtige Felder |
|---|---|---|
| `text` | Fliesstext mit Markdown, auch Tabellen | titel, inhalt |
| `bildtext` | Bild und Text nebeneinander | bild, alt, umgekehrt (Bild links) |
| `bild` | Einzelbild | bild, alt, legende, breite (normal/breit/voll) |
| `galerie` | Bildergalerie | bilder |
| `leistungen` | Liste von Leistungen/Merkmalen, optional verlinkt; aufklappbarer Technikblock | eintraege, technik_titel, technik_inhalt |
| `ablauf` | **nummerierte** Schritte (nur für echte Reihenfolgen) | schritte |
| `querverweise` | Karten zu anderen Bereichen, je mit Marke | eintraege (titel, text, link, marke) |
| `aufruf` | Handlungsaufruf mit bis zu zwei Knöpfen | titel, text, beschriftung/link, beschriftung2/link2 |
| `button` | einzelner Knopf | beschriftung, link, stil |
| `downloads` | Dateiliste (PDF, ZIP …) | dateien (datei, bezeichnung) |
| `formular` | Formular aus der Sammlung «Formulare» | formular, anker |
| `kontaktperson` | ausgewählte Personen mit Foto und Kontakt | personen |
| `team` | alle Personen, Gruppen oben (z. B. Geschäftsleitung), Rest gemeinsam | oben, titel_rest |
| `zeitstrahl` | Historie | eintraege (jahr, titel, text) |
| `stellen` | offene Stellen bzw. nur Lehrstellen | nur_lehrstellen |
| `termine` | kommende Termine einer Kategorie | kategorie, anzahl |
| `video` | YouTube/Vimeo, lädt erst nach Klick (`youtube-nocookie.com`) | url, vorschaubild |
| `standorte` | Standorte nebeneinander mit Adresse, Anreise, Routenlink | eintraege |
| `logos` | Partner mit Logo oder Wortmarke; Auswahl für die Startseite | eintraege (name, logo, link, startseite) |

**Neuer Baustein:** immer an den vier Stellen oben eintragen. Der `type` im CMS muss exakt dem Schema entsprechen.

### 6.2 Sammlungen (im CMS)

| Sammlung | Ablage | Verwendung |
|---|---|---|
| Seiten | `src/content/seiten/de/**/index.yml` | verschachtelt; der Ordner ergibt die Adresse |
| Kontaktpersonen | `src/content/kontakte/` | Team, Kontaktbausteine, Ansprechperson der Stellen |
| Produkte | `src/content/produkte/` | Katalog mit Gruppen, Filter, Suche, Detailseiten; Marke pro Produkt |
| Stellen | `src/content/stellen/` | Stellenliste, Detailseite mit Bewerbungsformular, `JobPosting`, archivierbar |
| Formulare | `src/content/formulare/` | Felder, Empfänger, Betreff, Löschfrist, Ziel (Mail oder Zammad) |
| News | `src/content/news/` | Startseite «Aktuelles» (Übergangslösung für LinkedIn) |
| Termine | `src/content/termine/` | Termin-Baustein |
| Einstellungen | `src/data/*.json` | Firma, Navigation, Bereiche, Produktgruppen, Weiterleitungen |

### 6.3 Startseite (`src/components/start/`)

Hero → **Bereiche** (gleichwertige Einstiege) → **Aktuelles** (News; ohne Beiträge live ausgeblendet)
→ **Partner** (aus dem Logo-Baustein der Partnerseite) → **Kontakt** (Standort, Ansprechperson, Serviceanfrage).

### 6.4 Produktkatalog

- Routen: `/de/produkte/`, `/de/produkte/<gruppe>/`, `/de/produkte/<gruppe>/<produkt>/`
- Filter nach Kategorie und Suche im Browser, ohne Server (`src/components/produkte/Katalog.astro`)
- Detailseite: Beschreibung, Modelle, technische Daten, Downloads, Anfrage-Knopf, Verweis auf Service/Ersatzteile
- Status «abgekündigt» mit Hinweis; kein Webshop, keine Preise
- **Excel-Austausch** für grosse Änderungen: `python3 scripts/produkte_excel.py export produkte.xlsx` bzw. `import`
  (nur geänderte Produkte werden neu geschrieben)

### 6.5 Jobs

- Stellenliste und Detailseiten mit eigener, teilbarer Adresse; `JobPosting` (strukturierte Daten) nur für offene Stellen
- Bewerbung mit Upload (CV, Zeugnisse), Spontanbewerbung, Löschfrist z. B. 180 Tage
- Archivierte Stellen bleiben erreichbar («nicht mehr ausgeschrieben»), erscheinen aber nicht in der Sitemap

### 6.6 Formulare (PHP, `public/api/`)

| Datei | Aufgabe |
|---|---|
| `formular.php` | Annahme: Honeypot, mind. 3 Sekunden Ausfüllzeit, max. 5 Einsendungen/10 Min. pro Adresse; Uploads pdf/jpg/png/webp/heic/doc/docx, max. 10 MB pro Datei, 20 MB gesamt, 5 Dateien pro Feld; Speicherung als JSONL in `<Webroot>/../formulardaten/`; Mail mit Anhängen bis 15 MB; optional Zammad-Ticket (fällt bei Ausfall auf Mail zurück); Löschfrist |
| `liste.php` | passwortgeschützte Übersicht aller Einsendungen, Dateien herunterladen, **Excel-Export** |
| `_gemeinsam.php` | gemeinsame Funktionen, Pfade |
| `src/pages/api/formulare.php.ts` | erzeugt beim Build die Formular-Konfiguration als PHP (Empfänger nicht im HTML sichtbar) |

Zammad nicht benötigt? Formulare mit `ziel: mail` erfassen und das Secret `ZAMMAD_TOKEN` weglassen.

### 6.7 Querschnitt

- **TODO-Regel:** `src/lib/hilfen.ts` (`zeigeTodo`, `bereinigeBausteine`) – Test zeigt Platzhalter, Live blendet sie aus
- **SEO:** Titel/Beschreibung/Open Graph pro Seite (`src/layouts/Basis.astro`), `sitemap.xml`, `robots.txt`, `hreflang`
- **Weiterleitungen:** `src/data/redirects.json` → `scripts/nach-build.mjs` erzeugt `.htaccess` (HTTPS, 301 alter Adressen, Caching)
- **Datenschutz:** keine Cookies, keine Tracker, keine Drittinhalte ohne Klick → kein Cookie-Banner nötig

---

## 7. Module weglassen

| Modul | Entfernen |
|---|---|
| Produkte | `src/pages/[lang]/produkte/`, `src/components/produkte/`, `src/lib/produkte.ts`, Sammlung `produkte` in `content.config.ts` und `admin/config.yml`, `produktgruppen.json`, Menüpunkt, `scripts/produkte_excel.py` |
| Jobs | `src/pages/[lang]/jobs/`, `src/lib/stellen.ts`, Baustein `stellen`, Sammlung `stellen`, Formulare `bewerbung`/`spontanbewerbung`, Stellen-Teaser in `Fuss.astro` |
| News | Sammlung `news`, `src/lib/news.ts`, `<News>` in `Startseite.astro` |
| Termine | Sammlung `termine`, Baustein `termine` |
| Marken | siehe 5.3 «Nur eine Marke» |
| Zammad | Formulare auf `ziel: mail`, Secret weglassen |

Nach jedem Entfernen: `npx astro check` und `npm run build`.

---

## 8. CMS (Sveltia) und Anmeldung

1. In `public/admin/config.yml` anpassen: `backend.repo`, `backend.branch` (Testphase `entwicklung`), `site_url`,
   `logo.src`, Auswahllisten (Marken, Produktgruppen) und Sammlungen, die weggelassen wurden.
2. `public/admin/index.html`: Sveltia-Version fest angeben (`@sveltia/cms@<version>`), Titel anpassen.
3. **Anmelde-Worker** (`cloudflare-worker/`):
   - GitHub-OAuth-App anlegen, Callback `https://<worker>.workers.dev/callback`
   - `wrangler.toml`: Name und `ALLOWED_DOMAINS` (Test- und Live-Domain)
   - `npx wrangler deploy`, dann `GITHUB_CLIENT_ID` und `GITHUB_CLIENT_SECRET` als Secret setzen
   - Worker-Adresse in `config.yml` bei `base_url` eintragen
4. Redaktoren ins Repository einladen (Schreibrecht).
5. Lokal testen: `npm run dev`, in Chrome/Edge `http://localhost:4321/admin/` → «Mit lokalem Repository arbeiten».
6. `docs/ANLEITUNG-REDAKTION.md` für den Kunden anpassen.

---

## 9. Hostpoint und GitHub Actions

Workflow `.github/workflows/deploy.yml` übernehmen. Im neuen Repository unter
**Settings → Secrets and variables → Actions** setzen:

| Typ | Name | Inhalt |
|---|---|---|
| Secret | `HOSTPOINT_SSH_KEY` | privater SSH-Schlüssel (öffentlicher Teil bei Hostpoint hinterlegt) |
| Secret | `HOSTPOINT_HOST`, `HOSTPOINT_USER` | SSH-Zugang |
| Secret | `FORMULAR_PASSWORT` | Passwort für `/api/liste.php` |
| Secret | `ZAMMAD_TOKEN` | optional |
| Variable | `LIVE_PFAD`, `LIVE_URL` | Zielordner und Adresse der Live-Website |
| Variable | `TEST_PFAD`, `TEST_URL` | Zielordner und Adresse der Test-Website |
| Variable | `ZAMMAD_URL`, `ZAMMAD_GRUPPE` | optional; im Workflow die SPÄNI-Vorgabe `support.elektro-spaeni.ch` ersetzen |

Bei Hostpoint: zwei Ordner (Test, Live), Domains darauf zeigen lassen, PHP 8.3, SSL aktiv.
Ablauf: Push auf `entwicklung` → Test-Website; Zusammenführen nach `main` → Live-Website. Nächtlicher Neu-Build ist eingerichtet.

---

## 10. Arbeiten mit Claude Code

`AGENTS.md` ist die verbindliche Auftragsgrundlage. Gliederung wie bei SPÄNI:

```markdown
# Build-Anweisung: Website <Kunde>
## 0. Grundregeln        – keine erfundenen Fakten, Lücken als TODO:, Schweizer Rechtschreibung, offene Fragen in OPEN-QUESTIONS.md
## 1. Was das Unternehmen macht – Bereiche, Zielgruppen
## 2. Markenarchitektur  – Dachmarke, Untermarken, Farben
## 3. Designrichtung     – was passt, was vermeiden; Designplan in DESIGN-TOKENS.md
## 4. Technik            – «Vorlage: SPÄNI-Projekt, gleiche Module» + harte Vorgaben (360 px, WCAG AA, revDSG, Redirects)
## 5. Seitenstruktur     – Hauptmenü in verbindlicher Reihenfolge, Unterseiten
## 6. Inhalte pro Bereich
## 7–9. Sonderfunktionen, Mehrsprachigkeit, Datenquellen und Bildrechte (ASSETS.md)
## 10. Reihenfolge       – nach Grundlayout und nach den Bereichsseiten anhalten und Vorschau zeigen
## 11. Abnahme-Checkliste
```

---

## 11. Prüfen vor dem Livegang

```sh
npx astro check                               # 0 Fehler
npm run build                                 # Live-Build: keine TODO-Texte sichtbar
PUBLIC_NOINDEX=true npm run build             # Test-Build: Platzhalter sichtbar, noindex gesetzt
grep -rl "TODO" dist --include=*.html         # Live-Build: muss leer sein
```

- [ ] Alle internen Links und Bilder erreichbar (Link-Prüfung über `dist/`)
- [ ] Alle Seiten bei 360 px ohne seitliches Scrollen, Tastaturbedienung, sichtbarer Fokus
- [ ] Impressum (UID, Handelsregister, vertretungsberechtigte Person) und Datenschutz vom Kunden freigegeben
- [ ] Jedes Formular einmal abgeschickt: Mail angekommen, Eintrag in `liste.php`, ggf. Ticket in Zammad
- [ ] Weiterleitungen der alten Website in `redirects.json` (Liste in `REDIRECTS.md`)
- [ ] `ALLOWED_DOMAINS` des Workers enthält die Live-Domain; CMS-`branch` auf `main`
- [ ] Bildrechte in `ASSETS.md` dokumentiert, offene Punkte in `OPEN-QUESTIONS.md`

---

## 12. Stolpersteine (aus dem SPÄNI-Projekt)

| Problem | Lösung |
|---|---|
| Leeres CMS-Feld bricht den Build | `z.preprocess(leer, …)` im Schema (bereits in der Vorlage) |
| Commits von GitHub Actions starten keinen Build | `gh workflow run deploy.yml --ref <branch>` |
| Scoped CSS greift nicht bei Kindern / JS-Elementen | `:global(...)` |
| HTML-Template-Strings im Astro-Frontmatter | in `src/lib/` auslagern |
| Hostpoint = FreeBSD | nur einfache POSIX-Befehle auf dem Server |
| PHP-Konfiguration mit `$`-Werten | mit `var_export` erzeugen |
| Menü zu breit nach Logowechsel | Umbruchpunkt in `Kopf.astro` erhöhen, bei 1280–1600 px testen |
| Lange Tabellen/Listen auf dem Handy | `minmax(0, 1fr)`, `overflow-wrap: anywhere` |
| Gelöschte Vorlage-Inhalte noch verlinkt | Build-Fehler bzw. Link-Prüfung zeigen sie; Navigation und Bereichskacheln prüfen |
| SPÄNI-Reste übersehen | vor dem Livegang `grep -rni "späni\|spaeni\|verpama\|elektro-spaeni" src public scripts .github` |
