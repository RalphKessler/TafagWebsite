import { marked } from 'marked';

/** Test-Builds werden nicht von Suchmaschinen erfasst. */
export const noindex = import.meta.env.PUBLIC_NOINDEX === 'true';

/**
 * Platzhalter («TODO: …», «Bild folgt») nur auf der Test-Website zeigen.
 * Auf der Live-Website werden sie ausgeblendet; leere Abschnitte entfallen ganz.
 */
export const zeigeTodo = noindex;

/** Beginnt der Text mit «TODO»? */
export const istTodo = (s?: string | null) => !!s && /^\s*TODO\b/.test(s);

/** Live: Text ab «TODO:» abschneiden (z. B. Hinweise mit offener Ergänzung). */
export function ohneTodo(s?: string): string | undefined {
  if (!s || zeigeTodo) return s;
  const rest = s.split(/\s*TODO:/)[0].trim();
  return rest || undefined;
}

/** Live: Absätze und Listenpunkte entfernen, die mit «TODO» beginnen. */
export function ohneTodoMarkdown(inhalt?: string): string | undefined {
  if (!inhalt || zeigeTodo) return inhalt;
  const absaetze = inhalt
    .split(/\n\s*\n/)
    .map((a) => a.split('\n').filter((z) => !/^\s*(?:[-*]\s+)?TODO\b/.test(z)).join('\n'))
    .filter((a) => a.trim());
  return absaetze.length ? absaetze.join('\n\n') : undefined;
}

/** Markdown aus dem CMS in HTML umwandeln. Absätze mit «TODO:» werden auf der Test-Website markiert. */
export function markdown(inhalt?: string): string {
  const quelle = ohneTodoMarkdown(inhalt);
  if (!quelle) return '';
  const html = marked.parse(quelle, { async: false }) as string;
  return html.replace(/<p>TODO:/g, '<p class="todo">TODO:');
}

/**
 * Bausteine für die Live-Website bereinigen: Platzhalter-Texte und -Einträge entfernen,
 * Bausteine ohne Inhalt weglassen. Auf der Test-Website bleibt alles sichtbar.
 */
export function bereinigeBausteine<T extends { type: string }>(bloecke: T[]): T[] {
  if (zeigeTodo) return bloecke;
  const listen = ['eintraege', 'schritte', 'dateien', 'bilder'];
  return bloecke
    .map((b) => {
      const neu: Record<string, unknown> = { ...b };
      for (const [k, v] of Object.entries(neu)) {
        if (k === 'inhalt' && typeof v === 'string') neu[k] = ohneTodoMarkdown(v);
        else if (typeof v === 'string' && istTodo(v)) neu[k] = undefined;
      }
      for (const l of listen) {
        if (!Array.isArray(neu[l])) continue;
        neu[l] = (neu[l] as Record<string, unknown>[])
          .filter((e) => !istTodo(e.titel as string) && !istTodo(e.name as string))
          .map((e) => Object.fromEntries(Object.entries(e).map(([k, v]) => [k, typeof v === 'string' && istTodo(v) ? undefined : v])));
      }
      return neu as T;
    })
    .filter((b) => {
      const d = b as Record<string, unknown>;
      const leer = (l: string) => Array.isArray(d[l]) && (d[l] as unknown[]).length === 0;
      if (b.type === 'text') return !!d.inhalt;
      if (b.type === 'bildtext') return !!d.inhalt || !!d.bild;
      if (['leistungen', 'querverweise', 'logos', 'standorte', 'zeitstrahl'].includes(b.type)) return !leer('eintraege');
      if (b.type === 'ablauf') return !leer('schritte');
      if (b.type === 'downloads') return !leer('dateien');
      if (b.type === 'galerie') return !leer('bilder');
      return true;
    });
}

/** «de/automation/steuerungsbau» → Sprache und Pfad innerhalb der Sprache. */
export function zerlegeId(id: string): { sprache: string; slug: string } {
  const [sprache, ...rest] = id.split('/');
  return { sprache, slug: rest.join('/') };
}

/** Adresse einer Seite aus ihrer ID. */
export function seitenLink(id: string): string {
  const { sprache, slug } = zerlegeId(id);
  return slug ? `/${sprache}/${slug}/` : `/${sprache}/`;
}

const datumFormat = new Intl.DateTimeFormat('de-CH', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Europe/Zurich',
});
const zeitFormat = new Intl.DateTimeFormat('de-CH', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Zurich',
});

export function datumText(d: Date): string {
  return datumFormat.format(d);
}

/** Uhrzeit nur anzeigen, wenn eine gesetzt ist (nicht 00:00). */
export function zeitText(d: Date): string {
  const z = zeitFormat.format(d);
  return z === '00:00' ? '' : `${z} Uhr`;
}
