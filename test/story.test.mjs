import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../story.js', import.meta.url), 'utf8');
function setup() {
  const nodes = new Map();
  const events = {};
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, { dataset: {}, attributes: {}, events: {}, textContent: '', hidden: false, classList: { add() {}, toggle() {} },
      addEventListener(type, callback) { this.events[type] = callback; },
      getAttribute(key) { return this.attributes[key]; }, setAttribute(key, value) { this.attributes[key] = value; },
      focus() { this.focused = true; }, animate() {},
    });
    return nodes.get(id);
  };
  const modes = ['legacy', 'continuous'].map(mode => { const node = get(mode); node.dataset.processMode = mode; return node; });
  const steps = ['observe', 'propose', 'approve', 'test', 'decide', 'repeat'].map(step => { const node = get(`step-${step}`); node.dataset.cycleStep = step; node.attributes['aria-pressed'] = String(step === 'observe'); return node; });
  const panels = ['objective', 'approval', 'learning'].map(key => {
    const panel = get(`panel-${key}`); const trigger = get(`trigger-${key}`);
    trigger.attributes['aria-controls'] = `content-${key}`;
    panel.querySelector = () => trigger;
    return panel;
  });
  const document = {
    hidden: false, head: { append() {} }, createElement: () => ({}), documentElement: get('root'), getElementById: get,
    querySelectorAll: selector => ({ '[data-process-mode]': modes, '[data-cycle-step]': steps, '.method-panel': panels, '.editorial-photo': [] })[selector] || [],
    querySelector: selector => selector === '.decision-surface' ? get('surface') : selector === '.method-strip' ? get('strip') : selector.includes('aria-pressed') ? steps.find(node => node.attributes['aria-pressed'] === 'true') : get('step-observe'),
    addEventListener: (type, callback) => { events[type] = callback; },
    dispatchEvent: event => events[event.type]?.(event),
  };
  get('surface').dataset.mode = 'legacy';
  runInNewContext(source, { document, CustomEvent, window: { matchMedia: () => ({ matches: false }) } });
  return { get, document, click: id => get(id).events.click(), dispatch: (type, detail) => document.dispatchEvent(new CustomEvent(type, { detail })) };
}

test('switches from handoffs to the approval-centered loop and back without starting a test', () => {
  const page = setup();
  page.click('break-cycle');
  assert.equal(page.get('legacy-process').hidden, true);
  assert.equal(page.get('continuous-process').hidden, false);
  assert.equal(page.get('continuous').attributes['aria-pressed'], 'true');
  assert.equal(page.get('surface').dataset.mode, 'continuous');
  assert.equal(page.get('step-observe').focused, true);
  page.click('step-approve');
  assert.match(page.get('cycle-detail-description').textContent, /Sem o seu sim/);
  page.click('legacy');
  assert.equal(page.get('continuous-process').hidden, true);
  assert.equal(page.get('surface').dataset.scVerifyState, 'legacy');
});

test('the cycle follows actual demo approval, completion and preparation for a fresh review', () => {
  const page = setup();
  page.click('continuous');
  page.dispatch('optimizer:demo', { approved: true, day: 4, complete: false });
  assert.equal(page.get('step-test').attributes['aria-pressed'], 'true');
  assert.match(page.get('cycle-demo-state').textContent, /dia 4 de 14/);
  page.dispatch('optimizer:demo', { approved: true, day: 14, complete: true });
  assert.equal(page.get('step-decide').attributes['aria-pressed'], 'true');
  assert.match(page.get('cycle-detail-description').textContent, /Não há vencedor publicado automaticamente/);
  page.dispatch('optimizer:demo', { approved: false, day: 0, complete: false });
  assert.equal(page.get('step-approve').attributes['aria-pressed'], 'true');
  assert.match(page.get('cycle-demo-state').textContent, /Aguardando/);
});

test('accordion supports keyboard selection and the moving strip can pause and resume', () => {
  const page = setup();
  page.click('trigger-approval');
  assert.equal(page.get('content-approval').hidden, false);
  assert.equal(page.get('content-objective').hidden, true);
  page.get('trigger-approval').events.keydown({ key: 'ArrowRight', preventDefault() {} });
  assert.equal(page.get('content-learning').hidden, false);
  assert.equal(page.get('trigger-learning').focused, true);
  page.click('pause-method');
  assert.equal(page.get('strip').dataset.paused, 'true');
  assert.equal(page.get('pause-method').attributes['aria-pressed'], 'true');
  page.click('pause-method');
  assert.equal(page.get('strip').dataset.paused, 'false');
});
