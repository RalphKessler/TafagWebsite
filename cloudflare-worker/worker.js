/**
 * GitHub-Anmeldung für Sveltia CMS / Decap CMS (OAuth-Vermittler, gleiches Verfahren).
 *
 * Umgebungsvariablen (Cloudflare > Worker > Settings > Variables):
 *   GITHUB_CLIENT_ID      – aus der GitHub-OAuth-App
 *   GITHUB_CLIENT_SECRET  – aus der GitHub-OAuth-App (als «Secret» speichern)
 *   ALLOWED_DOMAINS       – kommagetrennt, z. B. «www.tafag.ch,test.tafag.ch»
 */

const GITHUB = 'https://github.com/login/oauth';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/auth') return auth(url, env);
    if (url.pathname === '/callback') return callback(request, url, env);
    return new Response('Decap OAuth', { status: 200 });
  },
};

function erlaubt(host, env) {
  const liste = (env.ALLOWED_DOMAINS || '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);
  return liste.includes(String(host).toLowerCase());
}

function auth(url, env) {
  // Das CMS übergibt die Website-Domain als «site_id»
  const site = url.searchParams.get('site_id') || '';
  if (!erlaubt(site, env)) return new Response(`Domain nicht erlaubt: ${site}`, { status: 403 });

  const state = crypto.randomUUID();
  const ziel = new URL(`${GITHUB}/authorize`);
  ziel.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  ziel.searchParams.set('redirect_uri', `${url.origin}/callback`);
  ziel.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
  ziel.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: ziel.toString(),
      'Set-Cookie': `decap_state=${state}; Path=/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function callback(request, url, env) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = /(?:^|;\s*)decap_state=([^;]+)/.exec(request.headers.get('Cookie') || '')?.[1];
  if (!code || !state || state !== cookie) return antwort('error', { message: 'Ungültige Anmeldung' }, env);

  const res = await fetch(`${GITHUB}/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });
  const daten = await res.json().catch(() => ({}));
  if (!daten.access_token) return antwort('error', { message: daten.error_description || 'Kein Token erhalten' }, env);
  return antwort('success', { token: daten.access_token, provider: 'github' }, env);
}

/** Gibt das Ergebnis per postMessage an das CMS-Fenster zurück – nur an erlaubte Domains. */
function antwort(status, inhalt, env) {
  const domains = JSON.stringify(
    (env.ALLOWED_DOMAINS || '').split(',').map((d) => d.trim()).filter(Boolean).map((d) => `https://${d}`),
  );
  const nachricht = JSON.stringify(`authorization:github:${status}:${JSON.stringify(inhalt)}`);
  const html = `<!doctype html><html><body><script>
  (function () {
    var erlaubt = ${domains};
    function empfang(e) {
      if (erlaubt.indexOf(e.origin) === -1) return;
      window.opener.postMessage(${nachricht}, e.origin);
      window.removeEventListener('message', empfang);
    }
    window.addEventListener('message', empfang);
    window.opener && window.opener.postMessage('authorizing:github', '*');
  })();
  </script></body></html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': 'decap_state=; Path=/callback; Max-Age=0' },
  });
}
