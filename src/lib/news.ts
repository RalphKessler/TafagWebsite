/**
 * LinkedIn-News (AGENTS.md §7): Die Startseite kennt nur diese Schnittstelle.
 * Welche Variante (Aggregator, Embed, CMS-Pflege, API) die Daten liefert, entscheidet
 * allein `aktiveQuelle` – die Darstellung bleibt gleich.
 */
import einstellungen from '../data/einstellungen.json';

export interface Beitrag {
  titel: string;
  anriss: string;
  bild?: string;
  datum?: Date;
  url: string;
}

export interface NewsQuelle {
  name: string;
  laden(anzahl: number): Promise<Beitrag[]>;
}

/** Schritt 3: statische Platzhalter, bis die Variante entschieden ist (OPEN-QUESTIONS.md A3). */
const platzhalter: NewsQuelle = {
  name: 'platzhalter',
  async laden(anzahl) {
    return Array.from({ length: anzahl }, (_, i) => ({
      titel: `TODO: LinkedIn-Beitrag ${i + 1}`,
      anriss: 'Hier erscheinen die neuesten Beiträge der LinkedIn-Unternehmensseite, sobald die Anbindung steht.',
      url: einstellungen.linkedin,
    }));
  },
};

/** Variante C: Beiträge werden im CMS unter «News» erfasst. Ohne Einträge greifen die Platzhalter. */
const cms: NewsQuelle = {
  name: 'cms',
  async laden(anzahl) {
    const { getCollection } = await import('astro:content');
    const eintraege = (await getCollection('news')).sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
    // Ohne Beiträge: Platzhalter nur auf der Test-Website, live entfällt die Sektion
    if (eintraege.length === 0) return import.meta.env.PUBLIC_NOINDEX === 'true' ? platzhalter.laden(anzahl) : [];
    return eintraege.slice(0, anzahl).map((e) => ({ ...e.data, bild: e.data.bild }));
  },
};

const aktiveQuelle: NewsQuelle = cms;

/** Fällt die Quelle aus, liefert die Funktion eine leere Liste – die Sektion wird dann ausgeblendet. */
export async function ladeNews(anzahl = 3): Promise<Beitrag[]> {
  try {
    return (await aktiveQuelle.laden(anzahl)).slice(0, anzahl);
  } catch {
    return [];
  }
}
