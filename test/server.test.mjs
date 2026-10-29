import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp, validateLead, saveToFirestore } from '../server.mjs';

const valid = { email: 'ana@empresa.com.br', website: 'empresa.com.br/pagina?email=private#top' };

test('persists Firestore fields with the Cloud Run identity and propagates failures', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/token')) return Response.json({ access_token: 'test-token' });
    if (url.endsWith('/project-id')) return new Response('test-project');
    return Response.json({ name: 'created' });
  };
  const lead = { ...validateLead(valid), status: 'new', createdAt: new Date('2026-01-01T00:00:00Z') };
  await saveToFirestore(lead, { fetcher, emulator: '', project: '' });
  const write = calls.at(-1);
  assert.match(write.url, /projects\/test-project\/databases\/\(default\)\/documents\/landing_leads$/);
  assert.equal(write.options.headers.Authorization, 'Bearer test-token');
  const payload = JSON.parse(write.options.body);
  assert.deepEqual(Object.keys(payload.fields).sort(), ['createdAt', 'email', 'status', 'website']);
  assert.equal(payload.fields.email.stringValue, valid.email);
  assert.equal(payload.fields.createdAt.timestampValue, '2026-01-01T00:00:00.000Z');
  await assert.rejects(saveToFirestore(lead, { emulator: '127.0.0.1:8081', project: 'test-project', fetcher: async () => new Response('', { status: 503 }) }), /Lead storage unavailable/);
});

test('validates email and website and removes unnecessary URL data', () => {
  assert.deepEqual(validateLead(valid), { email: valid.email, website: 'https://empresa.com.br/pagina' });
  assert.deepEqual(validateLead({ ...valid, name: 'Legacy contact', extra: 'ignored' }), validateLead(valid));
  for (const data of [null, [], {}, { ...valid, email: null }, { ...valid, website: 42 }, { ...valid, email: 'invalid' }, { ...valid, website: 'javascript:alert(1)' }, { ...valid, website: 'https://user:secret@empresa.com' }, { ...valid, website: 'local' }]) assert.equal(validateLead(data), null);
});

test('serves only public assets and acknowledges leads only after persistence', async (t) => {
  const leads = [];
  const server = createApp(async lead => { leads.push(lead); });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (data, headers = {}) => fetch(`${base}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: typeof data === 'string' ? data : JSON.stringify(data) });
  const page = await fetch(base);
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /lang="pt-BR"/);
  assert.doesNotMatch(html, /(?:id|name)="name"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="website"/);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  for (const path of ['/styles.css', '/story.css', '/process.css', '/script.js', '/visuals.js', '/story.js', '/motion.js', '/assets/scrollcraft.js', '/assets/scrollcraft.css', '/favicon.svg', '/health']) assert.equal((await fetch(base + path)).status, 200);
  for (const path of ['/server.mjs', '/package.json', '/.env']) assert.equal((await fetch(base + path)).status, 404);
  const response = await post(valid);
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(leads.length, 1);
  assert.deepEqual(Object.keys(leads[0]).sort(), ['createdAt', 'email', 'status', 'website']);
  assert.equal(leads[0].status, 'new');
  assert.ok(leads[0].createdAt instanceof Date);
  assert.equal((await post({ ...valid, email: 'invalid' })).status, 400);
  assert.equal((await post('{broken')).status, 400);
  assert.equal((await post(valid, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await post(valid, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await post('x'.repeat(9000))).status, 413);
  assert.equal(leads.length, 1);
  let limited;
  for (let index = 0; index < 32; index++) limited = await post('{}');
  assert.equal(limited.status, 429);
});

test('does not report success when storage fails', async (t) => {
  const server = createApp(async () => { throw new Error('storage unavailable'); });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false });
});
