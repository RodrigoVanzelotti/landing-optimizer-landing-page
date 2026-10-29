'use strict';

const cabinetStyles = document.createElement('link');
cabinetStyles.rel = 'stylesheet';
cabinetStyles.href = 'https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,600,700,800&display=swap';
document.head.append(cabinetStyles);

const cycleSteps = {
  observe: ['Entender antes de mudar.', 'Os sinais do site e o objetivo do negócio mostram onde investigar primeiro.'],
  propose: ['Uma hipótese com direção.', 'A IA transforma os sinais em propostas ligadas ao seu objetivo.'],
  approve: ['A prévia vem antes do teste.', 'Você revisa a proposta. Sem o seu sim, nenhum teste começa.'],
  test: ['Comparar para aprender.', 'As versões são comparadas com a página de referência e o objetivo definido.'],
  decide: ['A decisão continua sua.', 'Você decide o que fica. Não há vencedor publicado automaticamente.'],
};
const cycleOrder = Object.keys(cycleSteps);
const cycleLabels = ['Coletar dados', 'Hipóteses com IA', 'Você aprova', 'Teste A/B automatizado', 'Você decide'];
const processSection = document.getElementById('processo');
const processTrack = document.getElementById('process-scroll-track');
const processSurface = document.querySelector('.decision-surface');
const cycleNodes = [...document.querySelectorAll('[data-cycle-step]')];
const cycleSegments = [...document.querySelectorAll('[data-cycle-segment]')];
const cycleMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let cyclePosition = cycleMotion.matches ? 2 : 0;
let selectedStep = null;
let hoveredStep = null;
let focusedStep = null;
let manuallyPaused = false;
let processVisible = false;
let processMode = 'legacy';
let cycleFrame = null;
let cycleLastTime = null;
let processScrollFrame = null;

function renderCycle() {
  const index = Math.floor(cyclePosition);
  const progress = cyclePosition - index;
  const inspected = hoveredStep || focusedStep || selectedStep;
  for (const [nodeIndex, node] of cycleNodes.entries()) {
    node.dataset.state = nodeIndex < index ? 'done' : nodeIndex === index ? 'current' : 'future';
    node.dataset.inspected = String(node.dataset.cycleStep === inspected);
    node.setAttribute('aria-pressed', String(node.dataset.cycleStep === selectedStep));
    if (nodeIndex === index) node.setAttribute('aria-current', 'step');
    else node.removeAttribute('aria-current');
  }
  for (const [segmentIndex, segment] of cycleSegments.entries()) {
    const amount = segmentIndex < index ? 1 : segmentIndex === index ? progress : 0;
    segment.style.strokeDashoffset = String(1 - amount);
  }
  const angle = -90 + cyclePosition * (360 / cycleOrder.length);
  const radians = angle * Math.PI / 180;
  const x = 300 + 210 * Math.cos(radians);
  const y = 300 + 210 * Math.sin(radians);
  document.getElementById('cycle-arrow').setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(angle + 90).toFixed(2)})`);
  document.getElementById('cycle-active-label').textContent = cycleLabels[index];
  document.getElementById('cycle-core').hidden = Boolean(inspected);
  document.getElementById('cycle-detail').hidden = !inspected;
  if (inspected) {
    const [title, description] = cycleSteps[inspected];
    document.getElementById('cycle-detail-title').textContent = title;
    document.getElementById('cycle-detail-description').textContent = description;
  }
  const paused = manuallyPaused || Boolean(hoveredStep || focusedStep) || cycleMotion.matches;
  processSurface.dataset.cyclePaused = String(paused);
  processSurface.dataset.scVerifyState = processMode === 'continuous' ? `continuous:${cycleOrder[index]}:${Math.round(progress * 10)}:${inspected || 'playing'}` : 'legacy';

}

function shouldPlayCycle() {
  return processVisible && processMode === 'continuous' && !document.hidden && !cycleMotion.matches && !manuallyPaused && !hoveredStep && !focusedStep;
}
function updateCyclePlayback() {
  if (!shouldPlayCycle()) {
    if (cycleFrame !== null) window.cancelAnimationFrame(cycleFrame);
    cycleFrame = null;
    cycleLastTime = null;
  } else if (cycleFrame === null) {
    cycleLastTime = window.performance.now();
    cycleFrame = window.requestAnimationFrame(advanceCycle);
  }
  renderCycle();
}
function advanceCycle(timestamp) {
  cycleFrame = null;
  if (!shouldPlayCycle()) { cycleLastTime = null; return; }
  if (cycleLastTime !== null) cyclePosition = (cyclePosition + (timestamp - cycleLastTime) / 2200) % cycleOrder.length;
  cycleLastTime = timestamp;
  renderCycle();
  cycleFrame = window.requestAnimationFrame(advanceCycle);
}

function showProcess(mode) {
  if (processMode === mode) return;
  processMode = mode;
  const continuous = mode === 'continuous';
  if (!continuous) { hoveredStep = null; focusedStep = null; }
  processSection.dataset.mode = mode;
  processSurface.dataset.mode = mode;
  for (const [id, inactive] of [['legacy-process', continuous], ['continuous-process', !continuous]]) {
    const scene = document.getElementById(id);
    scene.inert = inactive;
    scene.setAttribute('aria-hidden', String(inactive));
  }
  document.querySelector('.process-turn-toggle').setAttribute('aria-label', continuous ? 'Com Landing Optimizer: ciclo de melhoria ativado pela rolagem.' : 'Processo atual: fila de repasses.');
  document.getElementById('process-heading').textContent = continuous ? 'Um ciclo de evolução. Com você no controle.' : 'Mais repasses. A mesma dúvida.';
  document.getElementById('process-explanation').textContent = continuous ? 'A observação vira proposta. Você aprova, o teste compara e o aprendizado orienta o próximo passo.' : 'Relatório, reunião, briefing, implementação. A decisão passa por várias mãos enquanto a página continua recebendo visitas.';
  document.getElementById('process-summary').textContent = continuous ? 'Menos repasses. Mais mudanças que você testa e autoriza.' : 'Os dados chegam. A mudança fica para depois.';
  document.getElementById('process-outcome-label').textContent = continuous ? 'A página evolui com cada aprendizado.' : 'A página espera.';
}
function updateProcessOnScroll() {
  processScrollFrame = null;
  const rect = processTrack.getBoundingClientRect();
  const progress = cycleMotion.matches ? 1 : Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight)));
  const turn = Math.max(0, Math.min(1, (progress - .25) / .4));
  processSection.style.setProperty('--process-turn', String(turn));
  processVisible = rect.top < window.innerHeight && rect.bottom > 0;
  showProcess(turn >= .5 ? 'continuous' : 'legacy');
  updateCyclePlayback();
}
function queueProcessUpdate() {
  if (processScrollFrame === null) processScrollFrame = window.requestAnimationFrame(updateProcessOnScroll);
}
window.addEventListener('scroll', queueProcessUpdate, { passive: true });
window.addEventListener('resize', queueProcessUpdate);
cycleMotion.addEventListener('change', () => {
  if (cycleMotion.matches) { cyclePosition = 2; selectedStep = null; }
  queueProcessUpdate();
});
document.addEventListener('visibilitychange', updateCyclePlayback);

function selectCycleStep(step) {
  const resume = selectedStep === step;
  selectedStep = resume ? null : step;
  manuallyPaused = !resume;
  if (resume) { hoveredStep = null; focusedStep = null; }
  else cyclePosition = cycleOrder.indexOf(step);
  updateCyclePlayback();
}
for (const node of cycleNodes) {
  const step = node.dataset.cycleStep;
  node.addEventListener('pointerenter', () => { hoveredStep = step; updateCyclePlayback(); });
  node.addEventListener('pointerleave', () => { hoveredStep = null; updateCyclePlayback(); });
  node.addEventListener('focus', () => { focusedStep = step; updateCyclePlayback(); });
  node.addEventListener('blur', () => { focusedStep = null; updateCyclePlayback(); });
  node.addEventListener('click', () => selectCycleStep(step));
  node.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    hoveredStep = null; focusedStep = null; selectedStep = null; manuallyPaused = false;
    updateCyclePlayback();
  });
}
updateProcessOnScroll();

for (const photo of document.querySelectorAll('.editorial-photo')) {
  const fallback = () => { photo.hidden = true; document.documentElement.classList.add('photo-unavailable'); };
  photo.addEventListener('error', fallback);
  if (photo.complete && photo.naturalWidth === 0) fallback();
  window.setTimeout(() => { if (!photo.naturalWidth) fallback(); }, 4000);
}
