// Clean, hard-edge pixel art — climbing a blocky staircase toward a flag at dusk.
// Every coordinate is snapped to an integer pixel; no arcs, no gradients, no alpha
// falloffs — that's what kept making earlier passes look soft/blurry once scaled up.
export function initPixelArt(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const W = 320, H = 180;
  canvas.width = W;
  canvas.height = H;

  let frame = 0;
  const px = (n) => Math.round(n);

  const PAL = {
    sky1: '#0e0c1c',
    sky2: '#241b3a',
    sky3: '#4a2f4f',
    sky4: '#a8553f',
    star: '#fff6e0',
    stairDark: '#2a2230',
    stairLight: '#3c3146',
    stairEdge: '#56476a',
    badge: '#ffb04d',
    badgeLit: '#ffd98a',
    flagPole: '#cfd2da',
    flag: '#ff5a1f',
    figure: '#161320',
    moon: '#f4ecd0',
    moonShade: '#d8cba2',
    ground: '#100b18',
  };

  const stars = Array.from({ length: 26 }, () => ({
    x: px(Math.random() * W),
    y: px(Math.random() * 90),
    on: Math.random() < 0.5,
    rate: 20 + Math.floor(Math.random() * 40),
  }));

  // staircase: each step is a flat rect, climbing right-to-left toward the flag
  const STEP_COUNT = 9;
  const steps = [];
  {
    let x = 280, y = 150, stepW = 34, stepH = 14;
    for (let i = 0; i < STEP_COUNT; i++) {
      steps.push({ x, y, w: stepW, h: H - y + 20 });
      x -= 24;
      y -= stepH;
      stepW = Math.max(20, stepW - 1);
    }
  }
  const badgeSteps = [1, 4, 7];

  function drawSky() {
    ctx.fillStyle = PAL.sky1; ctx.fillRect(0, 0, W, 60);
    ctx.fillStyle = PAL.sky2; ctx.fillRect(0, 60, W, 35);
    ctx.fillStyle = PAL.sky3; ctx.fillRect(0, 95, W, 30);
    ctx.fillStyle = PAL.sky4; ctx.fillRect(0, 125, W, 25);
  }

  function drawStars() {
    ctx.fillStyle = PAL.star;
    stars.forEach((s) => {
      const blink = Math.floor(frame / s.rate) % 2 === 0;
      if (s.on ? blink : !blink) ctx.fillRect(s.x, s.y, 1, 1);
    });
  }

  // moon drawn as a stack of flat rows (blocky circle, zero anti-aliasing)
  function drawMoon() {
    const cx = 250, cy = 34, rows = [3, 7, 9, 10, 10, 9, 7, 3];
    rows.forEach((w, i) => {
      ctx.fillStyle = i < rows.length / 2 ? PAL.moon : PAL.moonShade;
      ctx.fillRect(cx - w, cy - rows.length + i * 2, w * 2, 2);
    });
  }

  function drawStairs() {
    steps.forEach((s) => {
      ctx.fillStyle = PAL.stairDark;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = PAL.stairLight;
      ctx.fillRect(s.x, s.y, s.w, 4);
      ctx.fillStyle = PAL.stairEdge;
      ctx.fillRect(s.x, s.y, s.w, 1);
    });
  }

  // simple flat-color badge icons sitting on a few steps — milestones
  function drawBadges() {
    badgeSteps.forEach((idx, n) => {
      const s = steps[idx];
      const bx = s.x + s.w / 2 - 3, by = s.y - 9;
      const lit = Math.floor(frame / 30) % badgeSteps.length === n;
      ctx.fillStyle = lit ? PAL.badgeLit : PAL.badge;
      ctx.fillRect(bx, by, 6, 6);
      ctx.fillRect(bx - 1, by + 1, 1, 4);
      ctx.fillRect(bx + 6, by + 1, 1, 4);
    });
  }

  function drawFlag() {
    const top = steps[steps.length - 1];
    const x = top.x + top.w / 2, y = top.y;
    ctx.fillStyle = PAL.flagPole;
    ctx.fillRect(x, y - 26, 2, 26);
    const wave = Math.floor(frame / 8) % 2;
    ctx.fillStyle = PAL.flag;
    ctx.fillRect(x + 2, y - 26 + wave, 14, 8);
  }

  function drawFigure() {
    const s = steps[2];
    const x = s.x + s.w / 2, groundY = s.y;
    ctx.fillStyle = PAL.figure;
    ctx.fillRect(x - 4, groundY - 16, 3, 16);
    ctx.fillRect(x + 1, groundY - 16, 3, 16);
    ctx.fillRect(x - 6, groundY - 34, 12, 18);
    ctx.fillRect(x - 4, groundY - 40, 8, 7);
  }

  function drawForeground() {
    ctx.fillStyle = PAL.ground;
    ctx.fillRect(0, 168, W, 12);
  }

  function draw() {
    frame++;
    drawSky();
    drawStars();
    drawMoon();
    drawStairs();
    drawBadges();
    drawFlag();
    drawFigure();
    drawForeground();
  }

  let running = false;
  let raf = null;
  function loop() {
    draw();
    if (running) raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true;
    loop();
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  draw();
  return { start, stop };
}
