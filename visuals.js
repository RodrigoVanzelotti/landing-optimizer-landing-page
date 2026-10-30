'use strict';

// All rates and timelines in these demonstrations are fictional, not forecasts.
const numberBR = value => value.toLocaleString('pt-BR');
const rateBR = value => `${value.toFixed(1).replace('.', ',')}%`;
const moneyBR = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const monthlyRevenue = 500000;
function calculateRevenueScenario(revenue, referenceRate, candidateRate) {
  const projected = Math.round(revenue * candidateRate / referenceRate);
  return { projected, difference: projected - revenue, lift: (candidateRate / referenceRate - 1) * 100 };
}


const signals = {
  attention: ['O botão atrai atenção.', 'Uma mensagem mais específica pode ser uma boa hipótese para testar.'],
  friction: ['Tem clique. Mas tem dificuldade?', 'Interações repetidas podem indicar uma dúvida ou um elemento que não responde como esperado.'],
  scroll: ['Sua oferta foi vista por inteiro?', 'Se informações importantes ficam abaixo desse ponto, vale investigar sua posição na página.'],
};
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const signalSection = document.getElementById('descobrir');
const signalMobile = window.matchMedia('(max-width: 900px)');
let signalFrame = null;
function renderSignal(key, progress = 0) {
  const canvas = document.querySelector('.signal-canvas');
  canvas.style.setProperty('--signal-progress', String(progress));
  for (const step of document.querySelectorAll('[data-signal]')) {
    const active = step.dataset.signal === key;
    step.dataset.active = String(active);
    if (active) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  }
  for (const button of document.querySelectorAll('[data-signal-control]')) {
    button.setAttribute('aria-pressed', String(button.dataset.signalControl === key));
  }
  canvas.dataset.activeSignal = key;
  const [title, description] = signals[key];
  document.getElementById('signal-title').textContent = title;
  document.getElementById('signal-description').textContent = description;
}
function updateSignalsOnScroll() {
  signalFrame = null;
  if (signalMobile.matches) return;
  const rect = signalSection.getBoundingClientRect();
  const progress = motionPreference.matches ? 1 : Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight)));
  const index = Math.min(2, Math.floor(progress * 3));
  renderSignal(['attention', 'friction', 'scroll'][index], Math.min(1, progress * 3 - index));
}
for (const button of document.querySelectorAll('[data-signal-control]')) {
  button.addEventListener('click', () => { if (signalMobile.matches) renderSignal(button.dataset.signalControl); });
}
signalMobile.addEventListener('change', () => { if (signalMobile.matches) renderSignal('attention'); else queueSignalUpdate(); });
function queueSignalUpdate() {
  if (signalFrame === null) signalFrame = window.requestAnimationFrame(updateSignalsOnScroll);
}
window.addEventListener('scroll', () => { if (!signalMobile.matches) queueSignalUpdate(); }, { passive: true });
window.addEventListener('resize', queueSignalUpdate);
motionPreference.addEventListener('change', queueSignalUpdate);
renderSignal('attention');
updateSignalsOnScroll();

const approveDemo = document.getElementById('approve-demo');
const resetDemo = document.getElementById('reset-demo');
const demoExample = { controlRate: 2, variantRate: 2.6 };
let demoDay = 0;
let demoTimer = null;
let demoApproved = false;
let demoLastTime = null;

function demoRatesAt(day) {
  const progress = day / 14;
  const envelope = Math.sin(Math.PI * progress);
  const control = demoExample.controlRate + (Math.sin(day * .85) * .16 + Math.sin(day * 2.1) * .045) * envelope;
  const gain = (demoExample.variantRate - demoExample.controlRate) * (progress + .035 * Math.sin(day * .8) * envelope);
  return { control, variant: control + gain };
}

const storyTrack = document.getElementById('experiment-story-track');
const storyRoot = document.getElementById('mobile-experiment-story');
const storySlides = ['problem', 'hypothesis', 'approval', 'results'].map(key => document.getElementById(`experiment-story-${key}`));
const storyLabels = ['O problema', 'A hipótese', 'Sua aprovação', 'O resultado'];
let storyPage = 0;
function resizeExperimentStory() {
  if (signalMobile.matches) storyTrack.style.height = `${storySlides[storyPage].offsetHeight}px`;
}
function renderStoryNavigation() {
  const count = demoApproved ? 4 : 3;
  storyPage = Math.max(0, Math.min(count - 1, storyPage));
  storyRoot.dataset.page = String(storyPage);
  const position = document.getElementById('experiment-story-position');
  const label = `${storyPage + 1} de ${storySlides.length} · ${storyLabels[storyPage]}`;
  if (position.textContent !== label) position.textContent = label;
  document.getElementById('experiment-story-back').disabled = storyPage === 0;
  const next = document.getElementById('experiment-story-next');
  next.disabled = storyPage === count - 1;
  next.textContent = storyPage === 1 ? 'Revisar →' : 'Próximo →';
  for (const [index, slide] of storySlides.entries()) {
    slide.inert = signalMobile.matches && index !== storyPage;
    slide.setAttribute('aria-hidden', String(signalMobile.matches && index !== storyPage));
  }
  resizeExperimentStory();
}
function goToStoryPage(index) {
  storyPage = Math.max(0, Math.min(demoApproved ? 3 : 2, index));
  renderStoryNavigation();
  storyTrack.scrollTo({ left: storyPage * storyTrack.clientWidth, behavior: motionPreference.matches ? 'instant' : 'smooth' });
}
function configureExperimentStory() {
  const analysis = document.getElementById('experiment-analysis');
  const outcome = document.getElementById('demo-outcome');
  const question = document.getElementById('next-experiments');
  if (signalMobile.matches) storySlides[3].append(analysis, outcome, question);
  else {
    document.getElementById('experiment-stage').append(analysis);
    document.getElementById('experiment-workspace').append(outcome, question);
  }
  renderStoryNavigation();
}
storyTrack.addEventListener('scroll', () => {
  if (!signalMobile.matches || !storyTrack.clientWidth) return;
  storyPage = Math.round(storyTrack.scrollLeft / storyTrack.clientWidth);
  renderStoryNavigation();
}, { passive: true });
storyTrack.addEventListener('keydown', event => {
  if (!signalMobile.matches || event.target !== storyTrack || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  goToStoryPage(storyPage + (event.key === 'ArrowRight' ? 1 : -1));
});
document.getElementById('experiment-story-back').addEventListener('click', () => goToStoryPage(storyPage - 1));
document.getElementById('experiment-story-next').addEventListener('click', () => goToStoryPage(storyPage + 1));
document.getElementById('story-approve-demo').addEventListener('click', () => {
  if (demoApproved) goToStoryPage(3);
  else approveDemo.click();
});
document.getElementById('story-pause-demo').addEventListener('click', () => approveDemo.click());
document.getElementById('story-reset-demo').addEventListener('click', () => resetDemo.click());
signalMobile.addEventListener('change', configureExperimentStory);
window.addEventListener('resize', () => {
  if (!signalMobile.matches) return;
  storyTrack.scrollTo({ left: storyPage * storyTrack.clientWidth, behavior: 'instant' });
  resizeExperimentStory();
});
if (window.ResizeObserver) {
  const storyObserver = new window.ResizeObserver(resizeExperimentStory);
  for (const slide of storySlides) storyObserver.observe(slide);
}
configureExperimentStory();

function renderExperiment() {
  const started = demoApproved;
  const complete = demoDay === 14;
  const running = demoTimer !== null;
  storySlides[3].hidden = !started;
  storyRoot.dataset.complete = String(complete);
  document.getElementById('story-approve-demo').textContent = started ? 'Ver o resultado →' : 'Aprovar demonstração ✓';
  const pause = document.getElementById('story-pause-demo');
  pause.textContent = running ? 'Pausar demonstração' : 'Continuar demonstração';
  pause.hidden = complete;
  renderStoryNavigation();
  document.getElementById('experiment-stage').dataset.phase = started ? 'results' : 'review';
  document.getElementById('demo-reference').hidden = started;
  const state = document.getElementById('experiment-status');
  const stateText = complete ? 'Simulação concluída' : running ? 'Simulação em andamento' : started ? 'Simulação pausada' : 'Aguardando sua aprovação';
  if (state.textContent !== stateText) state.textContent = stateText;
  state.dataset.state = running ? 'running' : 'idle';
  approveDemo.textContent = complete ? 'Exemplo concluído ✓' : running ? 'Pausar demonstração Ⅱ' : started ? 'Continuar demonstração ↗' : 'Aprovar demonstração ✓';
  approveDemo.disabled = complete;
  approveDemo.setAttribute('aria-expanded', String(started));
  resetDemo.hidden = !started;
  const progressLabel = document.getElementById('progress-label');
  const progressMessage = complete ? 'Exemplo concluído. Em um teste real, é preciso avaliar os dados.' : running ? 'Comparando versões com dados fictícios…' : started ? 'Pausado. O ritmo está nas suas mãos.' : 'Você decide quando começar.';
  if (progressLabel.textContent !== progressMessage) progressLabel.textContent = progressMessage;
  const wholeDay = Math.floor(demoDay);
  const countText = `${wholeDay} de 14 dias simulados`;
  if (document.getElementById('progress-count').textContent !== countText) document.getElementById('progress-count').textContent = countText;
  document.getElementById('progress-fill').style.transform = `scaleX(${demoDay / 14})`;
  const { control: controlRate, variant: variantRate } = demoRatesAt(demoDay);
  document.getElementById('original-result').textContent = started ? rateBR(controlRate) : '—';
  document.getElementById('variant-result').textContent = started ? rateBR(variantRate) : '—';
  document.getElementById('result-original').style.transform = `scaleX(${started ? controlRate / 4 : 0})`;
  document.getElementById('result-variant').style.transform = `scaleX(${started ? variantRate / 4 : 0})`;
  document.getElementById('experiment-analysis').hidden = !started;
  const revenue = calculateRevenueScenario(monthlyRevenue, controlRate, variantRate);
  document.getElementById('demo-revenue-gain').textContent = `${revenue.difference > 0 ? '+' : ''}${moneyBR(revenue.difference)}/mês`;
  document.getElementById('demo-revenue-comparison').textContent = `${moneyBR(monthlyRevenue)} → ${moneyBR(revenue.projected)} por mês.`;
  const lift = Math.round(revenue.lift);
  document.getElementById('demo-relative-lift').textContent = `${lift > 0 ? '+' : ''}${lift}% vs. referência`;
  document.getElementById('demo-relative-lift').dataset.direction = lift < 0 ? 'negative' : 'positive';
  const sampledDays = Array.from({ length: Math.floor(demoDay * 4) + 1 }, (_, index) => index / 4);
  if (sampledDays.at(-1) < demoDay) sampledDays.push(demoDay);
  const pathFor = key => sampledDays.map((day, index) => `${index === 0 ? 'M' : 'L'}${(day / 14 * 600).toFixed(2)} ${(190 - demoRatesAt(day)[key] * 45).toFixed(2)}`).join(' ');
  document.getElementById('demo-control-line').setAttribute('d', pathFor('control'));
  document.getElementById('demo-variant-line').setAttribute('d', pathFor('variant'));
  document.getElementById('demo-chart-point').setAttribute('cx', (demoDay / 14 * 600).toFixed(2));
  document.getElementById('demo-chart-point').setAttribute('cy', (190 - variantRate * 45).toFixed(2));
  document.getElementById('demo-control-point').setAttribute('cx', (demoDay / 14 * 600).toFixed(2));
  document.getElementById('demo-control-point').setAttribute('cy', (190 - controlRate * 45).toFixed(2));
  document.getElementById('timeline-description').textContent = `Dia ${wholeDay} de 14. Referência: ${rateBR(controlRate)}. Alternativa: ${rateBR(variantRate)}. Diferença relativa: ${lift}%. Dados fictícios.`;
  document.getElementById('demo-outcome').hidden = !complete;
  document.getElementById('next-experiments').hidden = !complete;
  if (complete) {
    const points = Number((variantRate - controlRate).toFixed(2));
    const pointDescription = points === 1 ? '1 ponto percentual' : `${numberBR(points)} pontos percentuais`;
    document.getElementById('demo-outcome-title').textContent = `De ${rateBR(controlRate)} para ${rateBR(variantRate)} nas vendas: ${lift}% a mais no faturamento.`;
    document.getElementById('demo-outcome-description').textContent = `A taxa sobe ${pointDescription}; o faturamento cresce ${lift}% neste cenário. Mesmo tráfego e ticket médio: ${moneyBR(monthlyRevenue)} → ${moneyBR(revenue.projected)} por mês.`;

  }

}

function stopDemo() {
  if (demoTimer !== null) window.cancelAnimationFrame(demoTimer);
  demoTimer = null;
  demoLastTime = null;
}
function cancelDemoTransition() {
  for (const id of ['demo-hypothesis', 'experiment-analysis']) {
    for (const animation of document.getElementById(id).getAnimations()) animation.cancel();
  }
}
function advanceDemo(timestamp) {
  if (demoLastTime !== null) demoDay = Math.min(14, demoDay + (timestamp - demoLastTime) / 500);
  demoLastTime = timestamp;
  if (demoDay === 14) stopDemo();
  else demoTimer = window.requestAnimationFrame(advanceDemo);
  renderExperiment();
}
approveDemo.addEventListener('click', () => {
  const firstApproval = !demoApproved;
  const hypothesis = document.getElementById('demo-hypothesis');
  const previousBounds = firstApproval ? hypothesis.getBoundingClientRect() : null;
  demoApproved = true;
  if (demoTimer !== null) {
    stopDemo();
  } else if (motionPreference.matches) {
    demoDay = 14;
  } else if (demoDay < 14) {
    demoLastTime = window.performance.now();
    demoTimer = window.requestAnimationFrame(advanceDemo);
  }
  renderExperiment();
  if (firstApproval && signalMobile.matches) {
    goToStoryPage(3);
  }
  if (firstApproval && !motionPreference.matches && !signalMobile.matches) {
    const bounds = hypothesis.getBoundingClientRect();
    const distance = previousBounds.left - bounds.left;
    const start = Math.abs(distance) > 1 ? `translateX(${distance}px)` : 'translateY(12px)';
    hypothesis.animate([{ transform: start }, { transform: 'translate(0,0)' }], { duration: 700, easing: 'cubic-bezier(.23,1,.32,1)' });
    document.getElementById('experiment-analysis').animate([{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 600, delay: 100, fill: 'backwards', easing: 'cubic-bezier(.23,1,.32,1)' });
  }
});
resetDemo.addEventListener('click', () => {
  cancelDemoTransition();
  stopDemo();
  demoDay = 0;
  demoApproved = false;
  renderExperiment();
  if (signalMobile.matches) { goToStoryPage(0); storyTrack.focus({ preventScroll: true }); }
  else approveDemo.focus();
});
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) cancelDemoTransition();
  if (motionPreference.matches && demoTimer !== null) {
    stopDemo();
    demoDay = 14;
    renderExperiment();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && demoTimer !== null) {
    stopDemo();
    renderExperiment();
  }
});

const conversionRange = document.getElementById('conversion-range');
function renderScenario() {
  const rate = Number(conversionRange.value);
  const result = calculateRevenueScenario(monthlyRevenue, 2, rate);
  document.getElementById('conversion-output').textContent = rateBR(rate);
  document.getElementById('baseline-revenue').textContent = moneyBR(monthlyRevenue);
  document.getElementById('scenario-revenue').textContent = moneyBR(result.projected);
  document.getElementById('revenue-rate-label').textContent = `Cenário com ${rateBR(rate)}`;
  document.getElementById('extra-revenue').textContent = `${result.difference > 0 ? '+' : ''}${moneyBR(result.difference)}`;
  document.getElementById('revenue-difference').dataset.direction = result.difference < 0 ? 'negative' : 'positive';
  document.getElementById('difference-caption').textContent = result.difference > 0 ? 'por mês que você poderia estar deixando na mesa.' : result.difference < 0 ? 'por mês a menos neste cenário. Por isso, testar importa.' : 'de diferença. Mesma conversão, mesmo faturamento.';
  document.getElementById('revenue-lift').textContent = `2% → ${rateBR(rate)} nas vendas = ${result.lift > 0 ? '+' : ''}${numberBR(Math.round(result.lift))}% no faturamento.`;
}
conversionRange.addEventListener('input', renderScenario);
renderScenario();

// Content is visible without JavaScript. IntersectionObserver adds a short entrance only.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: .12 });
  for (const element of document.querySelectorAll('.reveal')) observer.observe(element);
}
