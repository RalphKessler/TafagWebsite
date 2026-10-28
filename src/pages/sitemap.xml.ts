import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { seitenLink } from '../lib/hilfen';
import { alleProdukte, gruppen, produktLink } from '../lib/produkte';
import { offeneStellen, stellenLink } from '../lib/stellen';

export const GET: APIRoute = async ({ site }) => {
  const seiten = await getCollection('seiten', (s) => !s.data.entwurf);
  const pfade = [
    ...seiten.map((s) => seitenLink(s.id)),
    '/de/produkte/',
    ...gruppen.map((g) => `/de/produkte/${g.slug}/`),
    ...(await alleProdukte()).map((p) => produktLink(p)),
    ...(await offeneStellen()).map((s) => stellenLink(s)),
  ];
  const urls = [...new Set(pfade)].map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
