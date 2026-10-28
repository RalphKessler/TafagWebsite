# Build-Anweisung: Website Tafag AG

## 0. Grundregeln

- Keine erfundenen Fakten. Fehlende Angaben als `TODO: …` erfassen – sie erscheinen nur auf der Test-Website.
- Schweizer Rechtschreibung (ss statt ß), Anführungszeichen « ».
- Offene Fragen in `OPEN-QUESTIONS.md`, Bildquellen und -rechte in `ASSETS.md`, Textquellen in `docs/QUELLEN.md`.

## 1. Was das Unternehmen macht

Tafag AG, Chräbelstrasse 3, 6410 Goldau SZ – seit 1968 Schienen- und Spezialfahrzeuge, seit 1978 in Goldau.
Unabhängiges Produktionsunternehmen: Fahrzeuge für Schiene und Strasse, Maschinenbau und Elektromechanik.
Generalvertretung der ZAGRO Group.

- **Produkte:** eVTms Schienenfahrzeug, Hebebühne / Kran (3TL, PKR290), Module (Trommelböcke, TuBeMo, WM30,
  Container-Module), Rangiergeräte (ZAGRO E-MAXI M/L/XL), Zweiweg (Unimog, LKW, TERBERG-ZAGRO RR 282),
  Notstromversorgung (Inhalte folgen), Sonderlösungen (Montagehilfen, Partikelfilter).
- **Dienstleistungen:** Engineering, Revisionen & Umbau, Service & Inbetriebnahme, Pikettdienst 24 h.
- **Zielgruppen:** Bahnen, Fahrleitungsbau, Bauunternehmen, Tunnelbau.

## 2. Markenarchitektur

Eine Marke: TAFAG. Partnermarken (ZAGRO, ZWEIWEG) nur als Text, Logos erst mit Freigabe.

## 3. Designrichtung

Logoblau `#3055a5`, Fahrzeuggelb, Nachtblau für dunkle Flächen, Gleis-Motiv. Fotos der eigenen Fahrzeuge
tragen die Seite. Details in `DESIGN-TOKENS.md`.

## 4. Technik

Vorlage: SPÄNI-Projekt, gleiche Module (`docs/ANLEITUNG-NEUE-WEBSITE.md`). Harte Vorgaben: 360 px ohne
seitliches Scrollen, WCAG AA, revDSG (keine Cookies/Tracker), Weiterleitungen alter Adressen (`REDIRECTS.md`).
Zammad (support.tafag.ch) für die Serviceanfrage, übrige Formulare per Mail. Nicht genutzt: News und Termine (Sammlungen leer, Bereiche blenden sich aus).

## 5. Seitenstruktur (Hauptmenü, verbindliche Reihenfolge)

1. Startseite
2. Produkte – eVTms Schienenfahrzeug, Hebebühne / Kran, Module, Rangiergeräte, Zweiweg, Notstromversorgung, Sonderlösungen (Reihenfolge vom Kunden, 28.10.2026)
3. Dienstleistungen – Engineering, Revisionen & Umbau, Service & Inbetriebnahme, Pikettdienst, Serviceanfrage
4. Referenzen – Installationszug Gotthard-Basistunnel, Kunden
5. Über uns – Leitbild, Firmengeschichte, Partner, Standort & Anfahrt
6. Jobs – Offene Stellen, Arbeiten bei TAFAG, Spontanbewerbung
7. Kontakt

## 6. Inhalte

Quellen: Website 2021 (Web-Archiv) und aktuelle Odoo-Website (Stand Oktober 2026), siehe `docs/QUELLEN.md`.
Bei Widerspruch gilt die aktuelle Website (z. B. Telefon +41 41 859 08 20 statt 855 25 02).

## 7–9. Sonderfunktionen, Mehrsprachigkeit, Bildrechte

- Pikettnummer im Servicebalken (Feld `pikett` in `einstellungen.json`).
- Mehrsprachigkeit vorbereitet (`/de/…`), zurzeit nur Deutsch.
- Bilder stammen von www.tafag.ch (Kunde); Rechte in `ASSETS.md` bestätigen lassen.

## 10. Reihenfolge

Grundlayout ✔ → Bereichsseiten ✔ → Vorschau mit Kunde → offene Punkte klären → Livegang.

## 11. Abnahme-Checkliste

Siehe `README.md` → «Livegang» und `docs/ANLEITUNG-NEUE-WEBSITE.md` Abschnitt 11.
