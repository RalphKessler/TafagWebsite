import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Erzeugt beim Build /api/formulare.php mit den Formular-Einstellungen aus dem CMS
 * (Empfänger, Betreff, erlaubte Felder). Als PHP-Datei ist der Inhalt von aussen
 * nicht lesbar – die Empfängeradressen stehen so nicht im HTML.
 */
export const GET: APIRoute = async () => {
  const formulare = await getCollection('formulare');
  const daten = Object.fromEntries(
    formulare.map((f) => [
      f.id,
      {
        titel: f.data.titel,
        empfaenger: f.data.empfaenger.split(/[,;\s]+/).filter(Boolean),
        betreff: f.data.betreff ?? `Website: ${f.data.titel}`,
        loeschfrist_tage: f.data.loeschfrist_tage ?? null,
        ziel: f.data.ziel,
        zammad_dringend: f.data.zammad_dringend ?? '',
        felder: f.data.felder.map((x) => ({
          name: x.name,
          bezeichnung: x.bezeichnung,
          typ: x.typ,
          pflicht: x.pflicht,
          mehrfach: x.mehrfach,
        })),
      },
    ]),
  );
  // JSON in einem PHP-Nowdoc: kein Zeichen darin wird von PHP ausgewertet.
  const php = `<?php\n// Automatisch erzeugt – nicht bearbeiten (Quelle: CMS > Formulare)\nif (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'formulare.php') { http_response_code(404); exit; }\nreturn json_decode(<<<'JSON'\n${JSON.stringify(daten, null, 2)}\nJSON, true);\n`;
  return new Response(php);
};
