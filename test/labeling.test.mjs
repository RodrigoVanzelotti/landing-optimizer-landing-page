import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
test('SDK setup is limited to the script in the head', () => {
  const body = html.slice(html.indexOf('</head>'));
  assert.doesNotMatch(body, /\sdata-lo-[\w-]+\b/);
  assert.doesNotMatch(body, /<script\b[^>]*\/lo\.js/);
});

test('lead confirmation is initially hidden in the live region', () => {
  assert.match(html, /<div role="status" aria-live="polite"><p[^>]*><\/p><p id="form-success" class="form-status" hidden>Pedido recebido!.*ainda não está agendada\.<\/p><\/div>/);
});
