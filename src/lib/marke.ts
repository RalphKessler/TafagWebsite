/**
 * TAFAG tritt mit einer einzigen Marke auf. Der Mechanismus über data-marke bleibt erhalten,
 * damit später eine Bereichs- oder Partnermarke ergänzt werden kann (siehe DESIGN-TOKENS.md).
 */
export type Marke = 'tafag';

export function markeAusPfad(_slug: string): Marke {
  return 'tafag';
}

export const markenLogo: Record<Marke, { src: string; alt: string; breite: number; hoehe: number } | null> = {
  tafag: null, // TAFAG erscheint immer in der Kopfzeile
};
