# Anleitung für Redaktorinnen und Redaktoren

## Anmelden

1. `https://<website>/admin` öffnen (in der Testphase die Test-Adresse).
2. «Mit GitHub anmelden». Sie brauchen ein GitHub-Konto mit Zugriff auf das Repository
   `RalphKessler/TafagWebsite` (Einladung durch die Administration).

Der Redaktionsbereich (Sveltia CMS) erscheint automatisch in der Sprache Ihres Browsers und lässt sich
auch auf Tablet und Handy bedienen.

Jede gespeicherte Änderung ist nach **2–3 Minuten** auf der Website sichtbar.

## Seiten bearbeiten

Unter **Seiten** finden Sie alle Seiten. Eine Seite hat einen Titel, eine Kurzbeschreibung (für Google),
optional eine Einleitung und ein Titelbild – und darunter beliebig viele **Bausteine**:

| Baustein | Wofür |
|---|---|
| **Text** | Fliesstext mit Zwischentiteln, Listen, Links, fett/kursiv |
| **Bild** | Einzelnes Bild. Bitte immer eine *Bildbeschreibung* ausfüllen |
| **Bildergalerie** | Mehrere Bilder im Raster; ein Klick vergrössert das Bild |
| **Downloads** | PDFs und andere Dateien zum Herunterladen |
| **Formular** | Ein Formular aus der Sammlung «Formulare» einfügen |
| **Button** | Auffälliger Link, z. B. «Offerte anfragen» |
| **Kontaktperson** | Eine oder mehrere Personen aus «Kontaktpersonen» – Namen eintippen, dann auswählen |
| **Termine** | Liste der kommenden Termine (optional nur eine Kategorie, nur die nächsten X) |
| **Video** | YouTube- oder Vimeo-Link. Das Video lädt aus Datenschutzgründen erst nach einem Klick |

Bausteine lassen sich mit den Pfeilen bzw. per Ziehen umsortieren und über das Menü des Bausteins löschen.

**Neue Seite:** «Neue Seite» → Titel eingeben → speichern. Die Adresse ergibt sich aus dem Feld «Adresse (Pfad)»
(Ordner, z. B. `automation/steuerungsbau` → `/de/automation/steuerungsbau/`). Damit die Seite im Menü erscheint, unter
**Einstellungen → Hauptnavigation** einen Unterpunkt ergänzen.
Mit «Entwurf» angehakt wird eine Seite nicht veröffentlicht.

## Bilder und Dateien

- Bilder möglichst **nicht grösser als 2000 Pixel** und unter 1 MB hochladen (z. B. mit squoosh.app verkleinern).
- Dateinamen ohne Umlaute und Leerzeichen, z. B. `team-2026.jpg`.
- Nur Bilder verwenden, an denen wir die Rechte haben. Personen auf Fotos müssen einverstanden sein.

## Platzhalter «TODO»

Texte, die mit «TODO:» beginnen, sind Merkzettel für fehlende Angaben. Sie erscheinen **nur auf der Test-Website**
(gelb markiert). Auf der Live-Website werden sie automatisch ausgeblendet, ebenso «Bild folgt»; Abschnitte, die nur
aus Platzhaltern bestehen, entfallen dort ganz. Sobald die Angabe vorliegt, den «TODO»-Text einfach ersetzen.

## Schreibweise

Der Firmenname lautet **Tafag AG** (so im Handelsregister); als Kurzform im Text «TAFAG». Fahrzeugbezeichnungen
wie «VTms», «ZAGRO E-MAXI M» oder «ZWEIWEG» immer in der Schreibweise des Herstellers.

## Pikettnummer

Die Nummer im dunklen Balken oben steht unter «Einstellungen» → «Firma und Fusszeile» → «Pikett-Nummer».
Beginnt sie mit «TODO:», wird sie auf der Live-Website nicht angezeigt.

## Partner und Logos

Die Partner stehen unter «Seiten» → «Über uns» → «Partner» im Baustein «Logos (Partner)». Pro Eintrag gibt es Name,
Kurzbeschreibung, Logo und Link. Ohne Logo erscheint der Name als Schriftzug. Mit «Auch auf der Startseite zeigen»
legen Sie fest, ob der Partner zusätzlich in der Zeile «Unsere Partner» auf der Startseite erscheint.

## Termine

Unter **Termine** anlegen. Vergangene Termine verschwinden automatisch (nachts) von der Website –
sie müssen nicht gelöscht werden.

## Formulare

Unter **Formulare** legen Sie Felder, Empfänger-Adressen und den Text nach dem Absenden fest.
Der «technische Name» eines Feldes bitte nachträglich nicht mehr ändern.

Alle Einsendungen gehen per Mail an die Empfänger und sind zusätzlich unter
`https://<website>/api/liste.php` (Passwort bei der Administration) einsehbar und als Excel herunterladbar.

## Impressum und Datenschutz

Beide Seiten sind normale Seiten unter **Seiten** und können dort angepasst werden.
Änderungen am Datenschutz bitte mit der verantwortlichen Person absprechen. Externe Dienste
(z. B. Google Maps, Kalender, Social-Media-Einbettungen) nicht ohne Rücksprache einbauen.

## Wenn etwas nicht klappt

- Änderung nach 5 Minuten nicht sichtbar? Seite mit Strg+F5 (Mac: Cmd+Shift+R) neu laden.
- Weiterhin nicht? Möglicherweise ist ein Pflichtfeld leer oder der Build fehlgeschlagen –
  bitte der Administration Bescheid geben (unter GitHub → *Actions* ist der Fehler sichtbar).
