/* ============================================================================
   Scatter to Grid: the page's signature move.
   250 points, one per production model. As the reader scrolls through the
   pinned chapter they scatter, gather into four markets, settle into four
   ordered 8 x 8 grids, and light up in sequence while the counter climbs.
   The loop runs only while the chapter is on screen and still moving.
   ========================================================================== */
(() => {
  "use strict";
  const section = document.getElementById("scale");
  const canvas = document.getElementById("modelField");
  const counter = document.getElementById("modelCount");
  const ctx = canvas && canvas.getContext("2d");
  if (!section || !counter || !ctx) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

  const COUNT = 250;                                            // models in production
  const MARKETS = ["Singapore", "Hong Kong", "Taiwan", "India"];
  const COLS = 8;                                               // 8 x 8 slots per market
  const CENTERS = [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]];

  // deterministic scatter, so the page looks the same on every visit
  let seed = 20040701;
  const rnd = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const dots = [];
  for (let i = 0; i < COUNT; i++) {
    const slot = Math.floor(i / MARKETS.length);
    dots.push({
      sx: 0.04 + rnd() * 0.92, sy: 0.04 + rnd() * 0.92,         // scattered position
      angle: rnd() * Math.PI * 2, radius: Math.sqrt(rnd()),     // place inside its market blob
      market: i % MARKETS.length, row: Math.floor(slot / COLS), col: slot % COLS,
      phase: rnd() * Math.PI * 2, amp: 0.006 + rnd() * 0.014    // idle drift
    });
  }

  let W = 1, H = 1, accent = "", soft = "";
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = getComputedStyle(section);
    accent = cs.getPropertyValue("--accent").trim();
    soft = cs.getPropertyValue("--ink-soft").trim();
    shown = -1;                                                 // force a redraw
    wake();
  };

  const progress = () => {
    const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
    return clamp(-section.getBoundingClientRect().top / travel);
  };

  let target = reduce ? 1 : progress(), shown = -1, onScreen = true, raf = 0;

  const draw = (p, time) => {
    const toCluster = smooth(0.10, 0.42, p);                    // scatter to four markets
    const toGrid = smooth(0.40, 0.72, p);                       // markets to ordered grids
    const lit = Math.floor(COUNT * smooth(0.36, 0.84, p));
    const unit = Math.min(W, H);
    const pitch = unit * (W < H ? 0.052 : 0.056);
    const r = Math.max(1.6, unit * 0.0105);
    const idle = reduce ? 0 : 1 - toCluster;
    const t = time * 0.0004;

    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.strokeStyle = soft;
    ctx.fillStyle = accent;

    for (let i = 0; i < COUNT; i++) {
      const d = dots[i];
      const [cx0, cy0] = CENTERS[d.market];
      const sx = (d.sx + Math.sin(t + d.phase) * d.amp * idle) * W;
      const sy = (d.sy + Math.cos(t * 1.1 + d.phase) * d.amp * idle) * H;
      const cx = cx0 * W + Math.cos(d.angle) * d.radius * unit * 0.085;
      const cy = cy0 * H + Math.sin(d.angle) * d.radius * unit * 0.085;
      const gx = cx0 * W + (d.col - (COLS - 1) / 2) * pitch;
      const gy = cy0 * H + (d.row - (COLS - 1) / 2) * pitch;
      const ax = sx + (cx - sx) * toCluster, ay = sy + (cy - sy) * toCluster;
      const x = ax + (gx - ax) * toGrid, y = ay + (gy - ay) * toGrid;

      if (i < lit) {
        ctx.globalAlpha = 0.14;                                 // soft bloom, then the bright core
        ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(x, y, r * 1.08, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.arc(x, y, r * 0.78, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // market names appear as the points gather
    const labelAlpha = smooth(0.30, 0.46, p);
    if (labelAlpha > 0.01) {
      ctx.font = `500 ${Math.max(10, Math.round(unit * 0.026))}px Geist, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = soft;
      ctx.globalAlpha = labelAlpha;
      const above = (COLS - 1) / 2 * pitch + r * 3 + unit * 0.025;
      MARKETS.forEach((name, m) => ctx.fillText(name.toUpperCase().split("").join(" "), CENTERS[m][0] * W, CENTERS[m][1] * H - above));
    }
    ctx.globalAlpha = 1;

    counter.textContent = lit >= COUNT ? "250+" : String(lit);
  };

  const frame = now => {
    raf = 0;
    if (!onScreen) return;
    if (!reduce) shown = shown < 0 ? target : shown + (target - shown) * 0.12;
    else shown = target;
    if (Math.abs(target - shown) < 0.0004) shown = target;
    draw(shown, now);
    // keep running while the points are still travelling or idling in the scatter phase
    if (shown !== target || (!reduce && shown < 0.10)) raf = requestAnimationFrame(frame);
  };
  function wake() { if (!raf && onScreen) raf = requestAnimationFrame(frame); }

  window.addEventListener("scroll", () => { target = progress(); wake(); }, { passive: true });
  window.addEventListener("resize", resize);
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) { target = progress(); wake(); } }, { rootMargin: "20% 0px" }).observe(section);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  resize();
})();
