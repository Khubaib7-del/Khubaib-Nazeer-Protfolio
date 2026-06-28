// A small grab-bag of heading-reveal techniques, deliberately different from
// each other (and from smoke-text.js) so not every section reads with the
// same treatment.

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Ember color sweep: a duplicate of the text, clipped, wipes left-to-right on scroll.
export function applyGradientWipe(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    if (reducedMotion) return;
    const text = el.textContent;
    el.classList.add('gradient-wipe');
    el.innerHTML = `<span class="gw-base">${text}</span><span class="gw-fill" aria-hidden="true">${text}</span>`;
    gsap.fromTo(
      el.querySelector('.gw-fill'),
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 45%', scrub: true },
      }
    );
  });
}

// Per-character scatter-in: each letter starts from its own random direction,
// distance, delay and duration, then lands with a bounce/elastic settle — reads
// as letters individually flying/dropping in at different paces, not a uniform
// left-to-right stagger. Fires once on scroll-in (the randomness doesn't make
// sense scrubbed back and forth).
export function applyScatterBounce(selector, opts = {}) {
  if (reducedMotion) return;
  const {
    spread = 110,
    minDuration = 0.5,
    maxDuration = 1.0,
    maxDelay = 0.45,
    ease = 'bounce.out',
  } = opts;

  document.querySelectorAll(selector).forEach((el) => {
    const text = el.textContent;
    el.innerHTML = '';
    el.classList.add('scatter-bounce');
    const chars = [];
    [...text].forEach((ch) => {
      if (ch === ' ') {
        // A lone space inside its own inline-block gets collapsed to zero
        // width by normal whitespace rules — append it as plain text instead
        // of wrapping it, it doesn't need to be individually animated anyway.
        el.appendChild(document.createTextNode(' '));
        return;
      }
      const span = document.createElement('span');
      span.className = 'scatter-char';
      span.textContent = ch;
      el.appendChild(span);
      chars.push(span);
    });

    const seeds = chars.map(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = spread * (0.5 + Math.random() * 0.5);
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        rot: (Math.random() - 0.5) * 60,
        duration: minDuration + Math.random() * (maxDuration - minDuration),
        delay: Math.random() * maxDelay,
      };
    });

    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    chars.forEach((c, i) => {
      const s = seeds[i];
      tl.fromTo(
        c,
        { x: s.x, y: s.y, rotate: s.rot, opacity: 0 },
        { x: 0, y: 0, rotate: 0, opacity: 1, duration: s.duration, ease },
        s.delay
      );
    });
  });
}
