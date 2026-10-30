import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../visuals.js', import.meta.url), 'utf8');
function page({ reducedMotion = false, mobile = false } = {}) {
  const elements = new Map();
  function element(id, dataset = {}) {
    const node = { id, clientWidth: 320, scrollLeft: 0, offsetHeight: 400, dataset, textContent: '', attributes: {}, style: { setProperty(key, value) { this[key] = value; } }, events: {}, value: id === 'conversion-range' ? '3' : '', hidden: false, rect: { top: 0, height: 3000 },
      addEventListener(type, callback) { this.events[type] = callback; },
      setAttribute(key, value) { this.attributes[key] = value; },
      removeAttribute(key) { delete this.attributes[key]; },
      getBoundingClientRect() { return { ...this.rect, left: id === 'demo-hypothesis' && get('experiment-stage').dataset.phase !== 'results' ? 480 : 0 }; },
      animationRuns: [],
      animate(keyframes, options) { this.animationRuns.push({ keyframes, options }); return { cancel() {} }; },
      getAnimations() { return []; },
      append(...nodes) { for (const child of nodes) child.parentId = id; },
      scrollTo({ left }) { this.scrollLeft = left; },
      click() { this.events.click?.(); },
      focus() { this.focused = true; },
      scrollIntoView() { this.scrolledIntoView = true; },
    };
    elements.set(id, node);
    return node;
  }
  const signals = ['attention', 'friction', 'scroll'].map(name => element(name, { signal: name }));
  const signalControls = ['attention', 'friction', 'scroll'].map(key => element(`signal-control-${key}`, { signalControl: key }));
  const groups = { '[data-signal]': signals, '[data-signal-control]': signalControls };
  const get = id => elements.get(id) || element(id);
  const docEvents = {};
  const frames = new Map();
  const windowEvents = {};
  let frameId = 0;
  let clock = 0;
  const document = { hidden: false, getElementById: get, querySelector: () => get('signal-canvas'), querySelectorAll: selector => groups[selector] || [], addEventListener: (name, callback) => { docEvents[name] = callback; }, dispatchEvent: event => docEvents[event.type]?.(event) };
  const media = { matches: reducedMotion, addEventListener() {} };
  const context = { document, CustomEvent, window: { innerHeight: 1000, performance: { now: () => clock }, matchMedia: query => query.includes('max-width') ? { matches: mobile, addEventListener() {} } : media, addEventListener: (type, callback) => { windowEvents[type] = callback; }, requestAnimationFrame: callback => { const id = ++frameId; frames.set(id, callback); return id; }, cancelAnimationFrame: id => frames.delete(id) } };
  runInNewContext(source, context);
  const tick = (milliseconds = 500) => { clock += milliseconds; const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback(clock); };
  return { get, signals, document, revenueAt: context.calculateRevenueScenario, ratesAt: context.demoRatesAt, hide: () => docEvents.visibilitychange(), tick, click: id => get(id).events.click(), scroll: offset => { get('descobrir').rect.top = -offset; windowEvents.scroll(); tick(0); } };
}

test('scroll changes attention, friction and depth in both directions without click controls', () => {
  const demo = page();
  assert.equal(demo.get('signal-canvas').dataset.activeSignal, 'attention');
  assert.equal(demo.get('friction').events.click, undefined);
  demo.scroll(900);
  assert.equal(demo.get('signal-canvas').dataset.activeSignal, 'friction');
  assert.equal(demo.get('friction').attributes['aria-current'], 'step');
  assert.match(demo.get('signal-title').textContent, /dificuldade/);
  demo.scroll(1700);
  assert.equal(demo.get('signal-canvas').dataset.activeSignal, 'scroll');
  demo.scroll(0);
  assert.equal(demo.get('signal-canvas').dataset.activeSignal, 'attention');
});

test('approval gates progress; pause, resume, completion and reset work', () => {
  const demo = page();
  demo.tick();
  assert.equal(demo.get('progress-count').textContent, '');
  demo.click('approve-demo');
  demo.click('approve-demo');
  assert.equal(demo.get('experiment-status').textContent, 'Simulação pausada');
  assert.equal(demo.get('progress-count').textContent, '0 de 14 dias simulados');
  demo.click('approve-demo');
  demo.tick();
  assert.equal(demo.get('progress-count').textContent, '1 de 14 dias simulados');
  demo.document.hidden = true;
  demo.hide();
  demo.tick();
  assert.equal(demo.get('progress-count').textContent, '1 de 14 dias simulados');
  demo.click('approve-demo');
  for (let index = 0; index < 13; index++) demo.tick();
  assert.equal(demo.get('experiment-status').textContent, 'Simulação concluída');
  assert.equal(demo.get('variant-result').textContent, '3,0%');
  assert.equal(demo.get('approve-demo').disabled, true);
  demo.click('reset-demo');
  assert.equal(demo.get('progress-fill').style.transform, 'scaleX(0)');
  assert.equal(demo.get('experiment-status').textContent, 'Aguardando sua aprovação');
  assert.equal(demo.get('reset-demo').hidden, true);
});

test('reduced motion shows the completed example without a running timer', () => {
  const demo = page({ reducedMotion: true });
  demo.click('approve-demo');
  assert.equal(demo.get('experiment-status').textContent, 'Simulação concluída');
  assert.equal(demo.get('progress-count').textContent, '14 de 14 dias simulados');
});

test('smooth frames vary both curves and a 2% to 3% goal rate explains 50% relative growth', () => {
  const demo = page();
  demo.click('approve-demo');
  assert.equal(demo.get('experiment-analysis').hidden, false);
  assert.equal(demo.get('approve-demo').attributes['aria-expanded'], 'true');
  demo.tick(3500);
  assert.equal(demo.get('progress-count').textContent, '7 de 14 dias simulados');
  assert.equal(demo.get('experiment-status').textContent, 'Simulação em andamento');
  assert.equal(demo.get('demo-control-line').attributes.d.split('L').length, 29);
  assert.equal(demo.get('demo-chart-point').attributes.cx, '300.00');
  assert.notEqual(demo.ratesAt(7).control, demo.ratesAt(4).control);
  demo.tick(16);
  assert.notEqual(demo.get('demo-chart-point').attributes.cx, '300.00');
  assert.equal(demo.get('next-experiments').hidden, true);
  demo.tick(3500);
  assert.equal(demo.get('demo-relative-lift').textContent, '+50% vs. referência');
  assert.equal(demo.get('next-experiments').hidden, false);
  assert.match(demo.get('demo-outcome-title').textContent, /50% a mais no faturamento/);
  assert.match(demo.get('demo-revenue-gain').textContent, /250\.000/);
  assert.match(demo.get('demo-revenue-comparison').textContent, /500\.000.*750\.000/);
  assert.match(demo.get('demo-outcome-description').textContent, /1 ponto percentual.*50%.*500.000.*750.000/);
  demo.click('reset-demo');
  assert.equal(demo.get('experiment-analysis').hidden, true);
});

test('approval moves the hypothesis left, replaces the reference with results and reset restores review', () => {
  const demo = page();
  demo.click('approve-demo');
  assert.equal(demo.get('experiment-stage').dataset.phase, 'results');
  assert.equal(demo.get('demo-reference').hidden, true);
  assert.equal(demo.get('demo-hypothesis').animationRuns[0].keyframes[0].transform, 'translateX(480px)');
  assert.equal(demo.get('experiment-analysis').hidden, false);
  for (let day = 0; day <= 14; day += .1) {
    const rates = demo.ratesAt(day);
    assert.ok(rates.variant >= rates.control);
  }
  demo.click('reset-demo');
  assert.equal(demo.get('experiment-stage').dataset.phase, 'review');
  assert.equal(demo.get('approve-demo').focused, true);
  assert.equal(demo.get('demo-reference').hidden, false);
  assert.equal(demo.get('experiment-analysis').hidden, true);
});

test('revenue calculator turns 500k at 2% into 750k at 3% and handles loss and no change', () => {
  const demo = page();
  const range = demo.get('conversion-range');
  assert.match(demo.get('scenario-revenue').textContent, /750\.000/);
  assert.match(demo.get('extra-revenue').textContent, /\+R\$\s*250\.000/);
  assert.match(demo.get('revenue-lift').textContent, /\+50%/);
  range.value = '1'; range.events.input();
  assert.match(demo.get('scenario-revenue').textContent, /250\.000/);
  assert.match(demo.get('extra-revenue').textContent, /-.*250\.000/);
  assert.match(demo.get('difference-caption').textContent, /a menos/);
  assert.equal(demo.get('revenue-difference').dataset.direction, 'negative');
  range.value = '2'; range.events.input();
  assert.match(demo.get('extra-revenue').textContent, /R\$\s*0/);
  assert.match(demo.get('difference-caption').textContent, /Mesma conversão/);
  range.value = '5'; range.events.input();
  assert.match(demo.get('scenario-revenue').textContent, /1\.250\.000/);
  assert.match(demo.get('extra-revenue').textContent, /750\.000/);
  assert.equal(demo.revenueAt(100000, 4, 5).projected, 125000);
  assert.equal(demo.revenueAt(500000, 2, 2.4).difference, 100000);
});

test('mobile switches signals with explicit controls and scrolling preserves the selected view', () => {
  const demo = page({ mobile: true });
  assert.equal(demo.get('signal-canvas').dataset.activeSignal, 'attention');
  demo.click('signal-control-friction');
  assert.equal(demo.get('signal-canvas').dataset.activeSignal, 'friction');
  assert.equal(demo.get('signal-control-friction').attributes['aria-pressed'], 'true');
  assert.equal(demo.get('signal-control-attention').attributes['aria-pressed'], 'false');
  demo.scroll(1700);
  assert.equal(demo.get('signal-canvas').dataset.activeSignal, 'friction');
  demo.click('signal-control-scroll');
  assert.equal(demo.get('signal-canvas').dataset.activeSignal, 'scroll');
  assert.match(demo.get('signal-title').textContent, /inteiro/);
  demo.click('approve-demo');
  assert.equal(demo.get('mobile-experiment-story').dataset.page, '3');
  assert.equal(demo.get('demo-hypothesis').animationRuns.length, 0);
});

test('mobile swipe story gates results behind explicit approval and reuses the actual chart', () => {
  const demo = page({ mobile: true });
  const track = demo.get('experiment-story-track');
  assert.equal(demo.get('mobile-experiment-story').dataset.page, '0');
  assert.equal(demo.get('experiment-analysis').parentId, 'experiment-story-results');
  demo.click('experiment-story-next');
  assert.equal(demo.get('mobile-experiment-story').dataset.page, '1');
  assert.equal(track.scrollLeft, 320);
  track.scrollLeft = 640; track.events.scroll();
  assert.equal(demo.get('mobile-experiment-story').dataset.page, '2');
  assert.equal(demo.get('experiment-story-next').disabled, true);
  assert.equal(demo.get('experiment-stage').dataset.phase, undefined);
  demo.click('story-approve-demo');
  assert.equal(demo.get('experiment-stage').dataset.phase, 'results');
  assert.equal(demo.get('experiment-story-results').hidden, false);
  assert.equal(demo.get('mobile-experiment-story').dataset.page, '3');
  demo.click('story-pause-demo');
  assert.equal(demo.get('experiment-status').textContent, 'Simulação pausada');
  demo.click('story-reset-demo');
  assert.equal(demo.get('mobile-experiment-story').dataset.page, '0');
  assert.equal(demo.get('experiment-story-results').hidden, true);
  assert.equal(demo.get('experiment-stage').dataset.phase, 'review');
  assert.equal(page().get('experiment-analysis').parentId, 'experiment-stage');
});
