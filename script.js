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

  const lab = document.querySelector('.orbital-lab');
  if (lab) {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scene = lab.querySelector('.orbital-scene');
    const satellites = [...lab.querySelectorAll('.satellite')];
    const title = document.getElementById('orbital-title');
    const description = document.getElementById('orbital-description');
    const announcement = lab.querySelector('.orbital-announcement');
    const toggle = lab.querySelector('.motion-toggle');
    const reactor = lab.querySelector('.reactor');
    const tracks = [
      { rx: 238, ry: 145, tilt: -28, speed: .20, phase: -.6 },
      { rx: 222, ry: 127, tilt: 42, speed: -.16, phase: 3.4 },
      { rx: 190, ry: 119, tilt: 100, speed: .12, phase: .4 }
    ];
    const details = [
      ['01 / INBOX INTELLIGENCE', 'Reads mail. Finds what matters. Cannot send so much as a “per my last email.”'],
      ['02 / CALENDAR AWARENESS', 'Knows what’s next. Cannot move your meetings. Even the ones that could have been emails.'],
      ['03 / PERMISSION PERIMETER', 'Read-only, all the way down. A very elaborate system for keeping its hands to itself.']
    ];
    let paused = false, hovered = false, focused = false, visible = true;
    let elapsed = 0, previous = 0, frame = 0, pulseTimer;
    const particles = [];
    for (let i = 0; i < 36; i++) {
      const star = document.createElement('i');
      star.className = 'star';
      star.style.cssText = `left:${(i * 37 + 9) % 100}%;top:${(i * 61 + 3) % 100}%;--twinkle:${3 + i % 5}s;--delay:-${i % 7}s`;
      lab.querySelector('.star-field').append(star);
    }
    for (let i = 0; i < 24; i++) {
      const dot = document.createElement('i');
      dot.className = 'orbital-particle' + (i % 3 === 1 ? ' orange' : '');
      dot.style.opacity = String(.2 + (i % 8) / 12);
      lab.querySelector('.orbital-particles').append(dot);
      particles.push(dot);
    }
    function position(element, track, angle) {
      const tilt = track.tilt * Math.PI / 180;
      const x = Math.cos(angle) * track.rx, y = Math.sin(angle) * track.ry;
      element.style.left = `${50 + (x * Math.cos(tilt) - y * Math.sin(tilt)) / 6}%`;
      element.style.top = `${50 + (x * Math.sin(tilt) + y * Math.cos(tilt)) / 6}%`;
    }
    function draw() {
      satellites.forEach((satellite, i) => {
        const track = tracks[i];
        position(satellite, track, track.phase + elapsed * track.speed);
      });
      particles.forEach((dot, i) => {
        const track = tracks[i % 3];
        position(dot, track, track.phase + elapsed * track.speed + (Math.floor(i / 3) + 1) * .065);
      });
    }
    function tick(now) {
      elapsed += previous ? Math.min((now - previous) / 1000, .05) : 0;
      previous = now;
      draw();
      frame = requestAnimationFrame(tick);
    }
    function syncMotion() {
      const hold = hovered || focused;
      const stopped = paused || motionPreference.matches || !visible || document.hidden;
      lab.classList.toggle('is-paused', stopped);
      lab.classList.toggle('is-held', hold);
      toggle.textContent = motionPreference.matches ? 'Reduced motion ✓' : paused ? 'Resume motion ▶' : 'Pause motion Ⅱ';
      toggle.setAttribute('aria-pressed', String(paused || motionPreference.matches));
      toggle.disabled = motionPreference.matches;
      cancelAnimationFrame(frame);
      previous = 0;
      if (!stopped && !hold) frame = requestAnimationFrame(tick);
    }
    function inspect(i, speak = false) {
      title.textContent = details[i][0];
      description.textContent = details[i][1];
      satellites.forEach((satellite, index) => satellite.classList.toggle('is-selected', index === i));
      if (speak) announcement.textContent = details[i].join('. ');
    }
    satellites.forEach((satellite, i) => {
      satellite.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch') return;
        hovered = true; inspect(i); syncMotion();
      });
      satellite.addEventListener('pointerleave', () => { hovered = false; syncMotion(); });
      satellite.addEventListener('focus', () => { focused = true; inspect(i, true); syncMotion(); });
      satellite.addEventListener('blur', () => { focused = false; syncMotion(); });
      satellite.addEventListener('click', () => inspect(i, true));
    });
    toggle.addEventListener('click', () => { paused = !paused; syncMotion(); });
    lab.addEventListener('pointermove', event => {
      if (motionPreference.matches || paused || event.pointerType === 'touch') return;
      const bounds = lab.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      lab.style.setProperty('--pointer-x', `${x * 100}%`);
      lab.style.setProperty('--pointer-y', `${y * 100}%`);
      // Hold the scene steady while aiming at a control.
      if (!hovered && !focused) {
        scene.style.setProperty('--drift-x', `${(x - .5) * 12}px`);
        scene.style.setProperty('--drift-y', `${(y - .5) * 12}px`);
      }
    });
    lab.addEventListener('pointerleave', () => {
      scene.style.setProperty('--drift-x', '0px');
      scene.style.setProperty('--drift-y', '0px');
    });
    reactor.addEventListener('click', () => {
      clearTimeout(pulseTimer);
      lab.classList.remove('is-pulsing');
      void lab.offsetWidth;
      lab.classList.add('is-pulsing');
      title.textContent = 'PULSE SENT / ABSOLUTELY NOTHING SENT';
      description.textContent = 'A ripple through the cosmos. Zero emails sent. Excellent restraint.';
      announcement.textContent = description.textContent;
      satellites.forEach(satellite => satellite.classList.remove('is-selected'));
      pulseTimer = setTimeout(() => lab.classList.remove('is-pulsing'), 1600);
    });
    motionPreference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting; syncMotion();
      }).observe(lab);
    }
    draw();
    syncMotion();
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
