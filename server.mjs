import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/script.js', ['script.js', 'text/javascript; charset=utf-8']],
  ['/visuals.js', ['visuals.js', 'text/javascript; charset=utf-8']],
  ['/story.js', ['story.js', 'text/javascript; charset=utf-8']],
  ['/motion.js', ['motion.js', 'text/javascript; charset=utf-8']],
  ['/story.css', ['story.css', 'text/css; charset=utf-8']],
  ['/assets/scrollcraft.js', ['assets/scrollcraft.js', 'text/javascript; charset=utf-8']],
  ['/assets/scrollcraft.css', ['assets/scrollcraft.css', 'text/css; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
]);
const root = new URL('./', import.meta.url);

export function validateLead(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  if (['name', 'email', 'website'].some(key => typeof data[key] !== 'string')) return null;
  const name = data.name.trim();
  const email = data.email.trim();
  const website = data.website.trim();
  if (name.length < 2 || name.length > 100 || /[\x00-\x1f<>]/.test(name)) return null;
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return null;
  if (!website || website.length > 2048) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`);
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) return null;
    // Only the public site is needed; discard query/fragment values that may contain personal data.
    return { name, email, website: `${url.origin}${url.pathname}` };
  } catch { return null; }
}

export function createApp(saveLead) {
  // shortcut: per-instance volume cap, add managed abuse protection if public spam warrants it.
  let windowStart = Date.now();
  let submissions = 0;
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com; font-src 'self' https://fonts.gstatic.com https://cdn.fontshare.com; img-src 'self' data: https://picsum.photos https://fastly.picsum.photos; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const json = (code, value) => {
      response.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify(value));
    };
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      if (pathname === '/api/leads') {
        if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return json(405, { ok: false }); }
        if (request.headers['sec-fetch-site'] === 'cross-site') return json(403, { ok: false });
        if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') return json(415, { ok: false });
        if (Date.now() - windowStart >= 60000) { windowStart = Date.now(); submissions = 0; }
        if (++submissions > 30) { response.setHeader('Retry-After', '60'); return json(429, { ok: false }); }
        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
          size += chunk.length;
          if (size > 8192) return json(413, { ok: false });
          chunks.push(chunk);
        }
        let data;
        try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
        catch { return json(400, { ok: false }); }
        const lead = validateLead(data);
        if (!lead) return json(400, { ok: false });
        await saveLead({ ...lead, createdAt: new Date(), status: 'new' });
        return json(201, { ok: true });
      }
      if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); return json(405, { ok: false }); }
      if (pathname === '/health') return json(200, { ok: true });
      const file = files.get(pathname);
      if (!file) return json(404, { ok: false });
      const content = await readFile(new URL(file[0], root));
      response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-cache' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch {
      // Do not log form contents or visitor identifiers.
      console.error(JSON.stringify({ event: 'request_failed' }));
      if (!response.headersSent) json(503, { ok: false });
      else response.end();
    }
  });
}

export async function saveToFirestore(lead, { fetcher = fetch, emulator = process.env.FIRESTORE_EMULATOR_HOST, project = process.env.GOOGLE_CLOUD_PROJECT } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  let projectId = project;
  if (!emulator) {
    const metadata = async path => {
      const result = await fetcher(`http://metadata.google.internal/computeMetadata/v1/${path}`, { headers: { 'Metadata-Flavor': 'Google' }, signal: AbortSignal.timeout(3000) });
      if (!result.ok) throw new Error('Service identity unavailable');
      return result;
    };
    const tokenResponse = await metadata('instance/service-accounts/default/token');
    const token = await tokenResponse.json();
    if (!token.access_token) throw new Error('Service identity unavailable');
    headers.Authorization = `Bearer ${token.access_token}`;
    if (!projectId) projectId = await (await metadata('project/project-id')).text();
  }
  if (!projectId) throw new Error('Google Cloud project is not configured');
  const base = emulator ? `http://${emulator}` : 'https://firestore.googleapis.com';
  const fields = Object.fromEntries(['name', 'email', 'website', 'status'].map(key => [key, { stringValue: lead[key] }]));
  fields.createdAt = { timestampValue: lead.createdAt.toISOString() };
  const result = await fetcher(`${base}/v1/projects/${encodeURIComponent(projectId.trim())}/databases/(default)/documents/landing_leads`, {
    method: 'POST', headers, body: JSON.stringify({ fields }), signal: AbortSignal.timeout(8000),
  });
  if (!result.ok) throw new Error('Lead storage unavailable');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createApp(lead => saveToFirestore(lead));
  app.requestTimeout = 20000;
  app.listen(Number(process.env.PORT) || 8080, '0.0.0.0', () => console.log('Landing page listening on configured port.'));
  process.on('SIGTERM', () => app.close(() => process.exit(0)));
}
