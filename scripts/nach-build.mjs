// Läuft nach «astro build»: erzeugt dist/.htaccess (Weiterleitungen, Fehlerseite, Caching).
import { readFileSync, writeFileSync } from 'node:fs';

const { weiterleitungen = [] } = JSON.parse(readFileSync('src/data/redirects.json', 'utf8'));
const noindex = process.env.PUBLIC_NOINDEX === 'true';

// Genau diese Adresse (nicht alles, was damit beginnt); Sonderzeichen absichern
const muster = (p) => '"^' + String(p).trim().replace(/"/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$"';
const ziel = (p) => '"' + String(p).trim().replace(/"/g, '') + '"';
const gueltig = weiterleitungen.filter((w) => w?.von?.trim() && w?.nach?.trim() && w.von.startsWith('/'));

const zeilen = [
  '# Automatisch erzeugt von scripts/nach-build.mjs – nicht von Hand bearbeiten',
  'ErrorDocument 404 /404.html',
  'Options -Indexes',
  '',
  '<IfModule mod_rewrite.c>',
  '  RewriteEngine On',
  '  RewriteCond %{HTTPS} !=on',
  '  RewriteCond %{HTTP:X-Forwarded-Proto} !=https',
  '  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]',
  '</IfModule>',
  '',
  '# Startseite liegt unter /de/',
  'RedirectMatch 302 "^/$" "/de/"',
  '',
  '# Weiterleitungen alter Adressen (CMS > Einstellungen > Weiterleitungen)',
  ...gueltig.map((w) => `RedirectMatch 301 ${muster(w.von)} ${ziel(w.nach)}`),
  '',
  '<IfModule mod_headers.c>',
  '  Header always set X-Content-Type-Options "nosniff"',
  '  Header always set Referrer-Policy "strict-origin-when-cross-origin"',
  '  Header always set X-Frame-Options "SAMEORIGIN"',
  ...(noindex ? ['  Header always set X-Robots-Tag "noindex, nofollow"'] : []),
  '  <FilesMatch "\\.(css|js|woff2)$">',
  '    Header set Cache-Control "public, max-age=31536000, immutable"',
  '  </FilesMatch>',
  '</IfModule>',
  '',
];
writeFileSync('dist/.htaccess', zeilen.join('\n'));
console.log(`.htaccess geschrieben (${gueltig.length} Weiterleitungen${noindex ? ', noindex' : ''})`);
