import de from './de.json';

// Oberflächentexte pro Sprache. Englisch folgt später als en.json mit denselben Schlüsseln.
const texte = { de } as const;
export type Sprache = keyof typeof texte;
export const sprachen: Sprache[] = ['de'];
export const standardSprache: Sprache = 'de';

export function t(sprache: Sprache, schluessel: keyof typeof de, werte: Record<string, string> = {}): string {
  const text: string = texte[sprache]?.[schluessel] ?? de[schluessel];
  return text.replace(/\{(\w+)\}/g, (_, k) => werte[k] ?? '');
}
