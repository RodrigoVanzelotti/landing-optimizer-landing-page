import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../script.js', import.meta.url), 'utf8');
function setup() {
  const node = () => ({ dataset: {}, attributes: {}, events: {}, hidden: true,
    addEventListener(type, callback) { this.events[type] = callback; },
    setAttribute(key, value) { this.attributes[key] = value; },
    getAttribute(key) { return this.attributes[key]; },
    focus() { this.focused = true; },
  });
  const button = node(), navigation = node(), header = node();
  header.contains = target => [button, navigation, header].includes(target);
  const nodes = { 'menu-toggle': button, 'site-navigation': navigation, 'site-header': header, 'contact-form': node(), website: node(), 'submit-button': node(), 'form-status': node(), year: node() };
  const documentEvents = {};
  const media = { addEventListener(type, callback) { this.change = callback; } };
  runInNewContext(source, { document: { getElementById: id => nodes[id], querySelectorAll: () => [], addEventListener: (type, callback) => { documentEvents[type] = callback; } }, window: { matchMedia: () => media } });
  return { button, header, navigation, media, outside: () => documentEvents.pointerdown({ target: {} }) };
}

test('mobile menu toggles accessible state and closes with Escape, a link, outside click or resize', () => {
  const page = setup();
  assert.equal(page.button.hidden, false);
  assert.equal(page.header.dataset.menuReady, 'true');
  assert.equal(page.button.attributes['aria-expanded'], 'false');
  page.button.events.click();
  assert.equal(page.header.dataset.menuOpen, 'true');
  assert.equal(page.button.attributes['aria-expanded'], 'true');
  assert.equal(page.button.attributes['aria-label'], 'Fechar menu');
  page.header.events.keydown({ key: 'Escape' });
  assert.equal(page.header.dataset.menuOpen, 'false');
  assert.equal(page.button.focused, true);
  page.button.events.click(); page.navigation.events.click();
  assert.equal(page.button.attributes['aria-expanded'], 'false');
  page.button.events.click(); page.outside();
  assert.equal(page.header.dataset.menuOpen, 'false');
  page.button.events.click(); page.media.change();
  assert.equal(page.header.dataset.menuOpen, 'false');
});
