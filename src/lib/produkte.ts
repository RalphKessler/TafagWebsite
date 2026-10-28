import { getCollection, type CollectionEntry } from 'astro:content';
import gruppenDaten from '../data/produktgruppen.json';
import type { Marke } from './marke';

export type Produkt = CollectionEntry<'produkte'>;
export interface Gruppe { slug: string; titel: string; marke: Marke; einleitung: string; bild?: string }

export const gruppen = gruppenDaten.gruppen as Gruppe[];
export const gruppeVon = (slug: string) => gruppen.find((g) => g.slug === slug)!;

export async function alleProdukte(): Promise<Produkt[]> {
  // Sortiert nach Reihenfolge der Gruppen (produktgruppen.json), dann innerhalb der Gruppe
  const gruppenIndex = (p: Produkt) => gruppen.findIndex((g) => g.slug === p.data.gruppe);
  return (await getCollection('produkte', (p) => !p.data.entwurf)).sort(
    (a, b) =>
      gruppenIndex(a) - gruppenIndex(b) ||
      a.data.reihenfolge - b.data.reihenfolge ||
      a.data.titel.localeCompare(b.data.titel, 'de'),
  );
}

/** Marke eines Produkts: eigene Angabe, sonst die der Gruppe. */
export const produktMarke = (p: Produkt): Marke => p.data.marke ?? gruppeVon(p.data.gruppe).marke;

export const produktLink = (p: Produkt, sprache = 'de') => `/${sprache}/produkte/${p.data.gruppe}/${p.id}/`;
