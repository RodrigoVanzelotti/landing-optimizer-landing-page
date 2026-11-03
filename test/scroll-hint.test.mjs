import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../script.js', import.meta.url), 'utf8');
function setup({ reducedMotion = false } = {}) {
  const hint = { hidden: true, events: {}, addEventListener(type, callback) { this.events[type] = callback; } };
  const windowEvents = {}, documentEvents = {};
  const timers = new Map();
  let clock = 0, nextId = 0;
  const media = { matches: true, addEventListener(type, callback) { this.change = callback; } };
  const rectangles = [{ top: 100, bottom: 2400 }, { top: 2500, bottom: 5000 }];
  const targets = [0, 1].map(() => ({ scrollIntoView(options) { this.scrollOptions = options; }, setAttribute() {}, focus() { this.focused = true; } }));
  const document = {
    hidden: false,
    getElementById: id => id === 'scroll-hint' ? hint : ['contact-form', 'website', 'submit-button', 'year', 'form-status'].includes(id) ? { addEventListener() {} } : undefined,
    querySelectorAll: selector => selector === '[data-scroll-story]' ? rectangles.map((rect, index) => ({ getBoundingClientRect: () => rect, closest: () => ({ nextElementSibling: targets[index] }) })) : [],
    addEventListener: (type, callback) => { documentEvents[type] = callback; },
  };
  const window = {
    innerHeight: 800, matchMedia: query => query.includes('prefers-reduced-motion') ? { matches: reducedMotion } : media,
    addEventListener: (type, callback) => { windowEvents[type] = callback; },
    setTimeout: (callback, delay) => { timers.set(++nextId, { callback, at: clock + delay }); return nextId; },
    clearTimeout: id => timers.delete(id),
  };
  runInNewContext(source, { document, window });
  const advance = elapsed => {
    clock += elapsed;
    for (const [id, timer] of timers) if (timer.at <= clock) { timers.delete(id); timer.callback(); }
  };
  return { hint, targets, click: () => hint.events.click(), rectangles, media, document, advance, scroll: windowEvents.scroll, resize: windowEvents.resize, visibility: documentEvents.visibilitychange };
}

test('scroll hint waits ten idle seconds within either pinned story and resets on movement or exit', () => {
  const page = setup();
  page.advance(20000);
  assert.equal(page.hint.hidden, true);
  page.rectangles[0].top = -200;
  page.scroll(); page.advance(9999);
  assert.equal(page.hint.hidden, true);
  page.advance(1);
  assert.equal(page.hint.hidden, false);
  page.scroll();
  assert.equal(page.hint.hidden, true);
  page.advance(9000); page.scroll(); page.advance(1000);
  assert.equal(page.hint.hidden, true);
  page.advance(9000);
  assert.equal(page.hint.hidden, false);
  page.rectangles[0].bottom = 824;
  page.scroll(); page.advance(10000);
  assert.equal(page.hint.hidden, true);
  page.rectangles[1].top = -10;
  page.scroll(); page.advance(10000);
  assert.equal(page.hint.hidden, false);
});

test('mobile and hidden tabs cancel the hint; returning starts a fresh ten-second wait', () => {
  const page = setup();
  page.rectangles[0].top = 0;
  page.scroll(); page.advance(9000);
  page.media.matches = false; page.media.change(); page.advance(20000);
  assert.equal(page.hint.hidden, true);
  page.media.matches = true; page.resize(); page.advance(10000);
  assert.equal(page.hint.hidden, false);
  page.document.hidden = true; page.visibility(); page.advance(20000);
  assert.equal(page.hint.hidden, true);
  page.document.hidden = false; page.visibility(); page.advance(9999);
  assert.equal(page.hint.hidden, true);
  page.advance(1);
  assert.equal(page.hint.hidden, false);
});

test('clicking the hint moves and focuses the next section, honoring reduced motion', () => {
  for (const reducedMotion of [false, true]) {
    const page = setup({ reducedMotion });
    page.rectangles[0].top = 0; page.scroll(); page.advance(10000); page.click();
    assert.equal(page.hint.hidden, true);
    assert.equal(page.targets[0].scrollOptions.behavior, reducedMotion ? 'instant' : 'smooth');
    assert.equal(page.targets[0].focused, true);
    page.rectangles[0].bottom = 0; page.rectangles[1].top = 0;
    page.scroll(); page.advance(10000); page.click();
    assert.equal(page.targets[1].focused, true);
  }
});
