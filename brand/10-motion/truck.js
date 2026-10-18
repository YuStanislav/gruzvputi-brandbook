/* Adapted truck: vinodjangid07, MIT; see LICENSE.uiverse.txt. */
(() => {
  'use strict';
  const page = document.body;
  const query = new URLSearchParams(window.location.search);
  const embedded = query.get('embed') === '1';
  const cards = [...document.querySelectorAll('.gvp-truck')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setTheme = (card, theme) => {
    if (theme !== 'light' && theme !== 'dark') return;
    card.dataset.theme = theme;
    if (embedded) page.dataset.theme = theme;
    card.setAttribute('aria-label', `Фирменный грузовик — ${theme === 'dark' ? 'тёмная' : 'светлая'} тема`);
    const mascot = card.querySelector('[data-mascot]');
    if (mascot) mascot.setAttribute('href', `../01-mascot/${theme}/mascot-640.png`);
    const label = card.querySelector('.gvp-truck__variant');
    if (label) label.textContent = theme === 'dark' ? 'Тёмная тема' : 'Светлая тема';
  };

  const updateButton = (card) => {
    const button = card.querySelector('.gvp-truck__pause');
    if (!button) return;
    const paused = card.dataset.paused === 'true';
    button.disabled = reducedMotion.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.querySelector('span').textContent = reducedMotion.matches
      ? 'Без движения' : paused ? 'Продолжить' : 'Пауза';
    button.setAttribute('aria-label', reducedMotion.matches
      ? 'Анимация выключена по настройкам устройства'
      : paused ? 'Продолжить анимацию грузовика' : 'Приостановить анимацию грузовика');
  };

  if (embedded) {
    page.dataset.embed = 'true';
    cards.slice(1).forEach(card => card.remove());
    setTheme(cards[0], query.get('theme') === 'dark' ? 'dark' : 'light');
    window.addEventListener('message', event => {
      if (event.source !== window.parent || !event.data || event.data.type !== 'gvp-theme') return;
      setTheme(cards[0], event.data.theme);
    });
  }

  cards.filter(card => card.isConnected).forEach(card => {
    const button = card.querySelector('.gvp-truck__pause');
    button.addEventListener('click', () => {
      card.dataset.paused = String(card.dataset.paused !== 'true');
      updateButton(card);
    });
    updateButton(card);
  });
  reducedMotion.addEventListener('change', () => {
    cards.filter(card => card.isConnected).forEach(updateButton);
  });
})();
