'use strict';

// All rates and timelines in these demonstrations are fictional, not forecasts.
const scenarioExamples = {
  headline: { rate: 2.8, title: 'Menos dúvidas. Mais próximos passos.', cta: 'Encontre sua solução ↗' },
  cta: { rate: 2.5, title: 'Seu objetivo merece um próximo passo.', cta: 'Quero encontrar meu curso ↗' },
  offer: { rate: 2.3, title: 'Aprenda hoje. Avance na sua carreira.', cta: 'Conheça os caminhos ↗' },
};
const numberBR = value => value.toLocaleString('pt-BR');
const rateBR = value => `${value.toFixed(1).replace('.', ',')}%`;

for (const button of document.querySelectorAll('[data-scenario]')) {
  button.addEventListener('click', () => {
    const example = scenarioExamples[button.dataset.scenario];
    for (const item of document.querySelectorAll('[data-scenario]')) item.setAttribute('aria-pressed', String(item === button));
    document.getElementById('hero-rate').textContent = rateBR(example.rate);
    document.getElementById('hero-lift').textContent = `+${Math.round((example.rate / 2 - 1) * 100)}%`;
    document.getElementById('hero-preview-title').textContent = example.title;
    document.getElementById('hero-preview-cta').textContent = example.cta;
    const wave = [0, 4, -9, 7, -8, 5, -1, 7, -4, 8, 0];
    const points = wave.map((offset, index) => `${index * 60} ${150 - (index / 10) * (example.rate - 2) * 155 - offset}`);
    const path = `M${points.join('L')}`;
    document.getElementById('hero-line').setAttribute('d', path);
    document.getElementById('hero-area').setAttribute('d', `${path}V185H0Z`);
  });
}

const signals = {
  attention: ['O botão atrai atenção.', 'Uma mensagem mais específica pode ser uma boa hipótese para testar.'],
  friction: ['Tem clique. Mas tem dificuldade?', 'Interações repetidas podem indicar uma dúvida ou um elemento que não responde como esperado.'],
  scroll: ['Sua oferta foi vista por inteiro?', 'Se informações importantes ficam abaixo desse ponto, vale investigar sua posição na página.'],
};
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const signalSection = document.getElementById('descobrir');
let signalFrame = null;
function updateSignalsOnScroll() {
  signalFrame = null;
  const rect = signalSection.getBoundingClientRect();
  const progress = motionPreference.matches ? 1 : Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight)));
  const index = Math.min(2, Math.floor(progress * 3));
  const key = ['attention', 'friction', 'scroll'][index];
  const canvas = document.querySelector('.signal-canvas');
  canvas.style.setProperty('--signal-progress', String(Math.min(1, progress * 3 - index)));
  if (canvas.dataset.activeSignal === key) return;
  for (const step of document.querySelectorAll('[data-signal]')) {
    const active = step.dataset.signal === key;
    step.dataset.active = String(active);
    if (active) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  }
  canvas.dataset.activeSignal = key;
  const [title, description] = signals[key];
  document.getElementById('signal-title').textContent = title;
  document.getElementById('signal-description').textContent = description;
  document.getElementById('signal-mode-label').textContent = ['Atenção', 'Dificuldade', 'Profundidade de leitura'][index];
}
function queueSignalUpdate() {
  if (signalFrame === null) signalFrame = window.requestAnimationFrame(updateSignalsOnScroll);
}
window.addEventListener('scroll', queueSignalUpdate, { passive: true });
window.addEventListener('resize', queueSignalUpdate);
motionPreference.addEventListener('change', queueSignalUpdate);
updateSignalsOnScroll();

const approveDemo = document.getElementById('approve-demo');
const resetDemo = document.getElementById('reset-demo');
const demoExamples = {
  headline: { name: 'Teste de mensagem', controlRate: 2, variantRate: 3, controlTitle: 'Conheça nossos cursos.', variantTitle: 'Dê o próximo passo na sua carreira.', controlDescription: 'Conteúdo para o seu desenvolvimento.', variantDescription: 'Encontre o curso para o seu objetivo.', controlCta: 'Saiba mais', variantCta: 'Encontrar meu curso ↗' },
  cta: { name: 'Próximo exemplo: texto do botão', controlRate: 3, variantRate: 3.6, controlTitle: 'Dê o próximo passo na sua carreira.', variantTitle: 'Dê o próximo passo na sua carreira.', controlDescription: 'Encontre o curso para o seu objetivo.', variantDescription: 'Encontre o curso para o seu objetivo.', controlCta: 'Encontrar meu curso', variantCta: 'Ver cursos para minha carreira ↗' },
  benefit: { name: 'Próximo exemplo: benefício em destaque', controlRate: 3, variantRate: 3.3, controlTitle: 'Dê o próximo passo na sua carreira.', variantTitle: 'Aprenda no seu ritmo. Avance no seu tempo.', controlDescription: 'Encontre o curso para o seu objetivo.', variantDescription: 'Encontre o curso para o seu objetivo.', controlCta: 'Encontrar meu curso', variantCta: 'Encontrar meu curso ↗' },
};
let selectedDemo = demoExamples.headline;
let demoDay = 0;
let demoTimer = null;
let demoApproved = false;
let demoLastTime = null;
let lastDemoBroadcast = '';

function demoRatesAt(day) {
  const progress = day / 14;
  const envelope = Math.sin(Math.PI * progress);
  const control = selectedDemo.controlRate + (Math.sin(day * .85) * .16 + Math.sin(day * 2.1) * .045) * envelope;
  const gain = (selectedDemo.variantRate - selectedDemo.controlRate) * (progress + .035 * Math.sin(day * .8) * envelope);
  return { control, variant: control + gain };
}

function renderExperiment() {
  const started = demoApproved;
  const complete = demoDay === 14;
  const running = demoTimer !== null;
  const state = document.getElementById('experiment-status');
  state.textContent = complete ? 'Simulação concluída' : running ? 'Simulação em andamento' : started ? 'Simulação pausada' : 'Aguardando sua aprovação';
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
  document.getElementById('experiment-insight').textContent = complete ? `${rateBR(controlRate)} ou ${rateBR(variantRate)}? Compare o objetivo, não só os cliques.` : started ? 'A mesma oferta. Duas maneiras de apresentar.' : 'Uma comparação vale mais que uma suposição.';
  document.getElementById('experiment-analysis').hidden = !started;
  const lift = Math.round((variantRate / controlRate - 1) * 100);
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
    const difference = Math.round(5000 * variantRate / 100) - Math.round(5000 * controlRate / 100);
    const points = Number((variantRate - controlRate).toFixed(2));
    const pointDescription = points === 1 ? '1 ponto percentual' : `${numberBR(points)} pontos percentuais`;
    document.getElementById('demo-outcome-lift').textContent = `+${lift}%`;
    document.getElementById('demo-outcome-title').textContent = `De ${rateBR(controlRate)} para ${rateBR(variantRate)}: ${lift}% mais cadastros com o mesmo tráfego.`;
    document.getElementById('demo-outcome-description').textContent = `A taxa sobe ${pointDescription}; o resultado do objetivo cresce ${lift}%. Com 5 mil visitas por versão: ${Math.round(5000 * controlRate / 100)} → ${Math.round(5000 * variantRate / 100)} cadastros, ou +${difference}. Exemplo fictício; não é uma promessa de resultado.`;
  }
  const signature = `${started}:${wholeDay}:${complete}`;
  if (lastDemoBroadcast !== signature) {
    lastDemoBroadcast = signature;
    document.dispatchEvent(new CustomEvent('optimizer:demo', { detail: { approved: started, day: wholeDay, complete } }));
  }
}

function stopDemo() {
  if (demoTimer !== null) window.cancelAnimationFrame(demoTimer);
  demoTimer = null;
  demoLastTime = null;
}
function advanceDemo(timestamp) {
  if (demoLastTime !== null) demoDay = Math.min(14, demoDay + (timestamp - demoLastTime) / 500);
  demoLastTime = timestamp;
  if (demoDay === 14) stopDemo();
  else demoTimer = window.requestAnimationFrame(advanceDemo);
  renderExperiment();
}
approveDemo.addEventListener('click', () => {
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
});
resetDemo.addEventListener('click', () => {
  stopDemo();
  demoDay = 0;
  demoApproved = false;
  renderExperiment();
});
for (const button of document.querySelectorAll('[data-next-experiment]')) {
  button.addEventListener('click', () => {
    stopDemo();
    selectedDemo = demoExamples[button.dataset.nextExperiment];
    demoDay = 0;
    demoApproved = false;
    document.getElementById('experiment-name').textContent = selectedDemo.name;
    for (const version of ['control', 'variant']) {
      document.getElementById(`demo-${version}-title`).textContent = selectedDemo[`${version}Title`];
      document.getElementById(`demo-${version}-description`).textContent = selectedDemo[`${version}Description`];
      document.getElementById(`demo-${version}-cta`).textContent = selectedDemo[`${version}Cta`];
    }
    renderExperiment();
    approveDemo.focus();
  });
}
motionPreference.addEventListener('change', () => {
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

function calculateScenario(visits, rate) {
  const baseline = Math.round(visits * .02);
  const conversions = Math.round(visits * rate / 100);
  return { baseline, conversions, difference: conversions - baseline };
}
let selectedVisits = 20000;
const conversionRange = document.getElementById('conversion-range');
function renderScenario() {
  const rate = Number(conversionRange.value);
  const result = calculateScenario(selectedVisits, rate);
  document.getElementById('conversion-output').textContent = rateBR(rate);
  document.getElementById('baseline-conversions').textContent = numberBR(result.baseline);
  document.getElementById('scenario-conversions').textContent = numberBR(result.conversions);
  document.getElementById('extra-conversions').textContent = `${result.difference > 0 ? '+' : ''}${numberBR(result.difference)}`;
  document.getElementById('difference-caption').textContent = result.difference > 0 ? 'conversões a mais no cenário. Sem adicionar visitas.' : result.difference < 0 ? 'conversões a menos no cenário. Testar também revela perdas.' : 'A mesma quantidade de conversões no cenário de referência.';
}
for (const button of document.querySelectorAll('[data-visits]')) {
  button.addEventListener('click', () => {
    selectedVisits = Number(button.dataset.visits);
    for (const item of document.querySelectorAll('[data-visits]')) item.setAttribute('aria-pressed', String(item === button));
    renderScenario();
  });
}
conversionRange.addEventListener('input', renderScenario);

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
