// Splits an element's text into per-word spans (preserving nested tags like <em>)
// so each word can be animated independently.
function wrapWords(el) {
  function walk(node) {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach((part) => {
        if (part.trim() === '') {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'smoke-word';
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      node.replaceWith(frag);
    } else if (node.nodeType === 1) {
      [...node.childNodes].forEach(walk);
    }
  }
  [...el.childNodes].forEach(walk);
  return [...el.querySelectorAll('.smoke-word')];
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function applySmokeText(selector, opts = {}) {
  if (reducedMotion) return;
  const { dissolveOut = true } = opts;

  document.querySelectorAll(selector).forEach((el) => {
    const words = wrapWords(el);
    if (!words.length) return;

    gsap.set(words, { display: 'inline-block' });

    const seeds = words.map(() => ({
      dx: (Math.random() - 0.5) * 46,
      dy: (Math.random() - 0.5) * 56,
      dxOut: (Math.random() - 0.5) * 46,
      dyOut: (Math.random() - 0.5) * 56,
      rot: (Math.random() - 0.5) * 14,
    }));

    // Headings that introduce content below them (dissolveOut: false) only get the
    // materialize-in phase, then stay solid — fully dissolving would hide them before
    // the reader reaches what they're introducing. Standalone atmospheric text (like
    // the Philosophy section) gets the full in-then-out smoke cycle.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        end: dissolveOut ? 'bottom 20%' : 'top 35%',
        scrub: true,
      },
    });

    words.forEach((w, i) => {
      const s = seeds[i];
      tl.fromTo(
        w,
        { opacity: 0, filter: 'blur(14px)', x: s.dx, y: s.dy, rotate: s.rot },
        { opacity: 1, filter: 'blur(0px)', x: 0, y: 0, rotate: 0, duration: 0.35, ease: 'power1.out' },
        i * 0.015
      );
    });

    if (dissolveOut) {
      const outStart = 0.6 + words.length * 0.015;
      words.forEach((w, i) => {
        const s = seeds[i];
        tl.to(
          w,
          { opacity: 0, filter: 'blur(14px)', x: s.dxOut, y: s.dyOut, rotate: -s.rot, duration: 0.35, ease: 'power1.in' },
          outStart + i * 0.015
        );
      });
    }
  });
}
