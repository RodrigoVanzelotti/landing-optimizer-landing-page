import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../story.js', import.meta.url), 'utf8');
function setup({ reducedMotion = false } = {}) {
  const nodes = new Map(); const events = {}; const windowEvents = {};
  const frames = new Map(); let clock = 0; let frameId = 0;
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, {
      dataset: {}, attributes: {}, events: {}, textContent: '', hidden: false,
      style: { setProperty(key, value) { this[key] = value; } }, classList: { add() {} },
      rect: { top: 400, height: 2400 },
      addEventListener(type, callback) { this.events[type] = callback; },
      getAttribute(key) { return this.attributes[key]; }, setAttribute(key, value) { this.attributes[key] = value; },
      removeAttribute(key) { delete this.attributes[key]; },
      getBoundingClientRect() { return { ...this.rect, bottom: this.rect.top + this.rect.height }; },
    });
    return nodes.get(id);
  };
  const steps = ['observe', 'propose', 'approve', 'test', 'decide'].map(key => { const node = get(`step-${key}`); node.dataset.cycleStep = key; return node; });
  const segments = steps.map((_, index) => get(`segment-${index}`));
  const document = {
    hidden: false, head: { append() {} }, createElement: () => ({}), documentElement: get('root'), getElementById: get,
    querySelectorAll: selector => ({ '[data-cycle-step]': steps, '[data-cycle-segment]': segments, '.editorial-photo': [] })[selector] || [],
    querySelector: selector => ({ '.decision-surface': get('surface'), '.process-turn-toggle': get('turn'), '.process-outcome-line': get('outcome-line') })[selector],
    addEventListener: (type, callback) => { events[type] = callback; }, dispatchEvent: event => events[event.type]?.(event),
  };
  const media = { matches: reducedMotion, addEventListener() {} };
  const window = {
    innerHeight: 800, performance: { now: () => clock }, matchMedia: () => media,
    addEventListener: (type, callback) => { windowEvents[type] = callback; },
    requestAnimationFrame: callback => { const id = ++frameId; frames.set(id, callback); return id; }, cancelAnimationFrame: id => frames.delete(id),
  };
  runInNewContext(source, { document, window });
  const tick = (elapsed = 0) => { clock += elapsed; const callbacks = [...frames.values()]; frames.clear(); for (const callback of callbacks) callback(clock); };
  return {
    get, document, tick,
    scroll: progress => { get('process-scroll-track').rect.top = -progress * 1600; windowEvents.scroll(); tick(); },
    click: id => get(id).events.click(),
    hover: (id, enter) => get(id).events[enter ? 'pointerenter' : 'pointerleave'](),
    dispatch: (type, detail) => document.dispatchEvent({ type, detail }),
  };
}

test('scroll turns the switch on and back off without a click or automatic experiment approval', () => {
  const page = setup();
  page.scroll(.1);
  assert.equal(page.get('processo').dataset.mode, undefined);
  page.scroll(.8);
  assert.equal(page.get('processo').dataset.mode, 'continuous');
  assert.equal(page.get('legacy-process').inert, true);
  assert.equal(page.get('legacy-process').attributes['aria-hidden'], 'true');
  assert.equal(page.get('continuous-process').inert, false);
  assert.equal(page.get('continuous-process').hidden, false);
  assert.equal(page.get('processo').style['--process-turn'], '1');
  assert.match(page.get('turn').attributes['aria-label'], /ativado pela rolagem/);
  assert.equal(page.get('step-approve').attributes['aria-pressed'], 'false');
  page.scroll(.1);
  assert.equal(page.get('processo').dataset.mode, 'legacy');
  assert.equal(page.get('continuous-process').inert, true);
  page.scroll(.45);
  assert.equal(page.get('processo').style['--process-turn'], '0.5');
});

test('the arrow advances around the circle, draws the current segment and completes previous segments', () => {
  const page = setup(); page.scroll(.8);
  const start = page.get('cycle-arrow').attributes.transform;
  page.tick(1100);
  assert.notEqual(page.get('cycle-arrow').attributes.transform, start);
  assert.equal(page.get('segment-0').style.strokeDashoffset, '0.5');
  assert.equal(page.get('segment-1').style.strokeDashoffset, '1');
  page.tick(2200);
  assert.equal(page.get('segment-0').style.strokeDashoffset, '0');
  assert.equal(page.get('step-propose').attributes['aria-current'], 'step');
  assert.equal(page.get('step-observe').dataset.state, 'done');
});

test('hover pauses without jumping, leaving resumes, and selecting a node stays paused until resumed', () => {
  const page = setup(); page.scroll(.8); page.tick(700);
  const moving = page.get('cycle-arrow').attributes.transform;
  page.hover('step-propose', true); page.tick(4000);
  assert.equal(page.get('cycle-arrow').attributes.transform, moving);
  assert.equal(page.get('cycle-detail').hidden, false);
  assert.match(page.get('cycle-detail-title').textContent, /hipótese/);
  page.hover('step-propose', false); page.tick(500);
  assert.notEqual(page.get('cycle-arrow').attributes.transform, moving);
  page.click('step-approve');
  const selected = page.get('cycle-arrow').attributes.transform;
  page.tick(4000);
  assert.equal(page.get('cycle-arrow').attributes.transform, selected);
  assert.match(page.get('cycle-detail-description').textContent, /Sem o seu sim/);
  assert.equal(page.get('step-approve').attributes['aria-pressed'], 'true');
  page.click('step-approve'); page.tick(500);
  assert.equal(page.get('step-approve').attributes['aria-pressed'], 'false');
  assert.notEqual(page.get('cycle-arrow').attributes.transform, selected);
});

test('reduced motion is static and hidden tabs pause without a large time jump', () => {
  const reduced = setup({ reducedMotion: true });
  const staticArrow = reduced.get('cycle-arrow').attributes.transform;
  reduced.tick(10000);
  assert.equal(reduced.get('processo').dataset.mode, 'continuous');
  assert.equal(reduced.get('cycle-arrow').attributes.transform, staticArrow);
  const page = setup(); page.scroll(.8); page.tick(500);
  const before = page.get('cycle-arrow').attributes.transform;
  page.document.hidden = true; page.dispatch('visibilitychange'); page.tick(10000);
  assert.equal(page.get('cycle-arrow').attributes.transform, before);
  page.document.hidden = false; page.dispatch('visibilitychange'); page.tick(100);
  assert.equal(page.get('step-observe').attributes['aria-current'], 'step');
});

test('five steps close a full loop and the fifth segment returns to data collection', () => {
  const page = setup(); page.scroll(.8);
  const start = page.get('cycle-arrow').attributes.transform;
  page.tick(4 * 2200);
  assert.equal(page.get('step-decide').attributes['aria-current'], 'step');
  assert.equal(page.get('segment-3').style.strokeDashoffset, '0');
  page.tick(1100);
  assert.equal(page.get('segment-4').style.strokeDashoffset, '0.5');
  page.tick(1100);
  assert.equal(page.get('cycle-arrow').attributes.transform, start);
  assert.equal(page.get('step-observe').attributes['aria-current'], 'step');
  assert.equal(page.get('step-approve').attributes['aria-pressed'], 'false');
});
