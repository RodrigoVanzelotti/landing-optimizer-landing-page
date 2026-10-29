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
  for (const key of ['name', 'email', 'website']) data[key] = data[key].trim();
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
      if (response.status === 400) throw new Error('Confira o nome, o e-mail e o site e tente novamente.');
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
