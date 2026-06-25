// Coursework chips as a small floating-bubble cluster beside the degree card.
// Laid out with normal flexbox wrap (so they can never overlap or collapse —
// the 3D ring tried to do this with absolute/perspective math and kept
// rendering broken), then each chip gets a small bounded float on top.
export function initCourseRing(wrap, ring, cards) {
  // Idle bob uses xPercent/yPercent — a separate GSAP-tracked channel from
  // the plain x/y the scroll reveal below animates, so the two compose
  // instead of overwriting each other on the same property.
  cards.forEach((card, i) => {
    const ampX = 4 + Math.random() * 4;
    const ampY = 5 + Math.random() * 5;
    gsap.to(card, {
      xPercent: ampX,
      yPercent: -ampY,
      duration: 2.4 + Math.random() * 1.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: i * 0.12,
    });
  });

  // Bubble-by-bubble reveal, one at a time in reading order (flex-wrap lays
  // them out left-to-right then top-to-bottom, so plain DOM-order stagger
  // already matches that). Spread across a wide scroll range — the earlier
  // single clip-path "curtain" sweep revealed the whole cluster at once and
  // happened too fast to read while scrolling.
  gsap.fromTo(
    cards,
    { opacity: 0, y: 14, scale: 0.7 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      ease: 'none',
      stagger: { each: 0.22, from: 'start' },
      scrollTrigger: { trigger: wrap, start: 'top 98%', end: 'top -10%', scrub: 0.5 },
    }
  );

  // Gentle parallax drift on the whole cluster as the section scrolls
  // through — separate element from the per-chip float above, so the two
  // don't fight over the same transform.
  ScrollTrigger.create({
    trigger: '#education',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => gsap.set(ring, { y: (self.progress - 0.5) * 50 }),
  });
}
