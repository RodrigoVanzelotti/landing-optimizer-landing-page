import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const tags = [...html.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*>/g)].map(match => ({
  tag: match[1],
  attributes: Object.fromEntries([...match[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(attribute => [attribute[1], attribute[2]])),
  source: match[0],
}));

test('manual labels cover landing sections and every action within the 60-element limit', () => {
  const roles = new Set(['navigation', 'hero', 'heading', 'cta', 'form', 'pricing', 'testimonials', 'faq', 'section', 'footer']);
  const mapped = tags.filter(node => 'data-lo-role' in node.attributes);
  const identities = tags.filter(node => 'data-lo-id' in node.attributes).map(node => node.attributes['data-lo-id']);
  assert.ok(mapped.length > 0 && mapped.length <= 60);
  assert.equal(new Set(identities).size, identities.length, 'IDs must be unique even on hidden elements');
  for (const node of mapped) {
    assert.ok(roles.has(node.attributes['data-lo-role']));
    assert.match(node.attributes['data-lo-id'] ?? '', /^[a-z][a-z0-9-]{0,63}$/);
    assert.doesNotMatch(node.source, /data-lo-ignore/);
    assert.ok(!['input', 'textarea', 'select'].includes(node.tag), 'Do not map individual fields');
    if (node.attributes['data-lo-role'] === 'form') assert.equal(node.tag, 'form');
    if (node.attributes['data-lo-role'] === 'cta') assert.ok(['a', 'button'].includes(node.tag));
  }
  for (const node of tags.filter(node => ['a', 'button', 'form', 'section', 'details'].includes(node.tag))) {
    assert.ok(node.attributes['data-lo-role'], `Missing mapping: ${node.source}`);
  }
  assert.match(html, /<div class="field" data-lo-ignore><label for="email">/);
  assert.match(html, /<div class="field" data-lo-ignore><label for="website">/);
  assert.match(html, /<p data-lo-ignore id="form-status"/);
});
