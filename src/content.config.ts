import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Leere CMS-Felder kommen als '' oder null an und würden die Prüfung scheitern lassen.
 * Deshalb werden sie vorab in `undefined` umgewandelt.
 */
const leer = (v: unknown) => (v === '' || v === null ? undefined : v);
const text = () => z.preprocess(leer, z.string().optional());
const liste = <T extends z.ZodType>(s: T) =>
  z.preprocess((v) => (v === '' || v === null ? [] : v), z.array(s).default([]));
const datum = () => z.preprocess(leer, z.coerce.date().optional());

// ---------- Bausteine des Seitenbaukastens ----------

const bausteinText = z.object({
  type: z.literal('text'),
  titel: text(),
  inhalt: text(),
});

const bausteinBild = z.object({
  type: z.literal('bild'),
  bild: text(),
  alt: text(),
  legende: text(),
  breite: z.preprocess(leer, z.enum(['normal', 'breit', 'voll']).default('normal')),
});

const bausteinGalerie = z.object({
  type: z.literal('galerie'),
  titel: text(),
  bilder: liste(z.object({ bild: z.string(), alt: text(), legende: text() })),
});

const bausteinDownloads = z.object({
  type: z.literal('downloads'),
  titel: text(),
  dateien: liste(z.object({ datei: z.string(), bezeichnung: text() })),
});

const bausteinFormular = z.object({
  type: z.literal('formular'),
  titel: text(),
  text: text(),
  anker: text(),
  formular: z.string(),
});

const bausteinButton = z.object({
  type: z.literal('button'),
  beschriftung: z.string(),
  link: z.string(),
  stil: z.preprocess(leer, z.enum(['primaer', 'sekundaer']).default('primaer')),
});

const bausteinKontakt = z.object({
  type: z.literal('kontaktperson'),
  titel: text(),
  personen: liste(z.string()),
});

const bausteinTermine = z.object({
  type: z.literal('termine'),
  titel: text(),
  kategorie: text(),
  anzahl: z.preprocess(leer, z.coerce.number().int().positive().optional()),
});

const bausteinVideo = z.object({
  type: z.literal('video'),
  titel: text(),
  url: z.string(),
  vorschaubild: text(),
});

const bausteinTeam = z.object({
  type: z.literal('team'),
  titel: text(),
  bereiche: liste(z.string()),
  // Diese Bereiche erscheinen oben mit eigener Überschrift, alle übrigen Personen gemeinsam darunter
  oben: liste(z.string()),
  titel_rest: text(),
});

const bausteinZeitstrahl = z.object({
  type: z.literal('zeitstrahl'),
  titel: text(),
  eintraege: liste(z.object({ jahr: z.coerce.string(), titel: z.string(), text: text() })),
  hintergrund: z.preprocess(leer, z.enum(['weiss', 'grau', 'dunkel']).default('weiss')),
});

const bausteinStellen = z.object({
  type: z.literal('stellen'),
  titel: text(),
  nur_lehrstellen: z.preprocess(leer, z.boolean().default(false)),
});

const hintergrund = () => z.preprocess(leer, z.enum(['weiss', 'grau', 'dunkel']).default('weiss'));
const eintrag = z.object({ titel: z.string(), text: text(), link: text() });

const bausteinLeistungen = z.object({
  type: z.literal('leistungen'),
  titel: text(),
  text: text(),
  eintraege: liste(eintrag),
  technik_titel: text(),
  technik_inhalt: text(),
  hintergrund: hintergrund(),
});

const bausteinAblauf = z.object({
  type: z.literal('ablauf'),
  titel: text(),
  text: text(),
  schritte: liste(z.object({ titel: z.string(), text: text() })),
  hintergrund: hintergrund(),
});

const bausteinQuerverweise = z.object({
  type: z.literal('querverweise'),
  titel: text(),
  text: text(),
  eintraege: liste(
    eintrag.extend({ bild: text(), marke: z.preprocess(leer, z.enum(['tafag']).default('tafag')) }),
  ),
  hintergrund: z.preprocess(leer, z.enum(['weiss', 'grau', 'dunkel']).default('dunkel')),
});

const bausteinBildtext = z.object({
  type: z.literal('bildtext'),
  titel: text(),
  inhalt: text(),
  bild: text(),
  alt: text(),
  bild_hinweis: text(),
  umgekehrt: z.preprocess(leer, z.boolean().default(false)),
  hintergrund: hintergrund(),
});

const bausteinStandorte = z.object({
  type: z.literal('standorte'),
  titel: text(),
  text: text(),
  eintraege: liste(
    z.object({
      bezeichnung: z.string(),
      titel: z.string(),
      firma: text(),
      strasse: text(),
      ort: text(),
      telefon: text(),
      email: text(),
      bild: text(),
      alt: text(),
      beschreibung: text(),
      anreise: text(),
      hinweis: text(),
      karte_link: text(),
    }),
  ),
  hintergrund: hintergrund(),
});

const bausteinLogos = z.object({
  type: z.literal('logos'),
  titel: text(),
  text: text(),
  eintraege: liste(
    z.object({
      name: z.string(),
      text: text(),
      logo: text(),
      link: text(),
      // Auch in der Partnerzeile der Startseite zeigen
      startseite: z.preprocess(leer, z.boolean().default(true)),
    }),
  ),
  hintergrund: hintergrund(),
});

const bausteinAufruf = z.object({
  type: z.literal('aufruf'),
  titel: z.string(),
  text: text(),
  beschriftung: z.string(),
  link: z.string(),
  beschriftung2: text(),
  link2: text(),
});

export const baustein = z.discriminatedUnion('type', [
  bausteinTeam,
  bausteinZeitstrahl,
  bausteinStellen,
  bausteinLeistungen,
  bausteinAblauf,
  bausteinQuerverweise,
  bausteinBildtext,
  bausteinAufruf,
  bausteinLogos,
  bausteinStandorte,
  bausteinText,
  bausteinBild,
  bausteinGalerie,
  bausteinDownloads,
  bausteinFormular,
  bausteinButton,
  bausteinKontakt,
  bausteinTermine,
  bausteinVideo,
]);
export type Baustein = z.infer<typeof baustein>;

// ---------- Sammlungen ----------

const seiten = defineCollection({
  // Ablage: seiten/<sprache>/<pfad>/index.yml → ID «de/automation/steuerungsbau»
  loader: glob({
    pattern: '**/*.yml',
    base: './src/content/seiten',
    generateId: ({ entry }) => entry.replace(/\.yml$/, '').replace(/\/?index$/, ''),
  }),
  schema: z.object({
    titel: z.string(),
    beschreibung: text(),
    titelbild: text(),
    titelbild_alt: text(),
    einleitung: text(),
    bloecke: liste(baustein),
    marke: z.preprocess(leer, z.enum(['tafag']).optional()),
    entwurf: z.preprocess(leer, z.boolean().default(false)),
  }),
});

const kontakte = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/kontakte' }),
  schema: z.object({
    name: z.string(),
    funktion: text(),
    ausbildung: text(),
    bereich: text(),
    foto: text(),
    telefon: text(),
    email: text(),
    reihenfolge: z.preprocess(leer, z.coerce.number().default(100)),
  }),
});

const termine = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/termine' }),
  schema: z.object({
    titel: z.string(),
    datum: z.coerce.date(),
    bis: datum(),
    ort: text(),
    kategorie: text(),
    beschreibung: text(),
  }),
});

const formulare = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/formulare' }),
  schema: z.object({
    titel: z.string(),
    empfaenger: z.string(),
    betreff: text(),
    bestaetigung: text(),
    knopf: text(),
    // Einsendungen samt Dateien werden nach so vielen Tagen automatisch gelöscht (leer = nie)
    loeschfrist_tage: z.preprocess(leer, z.coerce.number().int().positive().optional()),
    // «zammad»: Einsendung als Ticket im Zammad-System (ZAMMAD_URL), sonst per Mail
    ziel: z.preprocess(leer, z.enum(['mail', 'zammad']).default('mail')),
    zammad_dringend: text(),
    felder: liste(
      z.object({
        name: z.string(),
        bezeichnung: z.string(),
        typ: z.preprocess(
          leer,
          z.enum(['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'date', 'datei']).default('text'),
        ),
        pflicht: z.preprocess(leer, z.boolean().default(false)),
        mehrfach: z.preprocess(leer, z.boolean().default(false)),
        hinweis: text(),
        optionen: text(),
      }),
    ),
  }),
});

const produkte = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/produkte' }),
  schema: z.object({
    titel: z.string(),
    gruppe: z.enum(['evtms', 'hebebuehne-kran', 'module', 'rangierfahrzeuge', 'zweiweg', 'notstromversorgung', 'sonderloesungen']),
    // Produktmarke; leer = Marke der Produktgruppe
    marke: z.preprocess(leer, z.enum(['tafag']).optional()),
    kategorie: text(),
    kurz: text(),
    beschreibung: text(),
    bild: text(),
    // Weitere Bilder auf der Detailseite
    bilder: liste(z.object({ bild: z.string(), alt: text() })),
    technische_daten: liste(z.object({ name: z.string(), wert: z.string() })),
    modelle: liste(z.object({ name: z.string(), text: text() })),
    downloads: liste(z.object({ datei: z.string(), bezeichnung: text() })),
    reihenfolge: z.preprocess(leer, z.coerce.number().default(100)),
    // «abgekuendigt»: bleibt für Bestandskunden sichtbar, aber klar gekennzeichnet
    status: z.preprocess(leer, z.enum(['aktiv', 'abgekuendigt']).default('aktiv')),
    hinweis: text(),
    entwurf: z.preprocess(leer, z.boolean().default(false)),
  }),
});

const stellen = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/stellen' }),
  schema: z.object({
    titel: z.string(),
    bereich: text(),
    pensum: text(),
    eintritt: text(),
    standort: z.preprocess(leer, z.string().default('Goldau SZ')),
    anstellung: z.preprocess(leer, z.enum(['FULL_TIME', 'PART_TIME', 'TEMPORARY', 'INTERN']).default('FULL_TIME')),
    einleitung: text(),
    aufgaben: liste(z.string()),
    anforderungen: liste(z.string()),
    wir_bieten: liste(z.string()),
    ansprechperson: text(),
    veroeffentlicht: z.coerce.date(),
    gueltig_bis: datum(),
    archiviert: z.preprocess(leer, z.boolean().default(false)),
    lehrstelle: z.preprocess(leer, z.boolean().default(false)),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/news' }),
  schema: z.object({
    titel: z.string(),
    anriss: z.string(),
    datum: z.coerce.date(),
    bild: text(),
    url: z.string(),
  }),
});

export const collections = { seiten, kontakte, termine, formulare, produkte, stellen, news };
