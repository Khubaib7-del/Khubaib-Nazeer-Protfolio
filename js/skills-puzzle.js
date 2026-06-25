// A real sliding/rotating tile puzzle: 16 skill tiles fill a 4x4 grid edge-to-edge
// (no gaps, no overlap — just a shared border between cells). Several
// independent "movers" each rotate a random free 2x2 block on their own
// timer, so different parts of the board move differently at once (one
// area shifts left/right while another shifts up/down) — busy, not uniform.
// Scrolling into the section freezes new moves so the user can actually read
// the board; scrolling back up wakes it again.
export function initSkillsPuzzle({ stage, flankLeft, flankRight, board, chips, reducedMotion }) {
  const SIZE = 4;
  const MOVERS = 3;
  const busy = new Set();
  let running = true;

  function place() {
    chips.forEach((chip, i) => {
      const row = Math.floor(i / SIZE) + 1;
      const col = (i % SIZE) + 1;
      chip.style.gridRow = `${row} / span 1`;
      chip.style.gridColumn = `${col} / span 1`;
      chip.dataset.row = row;
      chip.dataset.col = col;
    });
  }
  place();

  function chipAt(row, col) {
    return chips.find((c) => Number(c.dataset.row) === row && Number(c.dataset.col) === col);
  }

  function tryRotateBlock() {
    for (let attempt = 0; attempt < 6; attempt++) {
      const r = 1 + Math.floor(Math.random() * (SIZE - 1));
      const c = 1 + Math.floor(Math.random() * (SIZE - 1));
      const cw = Math.random() < 0.5;
      const cells = cw
        ? [[r, c], [r, c + 1], [r + 1, c + 1], [r + 1, c]]
        : [[r, c], [r + 1, c], [r + 1, c + 1], [r, c + 1]];
      const tiles = cells.map(([row, col]) => chipAt(row, col));
      if (tiles.some((t) => busy.has(t))) continue;

      tiles.forEach((t) => busy.add(t));
      const before = tiles.map((t) => t.getBoundingClientRect());

      tiles.forEach((tile, i) => {
        const [nr, nc] = cells[(i + 1) % cells.length];
        tile.style.gridRow = `${nr} / span 1`;
        tile.style.gridColumn = `${nc} / span 1`;
        tile.dataset.row = nr;
        tile.dataset.col = nc;
      });

      tiles.forEach((tile, i) => {
        const after = tile.getBoundingClientRect();
        const dx = before[i].left - after.left;
        const dy = before[i].top - after.top;
        gsap.fromTo(
          tile,
          { x: dx, y: dy },
          {
            x: 0,
            y: 0,
            duration: 0.65,
            ease: 'power3.inOut',
            onComplete: () => busy.delete(tile),
          }
        );
      });
      return;
    }
  }

  function scheduleMover(baseDelay) {
    gsap.delayedCall(baseDelay + Math.random() * 1.2, () => {
      if (running) tryRotateBlock();
      scheduleMover(baseDelay);
    });
  }
  if (!reducedMotion) {
    for (let m = 0; m < MOVERS; m++) scheduleMover(0.6 + m * 0.5);
  }

  // Freeze only once the section has scrolled most of the way through —
  // not the moment it enters the viewport — so the live motion is actually
  // visible for a while before it settles.
  ScrollTrigger.create({
    trigger: stage,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      running = self.progress < 0.9;
    },
    onLeaveBack: () => (running = true),
  });

  gsap.fromTo(
    board,
    { scale: 0.88, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: stage, start: 'top 80%' },
    }
  );
  gsap.fromTo(
    [flankLeft, flankRight],
    { opacity: 0 },
    { opacity: 1, duration: 1, scrollTrigger: { trigger: stage, start: 'top 80%' } }
  );
}
