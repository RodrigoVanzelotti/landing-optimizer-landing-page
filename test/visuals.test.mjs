import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../visuals.js', import.meta.url), 'utf8');
function page({ reducedMotion = false } = {}) {
  const elements = new Map();
  function element(id, dataset = {}) {
    const node = { dataset, textContent: '', attributes: {}, style: { setProperty(key, value) { this[key] = value; } }, events: {}, value: id === 'conversion-range' ? '2.8' : '', hidden: false, rect: { top: 0, height: 3000 },
      addEventListener(type, callback) { this.events[type] = callback; },
      setAttribute(key, value) { this.attributes[key] = value; },
      removeAttribute(key) { delete this.attributes[key]; },
      getBoundingClientRect() { return this.rect; },
      focus() { this.focused = true; },
    };
    elements.set(id, node);
    return node;
  }
  const scenarios = ['headline', 'cta', 'offer'].map(name => element(name, { scenario: name }));
  const signals = ['attention', 'friction', 'scroll'].map(name => element(name, { signal: name }));
  const visits = [5000, 20000, 50000].map(value => element(`visits-${value}`, { visits: String(value) }));
  const nextExperiments = ['cta', 'benefit'].map(name => element(`next-${name}`, { nextExperiment: name }));
  const groups = { '[data-scenario]': scenarios, '[data-signal]': signals, '[data-visits]': visits, '[data-next-experiment]': nextExperiments };
  const get = id => elements.get(id) || element(id);
  const docEvents = {};
  const frames = new Map();
  const windowEvents = {};
  let frameId = 0;
  let clock = 0;
  const document = { hidden: false, getElementById: get, querySelector: () => get('signal-canvas'), querySelectorAll: selector => groups[selector] || [], addEventListener: (name, callback) => { docEvents[name] = callback; }, dispatchEvent: event => docEvents[event.type]?.(event) };
  const media = { matches: reducedMotion, addEventListener() {} };
  const context = { document, CustomEvent, window: { innerHeight: 1000, performance: { now: () => clock }, matchMedia: () => media, addEventListener: (type, callback) => { windowEvents[type] = callback; }, requestAnimationFrame: callback => { const id = ++frameId; frames.set(id, callback); return id; }, cancelAnimationFrame: id => frames.delete(id) } };
  runInNewContext(source, context);
  const tick = (milliseconds = 500) => { clock += milliseconds; const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback(clock); };
  return { get, scenarios, signals, visits, document, ratesAt: context.demoRatesAt, hide: () => docEvents.visibilitychange(), tick, click: id => get(id).events.click(), scroll: offset => { get('descobrir').rect.top = -offset; windowEvents.scroll(); tick(0); } };
}

test('scenario controls update the chart, message and selected state', () => {
  const demo = page();
  demo.click('cta');
  assert.equal(demo.get('hero-rate').textContent, '2,5%');
  assert.equal(demo.get('hero-lift').textContent, '+25%');
  assert.equal(demo.get('hero-preview-cta').textContent, 'Quero encontrar meu curso ↗');
  assert.equal(demo.get('cta').attributes['aria-pressed'], 'true');
  assert.equal(demo.get('headline').attributes['aria-pressed'], 'false');
  assert.match(demo.get('hero-line').attributes.d, /^M0 150L/);
});

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
  assert.equal(demo.get('signal-mode-label').textContent, 'Profundidade de leitura');
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
  assert.equal(demo.get('demo-outcome-lift').textContent, '+50%');
  assert.match(demo.get('demo-outcome-title').textContent, /50% mais cadastros/);
  assert.match(demo.get('demo-outcome-description').textContent, /1 ponto percentual.*50%.*100 → 150/);
  demo.click('next-cta');
  assert.equal(demo.get('experiment-status').textContent, 'Aguardando sua aprovação');
  assert.equal(demo.get('experiment-analysis').hidden, true);
  assert.equal(demo.get('next-experiments').hidden, true);
  assert.equal(demo.get('demo-variant-cta').textContent, 'Ver cursos para minha carreira ↗');
  assert.equal(demo.get('approve-demo').focused, true);
  demo.tick();
  assert.equal(demo.get('progress-count').textContent, '0 de 14 dias simulados');
  demo.click('approve-demo');
  demo.tick(7000);
  assert.equal(demo.get('original-result').textContent, '3,0%');
  assert.equal(demo.get('variant-result').textContent, '3,6%');
  demo.click('reset-demo');
  assert.equal(demo.get('experiment-analysis').hidden, true);
});

test('all showcased experiments finish positively and keep the alternative above the reference', () => {
  const demo = page({ reducedMotion: true });
  demo.click('approve-demo');
  demo.click('next-benefit');
  assert.equal(demo.get('experiment-status').textContent, 'Aguardando sua aprovação');
  demo.click('approve-demo');
  assert.equal(demo.get('variant-result').textContent, '3,3%');
  assert.equal(demo.get('demo-relative-lift').textContent, '+10% vs. referência');
  for (const name of ['next-cta', 'next-benefit']) {
    demo.click(name);
    for (let day = 0; day <= 14; day += .1) {
      const rates = demo.ratesAt(day);
      assert.ok(rates.variant >= rates.control);
    }
    demo.click('approve-demo');
    assert.match(demo.get('demo-outcome-lift').textContent, /^\+\d+%$/);
  }
});

test('calculator handles positive, negative and unchanged outcomes and traffic selection', () => {
  const demo = page();
  const range = demo.get('conversion-range');
  range.events.input();
  assert.equal(demo.get('extra-conversions').textContent, '+160');
  range.value = '1';
  range.events.input();
  assert.equal(demo.get('extra-conversions').textContent, '-200');
  assert.match(demo.get('difference-caption').textContent, /a menos/);
  range.value = '2';
  range.events.input();
  assert.equal(demo.get('extra-conversions').textContent, '0');
  range.value = '5';
  demo.click('visits-50000');
  assert.equal(demo.get('scenario-conversions').textContent, '2.500');
  assert.equal(demo.get('extra-conversions').textContent, '+1.500');
});
