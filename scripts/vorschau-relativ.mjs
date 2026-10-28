// Läuft nach «astro build» für die Vorschau auf GitHub Pages (Unterordner /TafagWebsite/):
// schreibt Links wie «/de/kontakt/» in relative Pfade um («../kontakt/index.html»).
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, extname } from 'node:path';

const wurzel = process.argv[2] ?? 'dist';

const dateien = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? dateien(join(d, f)) : [join(d, f)]));

function ziel(url, von) {
  const pfad = url.split(/[?#]/)[0];
  const rest = url.slice(pfad.length);
  let p = pfad.replace(/^\//, '');
  if (p === '' || p.endsWith('/')) p += 'index.html';
  else if (!extname(p)) p += '/index.html';
  if (!existsSync(join(wurzel, p))) return null;
  return relative(von, join(wurzel, p)) + rest;
}

let anzahl = 0;
for (const datei of dateien(wurzel).filter((f) => /\.(html|css)$/.test(f))) {
  const von = dirname(datei);
  const ersetze = (_, vor, url, nach) => {
    const z = ziel(url, von);
    if (z) anzahl++;
    return vor + (z ?? url) + nach;
  };
  const neu = readFileSync(datei, 'utf8')
    .replace(/((?:href|src|srcset|action)=")(\/[^"]*)(")/g, ersetze)
    .replace(/(url\()(\/[^)]*)(\))/g, ersetze)
    .replace(/(content="\d+;\s*url=)(\/[^"]*)(")/g, ersetze);
  writeFileSync(datei, neu);
}
console.log(`Vorschau: ${anzahl} Links relativ gesetzt`);
