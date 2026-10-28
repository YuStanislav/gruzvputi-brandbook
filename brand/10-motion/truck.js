/* Adapted truck: vinodjangid07, MIT; see LICENSE.uiverse.txt. */
(() => {
  'use strict';
  const page = document.body;
  const query = new URLSearchParams(window.location.search);
  const embedded = query.get('embed') === '1';
  const cards = [...document.querySelectorAll('.gvp-truck')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = window.GVP_CITY_SCENES;
  const picker = document.querySelector('[data-gvp-city]');
  const palettePicker = document.querySelector('[data-gvp-palette]');
  const palettes = Object.freeze({ brand: 'Фирменная', ocean: 'Океан', forest: 'Тайга', sunset: 'Закат', graphite: 'Графит' });
  let currentCity = 'moskva';
  let currentPalette = 'brand';

  const syncShell = () => {
    const firstCard = cards.find(card => card.isConnected);
    if (!firstCard) return;
    const colors = window.getComputedStyle(firstCard);
    ['bg', 'ink', 'muted', 'line', 'scene', 'primary', 'deep', 'focus', 'city-accent'].forEach(token => {
      page.style.setProperty(`--gvp-${token}`, colors.getPropertyValue(`--gvp-${token}`));
    });
  };

  const setPalette = palette => {
    if (typeof palette !== 'string' || !Object.prototype.hasOwnProperty.call(palettes, palette)) return false;
    currentPalette = palette;
    cards.filter(card => card.isConnected).forEach(card => { card.dataset.palette = palette; });
    page.dataset.palette = palette;
    if (palettePicker) palettePicker.value = palette;
    syncShell();
    try { window.localStorage.setItem('gvp-truck-palette', palette); } catch (_) { /* Storage optional. */ }
    return true;
  };

  const setCity = city => {
    if (typeof city !== 'string' || !Object.prototype.hasOwnProperty.call(scenes, city)) return false;
    const scene = scenes[city];
    currentCity = city;
    cards.filter(card => card.isConnected).forEach(card => {
      card.dataset.city = city;
      card.dataset.landscape = scene.landscape;
      // Only fixed, local SVG fragments from city-landmarks.js are inserted.
      card.querySelector('[data-city-landmark]').innerHTML = scene.svg;
      card.querySelector('[data-city-label]').textContent = scene.name;
      card.querySelector('[data-landmark-label]').textContent = scene.landmark;
      const pass = card.querySelector('.gvp-city-pass');
      pass.style.animation = 'none';
      pass.getBoundingClientRect();
      pass.style.removeProperty('animation');
    });
    if (picker) picker.value = city;
    try { window.localStorage.setItem('gvp-truck-city', city); } catch (_) { /* Offline / storage disabled. */ }
    return true;
  };

  const setTheme = (card, theme) => {
    if (theme !== 'light' && theme !== 'dark') return;
    card.dataset.theme = theme;
    if (embedded) page.dataset.theme = theme;
    card.setAttribute('aria-label', `Фирменный грузовик — ${theme === 'dark' ? 'тёмная' : 'светлая'} тема`);
    const mascot = card.querySelector('[data-mascot]');
    if (mascot) mascot.setAttribute('href', `../01-mascot/${theme}/mascot-640.png`);
    const label = card.querySelector('.gvp-truck__variant');
    if (label) label.textContent = theme === 'dark' ? 'Тёмная тема' : 'Светлая тема';
    if (embedded) syncShell();
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
  }

  let savedCity, savedPalette;
  try {
    savedCity = window.localStorage.getItem('gvp-truck-city');
    savedPalette = window.localStorage.getItem('gvp-truck-palette');
  } catch (_) { /* Storage optional. */ }
  if (!setCity(query.get('city')) && !setCity(savedCity)) setCity('moskva');
  if (!setPalette(query.get('palette')) && !setPalette(savedPalette)) setPalette('brand');
  if (picker) picker.addEventListener('change', () => setCity(picker.value));
  if (palettePicker) palettePicker.addEventListener('change', () => {
    setPalette(palettePicker.value);
    if (embedded && window.parent !== window) window.parent.postMessage(
      { type: 'gvp-palette-change', palette: currentPalette }, location.protocol === 'file:' ? '*' : location.origin);
  });
  window.GVPTruck = Object.freeze({ setCity, getCity: () => currentCity, setPalette, getPalette: () => currentPalette });
  window.addEventListener('message', event => {
    if (event.source !== window.parent || !event.data) return;
    if (event.data.type === 'gvp-city') setCity(event.data.city);
    if (event.data.type === 'gvp-palette') setPalette(event.data.palette);
    if (embedded && event.data.type === 'gvp-theme') setTheme(cards[0], event.data.theme);
  });

  cards.filter(card => card.isConnected).forEach(card => {
    const button = card.querySelector('.gvp-truck__pause');
    button.addEventListener('click', () => {
      card.dataset.paused = String(card.dataset.paused !== 'true');
      updateButton(card);
    });
    updateButton(card);
  });
  // Freeze offscreen scenes without changing the user's pause preference.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { entry.target.dataset.dormant = String(!entry.isIntersecting); });
    });
    cards.filter(card => card.isConnected).forEach(card => observer.observe(card));
  }
  reducedMotion.addEventListener('change', () => {
    cards.filter(card => card.isConnected).forEach(updateButton);
  });
})();
