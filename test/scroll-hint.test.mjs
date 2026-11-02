import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../script.js', import.meta.url), 'utf8');
function setup() {
  const hint = { hidden: true };
  const windowEvents = {}, documentEvents = {};
  const timers = new Map();
  let clock = 0, nextId = 0;
  const media = { matches: true, addEventListener(type, callback) { this.change = callback; } };
  const rectangles = [{ top: 100, bottom: 2400 }, { top: 2500, bottom: 5000 }];
  const document = {
    hidden: false,
    getElementById: id => id === 'scroll-hint' ? hint : { addEventListener() {} },
    querySelectorAll: selector => selector === '[data-scroll-story]' ? rectangles.map(rect => ({ getBoundingClientRect: () => rect })) : [],
    addEventListener: (type, callback) => { documentEvents[type] = callback; },
  };
  const window = {
    innerHeight: 800, matchMedia: () => media,
    addEventListener: (type, callback) => { windowEvents[type] = callback; },
    setTimeout: (callback, delay) => { timers.set(++nextId, { callback, at: clock + delay }); return nextId; },
    clearTimeout: id => timers.delete(id),
  };
  runInNewContext(source, { document, window });
  const advance = elapsed => {
    clock += elapsed;
    for (const [id, timer] of timers) if (timer.at <= clock) { timers.delete(id); timer.callback(); }
  };
  return { hint, rectangles, media, document, advance, scroll: windowEvents.scroll, resize: windowEvents.resize, visibility: documentEvents.visibilitychange };
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
