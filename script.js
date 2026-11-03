'use strict';

const form = document.getElementById('contact-form');
const websiteInput = document.getElementById('website');
const submitButton = document.getElementById('submit-button');
submitButton.disabled = false;
const status = document.getElementById('form-status');
websiteInput.addEventListener('input', () => websiteInput.setCustomValidity(''));
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;
  const data = Object.fromEntries(new FormData(form));
  for (const key of ['email', 'website']) data[key] = data[key].trim();
  try {
    const url = new URL(/^https?:\/\//i.test(data.website) ? data.website : `https://${data.website}`);
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error();
    data.website = url.href;
  } catch {
    websiteInput.setCustomValidity('Informe um site válido, como suaempresa.com.br.');
    websiteInput.reportValidity();
    return;
  }
  submitButton.disabled = true;
  form.setAttribute('aria-busy', 'true');
  status.dataset.error = 'false';
  status.textContent = 'Enviando seu pedido…';
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      if (response.status === 429) throw new Error('Muitos pedidos em pouco tempo. Aguarde um minuto e tente novamente.');
      if (response.status === 400) throw new Error('Confira o e-mail e o site e tente novamente.');
      throw new Error('Não foi possível confirmar o envio. Tente novamente em instantes.');
    }
    const result = await response.json();
    if (result.ok !== true) throw new Error('Não foi possível confirmar o envio. Tente novamente.');
    status.textContent = 'Pedido recebido! Vamos entrar em contato pelo e-mail informado para combinar o melhor horário. A conversa ainda não está agendada.';
    form.reset();
  } catch (error) {
    status.dataset.error = 'true';
    status.textContent = error.name === 'TimeoutError' || error.name === 'TypeError'
      ? 'Não foi possível confirmar o envio. Verifique sua conexão e tente novamente.'
      : error.message;
  } finally {
    submitButton.disabled = false;
    form.removeAttribute('aria-busy');
  }
});
document.getElementById('year').textContent = String(new Date().getFullYear());

for (const item of document.querySelectorAll('.faq-list details')) {
  item.addEventListener('toggle', () => {
    for (const animation of item.getAnimations()) animation.cancel();
    if (!item.open || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    item.animate([
      { height: `${item.querySelector('summary').offsetHeight}px` },
      { height: `${item.offsetHeight}px` },
    ], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' });
  });
}


const scrollHint = document.getElementById('scroll-hint');
if (scrollHint) {
  const desktop = window.matchMedia('(min-width: 901px)');
  const stories = [...document.querySelectorAll('[data-scroll-story]')];
  let hintTimer = null;
  let activeStory = null;

  function resetScrollHint() {
    window.clearTimeout(hintTimer);
    scrollHint.hidden = true;
    if (!desktop.matches || document.hidden) return;
    activeStory = stories.find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom > window.innerHeight + 24;
    });
    if (activeStory) hintTimer = window.setTimeout(() => { scrollHint.hidden = false; }, 10000);
  }

  scrollHint.addEventListener('click', () => {
    const next = activeStory?.closest('section')?.nextElementSibling;
    if (!next) return;
    window.clearTimeout(hintTimer);
    scrollHint.hidden = true;
    next.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    next.setAttribute('tabindex', '-1');
    next.focus({ preventScroll: true });
  });

  window.addEventListener('scroll', resetScrollHint, { passive: true });
  window.addEventListener('resize', resetScrollHint);
  document.addEventListener('visibilitychange', resetScrollHint);
  desktop.addEventListener('change', resetScrollHint);
  resetScrollHint();
}

const menuToggle = document.getElementById('menu-toggle');
if (menuToggle) {
  const header = document.getElementById('site-header');
  const navigation = document.getElementById('site-navigation');
  const mobileMenu = window.matchMedia('(max-width: 900px)');
  menuToggle.hidden = false;
  header.dataset.menuReady = 'true';
  function setMenuOpen(open) {
    header.dataset.menuOpen = String(open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  menuToggle.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', () => setMenuOpen(false));
  header.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || menuToggle.getAttribute('aria-expanded') !== 'true') return;
    setMenuOpen(false);
    menuToggle.focus();
  });
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target)) setMenuOpen(false);
  });
  mobileMenu.addEventListener('change', () => setMenuOpen(false));
  setMenuOpen(false);
}
