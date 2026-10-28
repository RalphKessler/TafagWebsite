// @ts-check
import { defineConfig } from 'astro/config';

// Adresse der Website – für Test-Builds per Umgebungsvariable überschreibbar
const site = process.env.SITE_URL || 'https://www.tafag.ch';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // Sprachpräfixierte URLs (/de/…); Englisch wird später ergänzt, ohne Umbau
  i18n: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  devToolbar: { enabled: false },
});
