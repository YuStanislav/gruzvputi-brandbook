(() => {
  const root = document.querySelector('.gvp-calc');
  if (!root || new URLSearchParams(location.search).get('embed') === '1') return;
  const steps = [...root.querySelectorAll('[data-calc-step]')];
  const status = root.querySelector('[data-calc-status]');
  const play = root.querySelector('[data-calc-play]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const messages = ['Две точки — начало пути', 'Маршрут соединён', 'Для этого груза — фургон', 'Средняя цена · пример'];
  let timer, step = 0, running = false, seen = false;
  const stop = () => { clearTimeout(timer); running = false; play.textContent = 'Смотреть сценарий'; };
  const show = value => {
    step = value;
    root.dataset.step = String(step);
    root.querySelector('.gvp-calc__price').setAttribute('aria-hidden', String(step !== 3));
    steps.forEach((button, index) => {
      if (index === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    status.textContent = messages[step];
  };
  const advance = () => {
    timer = setTimeout(() => {
      if (step === 3) { stop(); return; }
      show(step + 1);
      advance();
    }, step === 0 ? 1600 : 2400);
  };
  play.addEventListener('click', () => {
    if (running) { stop(); return; }
    show(0);
    running = true;
    play.textContent = 'Пауза';
    advance();
  });
  steps.forEach((button, index) => button.addEventListener('click', () => { stop(); show(index); }));
  root.querySelector('[data-calc-reset]').addEventListener('click', () => { stop(); show(0); });
  reduced.addEventListener('change', () => { stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !seen) {
          seen = true;
          if (!reduced.matches) { running = true; play.textContent = 'Пауза'; advance(); }
        } else if (!entry.isIntersecting) stop();
      });
    }, { threshold: .35 });
    observer.observe(root);
  }
  show(0);
})();
