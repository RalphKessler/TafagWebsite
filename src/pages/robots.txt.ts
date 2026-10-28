import type { APIRoute } from 'astro';
import { noindex } from '../lib/hilfen';

export const GET: APIRoute = ({ site }) =>
  new Response(
    noindex
      ? 'User-agent: *\nDisallow: /\n'
      : `User-agent: *\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${new URL('/sitemap.xml', site)}\n`,
  );
