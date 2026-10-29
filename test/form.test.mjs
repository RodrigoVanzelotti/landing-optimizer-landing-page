import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../script.js', import.meta.url), 'utf8');

function setup(fetcher) {
  const values = { name: ' Ana Silva ', email: ' ana@empresa.com.br ', website: 'empresa.com.br' };
  const events = {};
  const website = { value: '', validity: '', setCustomValidity(message) { this.validity = message; }, reportValidity() {}, addEventListener() {} };
  const form = { resetCount: 0, addEventListener(name, callback) { events[name] = callback; }, setAttribute() {}, removeAttribute() {}, reset() { this.resetCount++; } };
  const button = { disabled: false };
  const status = { textContent: '', dataset: {} };
  const elements = { 'contact-form': form, website, 'submit-button': button, 'form-status': status, year: {} };
  runInNewContext(source, {
    document: { querySelectorAll: () => [], getElementById: id => elements[id] },
    FormData: class { *[Symbol.iterator]() { yield* Object.entries(values); } },
    fetch: fetcher, URL, AbortSignal,
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
  assert.deepEqual(received, { name: 'Ana Silva', email: 'ana@empresa.com.br', website: 'https://empresa.com.br/' });
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
