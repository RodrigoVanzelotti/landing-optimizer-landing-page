'use strict';

// Load typography after the local controls; an unavailable font must not block them.
const cabinetStyles = document.createElement('link');
cabinetStyles.rel = 'stylesheet';
cabinetStyles.href = 'https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,600,700,800&display=swap';
document.head.append(cabinetStyles);

const cycleSteps = {
  observe: ['Entender antes de mudar.', 'O comportamento dos visitantes e o objetivo escolhido orientam onde investigar.'],
  propose: ['Dados viram uma hipótese para testar.', 'A IA sugere mudanças de mensagem e apresentação ligadas ao objetivo da página.'],
  approve: ['A prévia chega antes do teste.', 'Você revisa a proposta e autoriza o experimento. Sem o seu sim, ele não começa.'],
  test: ['Comparar, em vez de apenas trocar.', 'As versões são comparadas com uma página de referência e um objetivo definido.'],
  decide: ['O resultado informa. Você decide.', 'Você avalia os dados e escolhe quais mudanças merecem continuar na página. Não há vencedor publicado automaticamente.'],
  repeat: ['O próximo aprendizado vira o próximo teste.', 'A observação continua. Novas hipóteses voltam para revisão e precisam de uma nova aprovação.'],
};
const processSurface = document.querySelector('.decision-surface');
function selectCycleStep(step) {
  for (const button of document.querySelectorAll('[data-cycle-step]')) button.setAttribute('aria-pressed', String(button.dataset.cycleStep === step));
  const [title, description] = cycleSteps[step];
  document.getElementById('cycle-detail-title').textContent = title;
  document.getElementById('cycle-detail-description').textContent = description;
  processSurface.dataset.scVerifyState = processSurface.dataset.mode === 'continuous' ? `continuous:${step}` : 'legacy';
}
function showProcess(mode) {
  const continuous = mode === 'continuous';
  for (const button of document.querySelectorAll('[data-process-mode]')) button.setAttribute('aria-pressed', String(button.dataset.processMode === mode));
  document.getElementById('legacy-process').hidden = continuous;
  document.getElementById('continuous-process').hidden = !continuous;
  document.getElementById('break-cycle').hidden = continuous;
  document.getElementById('process-summary').textContent = continuous ? 'Menos repasses. Um ciclo que transforma observação em mudanças que você autoriza.' : 'Os dados chegam. A mudança fica para depois.';
  processSurface.dataset.mode = mode;
  processSurface.dataset.scVerifyState = continuous ? `continuous:${document.querySelector('[data-cycle-step][aria-pressed="true"]').dataset.cycleStep}` : 'legacy';
  if (!window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const surface = document.getElementById(continuous ? 'continuous-process' : 'legacy-process');
    surface.animate([{ opacity: .5, transform: 'translateY(12px)', clipPath: 'inset(0 0 4% 0)' }, { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0 0 0% 0)' }], { duration: 550, easing: 'cubic-bezier(.23,1,.32,1)' });
  }
  document.dispatchEvent(new CustomEvent('optimizer:process', { detail: { mode } }));
}
for (const button of document.querySelectorAll('[data-process-mode]')) button.addEventListener('click', () => showProcess(button.dataset.processMode));
document.getElementById('break-cycle').addEventListener('click', () => {
  showProcess('continuous');
  document.querySelector('[data-cycle-step="observe"]').focus({ preventScroll: true });
});
for (const button of document.querySelectorAll('[data-cycle-step]')) button.addEventListener('click', () => selectCycleStep(button.dataset.cycleStep));

document.addEventListener('optimizer:demo', event => {
  const { approved, day, complete } = event.detail;
  const step = complete ? 'decide' : approved ? 'test' : 'approve';
  selectCycleStep(step);
  document.getElementById('cycle-demo-state').textContent = complete ? 'Exemplo concluído. Você avalia e escolhe o próximo experimento.' : approved ? `Seu exemplo está no dia ${day} de 14. O teste começou com sua aprovação.` : 'Nova hipótese preparada. Aguardando a sua aprovação.';
});

const methodPanels = [...document.querySelectorAll('.method-panel')];
function expandMethod(selected) {
  for (const panel of methodPanels) {
    const open = panel === selected;
    const trigger = panel.querySelector('.method-trigger');
    trigger.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    document.getElementById(trigger.getAttribute('aria-controls')).hidden = !open;
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const content = document.getElementById(selected.querySelector('.method-trigger').getAttribute('aria-controls'));
    content.animate([{ opacity: .45, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'cubic-bezier(.23,1,.32,1)' });
  }
}
for (const [index, panel] of methodPanels.entries()) {
  const trigger = panel.querySelector('.method-trigger');
  trigger.addEventListener('click', () => expandMethod(panel));
  panel.addEventListener('pointerenter', () => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) expandMethod(panel);
  });
  trigger.addEventListener('keydown', event => {
    const target = { ArrowRight: (index + 1) % methodPanels.length, ArrowLeft: (index + methodPanels.length - 1) % methodPanels.length, Home: 0, End: methodPanels.length - 1 }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    expandMethod(methodPanels[target]);
    methodPanels[target].querySelector('.method-trigger').focus();
  });
}

const pauseMethod = document.getElementById('pause-method');
let manuallyPaused = false;
pauseMethod.addEventListener('click', () => {
  manuallyPaused = !manuallyPaused;
  pauseMethod.setAttribute('aria-pressed', String(manuallyPaused));
  pauseMethod.textContent = manuallyPaused ? 'Retomar movimento' : 'Pausar movimento';
  document.querySelector('.method-strip').dataset.paused = String(manuallyPaused || document.hidden);
});
document.addEventListener('visibilitychange', () => {
  document.querySelector('.method-strip').dataset.paused = String(manuallyPaused || document.hidden);
});
for (const photo of document.querySelectorAll('.editorial-photo')) {
  const fallback = () => { photo.hidden = true; document.documentElement.classList.add('photo-unavailable'); };
  photo.addEventListener('error', fallback);
  if (photo.complete && photo.naturalWidth === 0) fallback();
  window.setTimeout(() => { if (!photo.naturalWidth) fallback(); }, 4000);
}
