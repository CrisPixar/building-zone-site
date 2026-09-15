/* ============================================================
   Воксельное поле в hero на canvas (перенос логики 1:1).
   Считаем только пока hero виден и вкладка активна.
   ============================================================ */

type Voxel = {
  x: number;
  y: number;
  s: number;
  v: number;
  ph: number;
  d: number;
  hue: number;
  a: number;
};

function drawCube(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, hue: number, a: number) {
  const depth = s * 0.95;
  const top: [number, number] = [x, y - s * 0.5];
  const right: [number, number] = [x + s, y];
  const bottom: [number, number] = [x, y + s * 0.5];
  const left: [number, number] = [x - s, y];
  const poly = (pts: [number, number][]) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
  };
  ctx.fillStyle = `hsla(${hue},95%,68%,${a})`;
  poly([top, right, bottom, left]);
  ctx.fillStyle = `hsla(${hue},90%,52%,${a})`;
  poly([left, bottom, [bottom[0], bottom[1] + depth], [left[0], left[1] + depth]]);
  ctx.fillStyle = `hsla(${hue},85%,40%,${a})`;
  poly([right, bottom, [bottom[0], bottom[1] + depth], [right[0], right[1] + depth]]);
}

export function startVoxels(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let w = 0;
  let h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const spawn = (anywhere: boolean): Voxel => ({
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + 70,
    s: 7 + Math.random() * 16,
    v: 0.16 + Math.random() * 0.4,
    ph: Math.random() * Math.PI * 2,
    d: 0.3 + Math.random() * 0.7,
    hue: 12 + Math.random() * 24,
    a: 0.05 + Math.random() * 0.11,
  });

  const N = w < 768 ? 14 : 26;
  const cubes: Voxel[] = Array.from({ length: N }, () => spawn(true));

  let tmx = 0;
  let tmy = 0;
  let mx = 0;
  let my = 0;
  let inView = false;
  const onMove = (e: MouseEvent) => {
    if (!inView || reducedMotion.matches) return;
    tmx = (e.clientX / window.innerWidth - 0.5) * 2;
    tmy = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('mousemove', onMove, { passive: true });

  let raf = 0;
  let last = performance.now();
  let t = 0;
  const draw = (now: number) => {
    const dt = Math.min(2, (now - last) / 16.67);
    last = now;
    t += 0.008 * dt;
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    ctx.clearRect(0, 0, w, h);
    for (const c of cubes) {
      c.y -= c.v * dt;
      if (c.y < -80) Object.assign(c, spawn(false));
      const px = c.x + mx * 22 * c.d + Math.sin(t * 2 + c.ph) * 6;
      const py = c.y + my * 16 * c.d;
      drawCube(ctx, px, py, c.s, c.hue, c.a);
    }
    raf = requestAnimationFrame(draw);
  };

  // один цикл анимации, и только пока hero на экране
  const syncPlayback = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    if (inView && !document.hidden && !reducedMotion.matches) {
      last = performance.now();
      raf = requestAnimationFrame(draw);
    }
  };
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  });
  observer.observe(canvas);
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', syncPlayback);
}
