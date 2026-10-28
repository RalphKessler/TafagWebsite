# Stack-Entscheid

**Astro (statische Website) + Sveltia CMS + PHP-Formularskripte, gehostet bei Hostpoint.**

1. **Selbst pflegen ohne Code.** Sveltia CMS läuft unter `/admin` im Browser. Seiten, News, Stellen und
   Produkte sind Formulare mit festen Feldern; Redaktoren sehen keinen Code. Jede Änderung wird als
   Versionsstand im Git-Repository gespeichert und ist rückverfolgbar und rückgängig zu machen.
2. **Wartbarkeit.** Keine Datenbank, kein Server-CMS, das Sicherheitsupdates braucht. Die Website besteht
   aus fertigen HTML-Dateien; Inhalte liegen als lesbare YAML-Dateien vor und lassen sich auch später mit
   jedem anderen System weiterverwenden. Astro und Sveltia sind verbreitete Open-Source-Projekte; Sveltia ist der aktiv
   gepflegte Nachfolger von Decap CMS (gleiches Konfigurationsformat, schneller, auf dem Handy bedienbar).
   Einzige Serverlogik sind drei kleine PHP-Skripte (Formulare), die auf jedem Standard-Hosting laufen.
3. **Performance bei Bildern.** Statische Seiten ohne Framework-JavaScript, Bilder mit festen Seitenverhältnissen,
   `loading="lazy"` und modernen Formaten (WebP/AVIF über Astros Bildverarbeitung; wird mit dem
   Produktkatalog in Schritt 5 eingerichtet).

Mehrsprachigkeit: Astros i18n-Routing mit `/de/…` (später `/en/…`), Oberflächentexte in `src/i18n/`.
Deployment: GitHub Actions baut bei jeder Änderung und lädt per `rsync` zu Hostpoint.

Nicht gewählt: WordPress (Pflegeaufwand für Updates und Plugins, Sicherheitsrisiko), Headless-SaaS-CMS
(laufende Kosten, Daten ausserhalb der Schweiz).
