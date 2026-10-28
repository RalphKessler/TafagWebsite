import { getCollection, type CollectionEntry } from 'astro:content';

export type Stelle = CollectionEntry<'stellen'>;

/** Ausgeschriebene Stellen: nicht archiviert und nicht abgelaufen, neueste zuerst. */
export async function offeneStellen(): Promise<Stelle[]> {
  const heute = new Date();
  return (await getCollection('stellen', (s) => !s.data.archiviert && (!s.data.gueltig_bis || s.data.gueltig_bis >= heute))).sort(
    (a, b) => b.data.veroeffentlicht.getTime() - a.data.veroeffentlicht.getTime(),
  );
}

export const stellenLink = (s: Stelle, sprache = 'de') => `/${sprache}/jobs/offene-stellen/${s.id}/`;

/** HTML-Beschreibung für JobPosting (Google verlangt HTML im Feld «description»). */
export function htmlBeschreibung(einleitung: string | undefined, abschnitte: [string, string[]][]): string {
  const esc = (x: string) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const teile = einleitung ? [`<p>${esc(einleitung)}</p>`] : [];
  for (const [titel, punkte] of abschnitte) {
    if (punkte.length) teile.push(`<p><strong>${esc(titel)}</strong></p><ul>${punkte.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`);
  }
  return teile.join('');
}
