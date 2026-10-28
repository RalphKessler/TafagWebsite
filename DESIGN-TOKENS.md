# Designplan und Tokens

Umsetzung in `src/styles/tokens.css`. Grundlage: Logo der Tafag AG (www.tafag.ch) und die Fotos der eigenen
Fahrzeuge, die durchgehend im typischen Bahndienst-Gelb lackiert sind.

## Leitidee: Blau aus dem Logo, Gelb von den Fahrzeugen, das Gleis als Motiv

- **Blau** ist die Logofarbe und trägt Links, Knöpfe und den Markenbalken unter dem Kopf.
- **Gelb** kommt von den Fahrzeugen. Es markiert die Hauptaktion auf dunklen Flächen und die Schienen im Motiv.
- **Das Gleis** (zwei Schienen mit Schwellen, `src/components/Gleis.astro`) ist das einzige grafische Motiv.
  Es liegt als schmales Band am unteren Rand der dunklen Flächen (Startseite, Seitenkopf, Aufruf).
  Ersetzt die Welle der SPÄNI-Vorlage.
- **Dunkle Bühnen** in Nachtblau `--navy` für Hero, Seitenköpfe und Kontakt – darauf wirken die gelben Fahrzeuge.
- **Bilder zuerst.** Die Bereichskacheln der Startseite tragen ein Foto, Produkte haben Haupt- und Zusatzbilder.
- Keine Verläufe, keine Schattenstapel, keine Einblend-Animationen.

## Farben

| Token | Wert | Verwendung | Kontrast |
|---|---|---|---|
| `--tafag-blau` | `#3055a5` | Logofarbe (gemessen), Knöpfe, Markenbalken | Weiss darauf 7.1 : 1 |
| `--tafag-blau-text` | `#2a4c96` | Links und Text in Blau | 8.4 : 1 auf Weiss |
| `--tafag-gelb` | `#ffcb05` | Hauptaktion auf Dunkel, Schienen | Navy darauf 11.1 : 1 |
| `--tafag-hellblau` | `#8fa9db` | Schwellen, Akzente auf Dunkel | 7.2 : 1 auf Navy |
| `--navy` | `#0e1c36` | dunkle Flächen | Weiss darauf > 15 : 1 |
| `--text` / `--text-2` | `#121c2e` / `#4a5568` | Text | > 15 : 1 / 7.5 : 1 |
| `--grau-50` … `--grau-200` | `#f4f6fa` … `#d2dae7` | Flächen, Linien | – |

Gelb nie als Textfarbe auf Weiss verwenden (zu wenig Kontrast).

### Marken

TAFAG tritt mit einer Marke auf (`tafag`). Der Mechanismus der Vorlage (`data-marke` auf `<body>`, Akzentfarbe
pro Bereich) bleibt erhalten, damit z. B. eine Partnermarke später ergänzt werden kann:
neuen Schlüssel in `src/lib/marke.ts` und `src/content.config.ts` aufnehmen und in `tokens.css` eine Regel
`[data-marke='…'] { --akzent: …; }` ergänzen.

## Schrift

**Archivo** (variabel, selbst ausgeliefert über `@fontsource-variable/archivo`). Kräftige, technische
Grotesk – passt zur fetten Wortmarke im Logo und zu einem Fahrzeugbauer. Technische Daten mit
Tabellenziffern.

- Überschriften: 750, leicht negativer Buchstabenabstand.
- Fliesstext: 1.0625 rem, Zeilenhöhe 1.65, max. 70 Zeichen.

## Formen

- Knöpfe als Pillen; Flächen und Bilder mit 10–20 px Radius (nimmt die gerundeten Felder des Logos auf).
- Karten für Bereichseinstiege und Produkte – mit Farbstrich oben, ohne Schatten.

## Bewegung und Fokus

Eine Bewegung: die Linie unter dem aktiven Navigationspunkt; entfällt bei `prefers-reduced-motion`.
Fokusrahmen 3 px in der Akzentfarbe, auf dunklen Flächen Gelb.
