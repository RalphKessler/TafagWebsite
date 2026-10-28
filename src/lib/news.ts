/**
 * News für «Aktuelles» auf der Startseite. Die Startseite kennt nur diese Schnittstelle;
 * welche Quelle die Daten liefert, entscheidet allein `aktiveQuelle`.
 */

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

/** Beiträge werden im CMS unter «News» erfasst. Ohne Einträge entfällt die Sektion (auch auf der Test-Website). */
const cms: NewsQuelle = {
  name: 'cms',
  async laden(anzahl) {
    const { getCollection } = await import('astro:content');
    const eintraege = (await getCollection('news')).sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
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
