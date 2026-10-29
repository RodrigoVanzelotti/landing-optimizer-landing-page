import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../script.js', import.meta.url), 'utf8');

function setup(fetcher, { faqItems = [], reducedMotion = false } = {}) {
  const values = { email: ' ana@empresa.com.br ', website: 'empresa.com.br' };
  const events = {};
  const website = { value: '', validity: '', setCustomValidity(message) { this.validity = message; }, reportValidity() {}, addEventListener() {} };
  const form = { resetCount: 0, addEventListener(name, callback) { events[name] = callback; }, setAttribute() {}, removeAttribute() {}, reset() { this.resetCount++; } };
  const button = { disabled: false };
  const status = { textContent: '', dataset: {} };
  const elements = { 'contact-form': form, website, 'submit-button': button, 'form-status': status, year: {} };
  runInNewContext(source, {
    document: { querySelectorAll: selector => selector === '.faq-list details' ? faqItems : [], getElementById: id => elements[id] },
    FormData: class { *[Symbol.iterator]() { yield* Object.entries(values); } },
    fetch: fetcher, URL, AbortSignal,
    window: { matchMedia: () => ({ matches: reducedMotion }) },
  });
  return { values, website, form, button, status, submit: () => events.submit({ preventDefault() {} }) };
}

test('sends normalized contact fields and confirms only successful persistence', async () => {
  let received;
  const page = setup(async (url, options) => {
    assert.equal(url, '/api/leads');
    received = JSON.parse(options.body);
    return Response.json({ ok: true }, { status: 201 });
  });
  await page.submit();
  assert.deepEqual(received, { email: 'ana@empresa.com.br', website: 'https://empresa.com.br/' });
  assert.match(page.status.textContent, /Pedido recebido/);
  assert.match(page.status.textContent, /ainda não está agendada/);
  assert.equal(page.form.resetCount, 1);
  assert.equal(page.button.disabled, false);
});

test('keeps fields on network or storage failure and allows retry', async () => {
  for (const fetcher of [async () => new Response('', { status: 503 }), async () => { throw new TypeError('offline'); }, async () => Response.json({ ok: false })]) {
    const page = setup(fetcher);
    await page.submit();
    assert.equal(page.form.resetCount, 0);
    assert.equal(page.status.dataset.error, 'true');
    assert.doesNotMatch(page.status.textContent, /Pedido recebido/);
    assert.equal(page.button.disabled, false);
  }
});

test('rejects invalid websites before sending and prevents duplicate in-flight submissions', async () => {
  let calls = 0;
  let complete;
  const page = setup(() => { calls++; return new Promise(resolve => { complete = resolve; }); });
  page.values.website = 'not-a-site';
  await page.submit();
  assert.equal(calls, 0);
  assert.match(page.website.validity, /site válido/);
  page.values.website = 'empresa.com.br';
  const pending = page.submit();
  await page.submit();
  assert.equal(calls, 1);
  complete(Response.json({ ok: true }));
  await pending;
});

test('FAQ uses an exclusive native group and expands smoothly without motion for reduced-motion visitors', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/<details name="faq">/g) || []).length, 6);
  const events = {}; const frames = []; let cancellations = 0;
  const item = {
    open: true, offsetHeight: 240,
    querySelector: () => ({ offsetHeight: 80 }),
    addEventListener: (type, callback) => { events[type] = callback; },
    getAnimations: () => [{ cancel() { cancellations++; } }],
    animate: (keyframes, options) => frames.push({ keyframes, options }),
  };
  setup(async () => {}, { faqItems: [item] });
  events.toggle();
  assert.equal(frames[0].keyframes[0].height, '80px');
  assert.equal(frames[0].keyframes[1].height, '240px');
  assert.equal(frames[0].options.duration, 360);
  item.open = false;
  events.toggle();
  assert.equal(frames.length, 1);
  assert.equal(cancellations, 2);
  item.open = true;
  setup(async () => {}, { faqItems: [item], reducedMotion: true });
  events.toggle();
  assert.equal(frames.length, 1);
});
