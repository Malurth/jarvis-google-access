(() => {
  'use strict';

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const observer = new IntersectionObserver((entries, activeObserver) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        activeObserver.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px 40px 0px' });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }

  const button = document.getElementById('diagnostic-button');
  const output = document.getElementById('diagnostic-output');
  if (!button || !output) return;

  let running = false;
  const lines = [
    '> Checking inbox ambition... nominal.',
    '> Checking calendar drama... minimal.',
    '> Checking permissions... read-only.',
    '> Checking actual Google connection... not attempted.',
    '> Conclusion: one very fancy explanation page.'
  ];

  button.addEventListener('click', async () => {
    if (running) return;
    running = true;
    button.disabled = true;
    output.textContent = '';

    if (prefersReducedMotion) {
      output.textContent = lines.join('\n');
    } else {
      for (const line of lines) {
        output.textContent += (output.textContent ? '\n' : '') + line;
        await new Promise(resolve => window.setTimeout(resolve, 350));
      }
    }

    button.disabled = false;
    running = false;
  });
})();
