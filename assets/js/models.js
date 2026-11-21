/* ============================================================================
   Asia Lights Up: the page's signature move.
   A dot-matrix map of Asia (real coastlines, sampled from Natural Earth via
   world-atlas, baked into MAP below) draws itself in as the reader scrolls
   through the pinned chapter. The five markets where the models run (Singapore,
   Hong Kong, Taiwan, India, Indonesia) light up in turn, then links open between
   them and packets of light travel along them. The counter climbs to 250+
   alongside. The loop runs only while the chapter is on screen.

   MAP glyphs: 0 sea, 1 land, 2 India, 3 Taiwan, 4 Singapore, 5 Hong Kong,
   6 Indonesia. 0.75 degree grid, 94 x 72, lon 60..130, lat 43..-10.5.
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
  const MAP = {
    lon0: 60, lat1: 43, step: 0.75, xs: 0.95,                   // xs squeezes longitude a little (cos of mid latitude)
    rows: [
    "1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
    "1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
    "1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111110",
    "1111111111111111111111111111111111111111111111111111111111111111111111111111111111011111111110",
    "1111111111111111111111111111111111111111111111111111111111111111111111111111111100011111111000",
    "1111111111111111111111111111111111111111111111111111111111111111111111111111111000000000110000",
    "1111111111111111111111111111111111111111111111111111111111111111111111111111100000000001111100",
    "1111111111111111111111111111111111111111111111111111111111111111111111111111111001000000011100",
    "1111111111111111111111111111111111111111111111111111111111111111111111111111111111110000001110",
    "1111111111111111111111111111111111111111111111111111111111111111111111111111111110000000011110",
    "1111111111111111111111111111111111111111111111111111111111111111111111111111111100000000011110",
    "1111111111111111111111122111111111111111111111111111111111111111111111111111111000000000010000",
    "1111111111111111111222222111111111111111111111111111111111111111111111111111111110000000000000",
    "1111111111111111111222222211111111111111111111111111111111111111111111111111111110000000000001",
    "1111111111111111111122222111111111111111111111111111111111111111111111111111111111000000000000",
    "1111111111111111111122222111111111111111111111111111111111111111111111111111111111000000000001",
    "1111111111111111111122222211111111111111111111111111111111111111111111111111111111100000000000",
    "1111111111111111111222222222111111111111111111111111111111111111111111111111111110000000000000",
    "1111111111111111112222222222111111111111111111111111111111111111111111111111111111100000000000",
    "1111111111111111122222222221111111111111111111222111111111111111111111111111111111100000000000",
    "1111111111111121222222222222211111111121111122222211111111111111111111111111111111000000000000",
    "1111111111111222222222222222222221111121111222222111111111111111111111111111111110000000000000",
    "1111111111111122222222222222222222222112222222211111111111111111111111111111111100000000000000",
    "1111111111111122222222222222222222222211222222211111111111111111111111111111111100000000000000",
    "0000000001111112222222222222222222222211111122211111111111111111111111111111111000300000000000",
    "0000000000112122222222222222222222222221111222111111111111111111111111111111110003300000000000",
    "0000000000002222222222222222222222222221112121111111111111111111111111111111000003000000000000",
    "0000000000000022222222222222222222222221100121111111111111111111111111111110000003000000000000",
    "0000000000000222222222222222222222222221000111111111111111111111111111105000000003000000000000",
    "0000000000000022222222222222222222220000000111111111111111111111000100000000000000000000000000",
    "0000000000000000002222222222222222220000000011111111111111111110000100000000000000000000000000",
    "0000000000000000022222222222222222000000000001111111111111111100001110000000000000000000000000",
    "0000000000000000002222222222222220000000000001111111111111111000011100000000000000000000000000",
    "0000000000000000002222222222222220000000000000111111111111111100001000000000000001110000000000",
    "0000000000000000002222222222222000000000000000011111111111111110000000000000000001100000000000",
    "0000000000000000002222222222220000000000000000111111111111111111000000000000000001110000000000",
    "0000000000000000000222222222200000000000000000110001111111111111100000000000000011100000000000",
    "0000000000000000000222222220000000000000000000000001111111111111110000000000000011000000000000",
    "0000000000000000000022222220000000000000000000000001111111111111110000000000000000100000000000",
    "0000000000000000000022222220000000000000000000000001111111111111110000000000000000011100000000",
    "0000000000000000000022222222000000000000000000000000110111111111110000000000000001000100000000",
    "0000000000000000000002222220000000000000000000000000110001111111110000000000000000000111000000",
    "0000000000000000000002222220000000000000000000000000100000111111110000000000000000010011000000",
    "0000000000000000000000222220000000000000000000000001100000011111100000000000000000011000000000",
    "0000000000000000000000222200000000000000000000000001100000000110000000000000000000001011000000",
    "0000000000000000000000222201000000000000000000000000110000001100000000000000000000001000100000",
    "0000000000000000000000022001100000000000000000000001110000000000000000000000000000000111100000",
    "0000000000000000000000000001100000000000000000000000010000000000000000000000000000011011100000",
    "0000000000000000000000000001110000000000000002000000011000000000000000000000000000000011100000",
    "0000000000000000000000000001100000000000000000000000001110000000000000000001100000000011000000",
    "0000000000000000000000000000000000000000000000060000001111000000000000000011111000000000000000",
    "0000000000000000000000000000000000000000000000006660000111000000000000000111110000000000000000",
    "0000000000000000000000000000000000000000000000000666000111000000000000001116600000000000000000",
    "0000000000000000000000000000000000000000000000000066600011000000000000011166600000000000000000",
    "0000000000000000000000000000000000000000000000000006660011100000000001111166660000000000000000",
    "0000000000000000000000000000000000000000000000000000666600100000006001111666660000000000000000",
    "0000000000000000000000000000000000000000000000000060666660400000006666666666666006660060006600",
    "0000000000000000000000000000000000000000000000000000066660600000006666666666600060000000000000",
    "0000000000000000000000000000000000000000000000000000006666000000006666666666600060000000006000",
    "0000000000000000000000000000000000000000000000000000606666660000006666666666000060666000000000",
    "0000000000000000000000000000000000000000000000000000000666660600000666666666000066000060000000",
    "0000000000000000000000000000000000000000000000000000000066666660600666666666000660600000000000",
    "0000000000000000000000000000000000000000000000000000000066666600000000000666000060660000060000",
    "0000000000000000000000000000000000000000000000000000000006666600000000000000000060060000000000",
    "0000000000000000000000000000000000000000000000000000000000066600000000000000000060000000000000",
    "0000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000",
    "0000000000000000000000000000000000000000000000000000000000000666600060000000000000000000000000",
    "0000000000000000000000000000000000000000000000000000000000000066666666600000000000000000000000",
    "0000000000000000000000000000000000000000000000000000000000000000000066666000000000000000000006",
    "0000000000000000000000000000000000000000000000000000000000000000000000000006666066600001110000",
    "0000000000000000000000000000000000000000000000000000000000000000000000000000000660000060000000",
    "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000"
    ]
  };
  const ROWS = MAP.rows.length, COLS = MAP.rows[0].length;
  const MAP_W = (COLS - 1) * MAP.xs, MAP_H = ROWS - 1;

  const cellOf = (lon, lat) => [(lon - MAP.lon0) / MAP.step, (MAP.lat1 - lat) / MAP.step];

  // Live markets, in the order they light up. dx, dy: label offset in map cells.
  const MARKETS = [
    { name: "Singapore", ll: [103.82, 1.35], from: 0.26, dx: 4, dy: -5, align: "left" },
    { name: "Hong Kong", ll: [114.17, 22.32], from: 0.36, dx: 4, dy: 5, align: "left" },
    { name: "Taiwan", ll: [121.0, 23.7], from: 0.46, dx: 4, dy: -2, align: "left" },
    { name: "India", ll: [78.5, 22.5], from: 0.56, dx: 0, dy: -11, align: "center" },
    { name: "Indonesia", ll: [106.85, -6.2], from: 0.66, dx: -4, dy: 3, align: "right" }   // marker on Jakarta; the whole country lights up
  ];
  const LINKS = [[3, 0], [0, 1], [1, 2], [3, 1], [0, 4]];        // India-Singapore, Singapore-Hong Kong, Hong Kong-Taiwan, India-Hong Kong, Singapore-Indonesia

  let W = 1, H = 1, accent = "#5CDFFF", soft = "#9DB4CB", glow = "#BFF3FF", canvasBg = "#030814";
  let ox = 0, oy = 0, S = 1, shown = -1, onScreen = true, raf = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = getComputedStyle(section);
    accent = cs.getPropertyValue("--accent").trim() || accent;
    soft = cs.getPropertyValue("--ink-soft").trim() || soft;
    glow = cs.getPropertyValue("--glow").trim() || glow;
    canvasBg = cs.getPropertyValue("--canvas").trim() || canvasBg;
    // fit the map, leaving room on the right for labels and at the bottom for the legend
    const padR = Math.max(W * 0.12, 70), legend = 34, pad = 8;
    S = Math.min((W - padR - pad) / MAP_W, (H - legend - pad * 2) / MAP_H);
    ox = pad; oy = pad + Math.max(0, (H - legend - pad * 2 - MAP_H * S) / 2);
    shown = -1;
    wake();
  };

  const progress = () => {
    const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
    return clamp(-section.getBoundingClientRect().top / travel);
  };
  let target = reduce ? 1 : progress();

  const px = (c, r) => [ox + c * MAP.xs * S, oy + r * S];
  const font = (px_, w = 500) => `${w} ${px_}px Geist, system-ui, sans-serif`;
  const label = (text, x, y, align, size, color, alpha) => {
    ctx.font = font(size);
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.globalAlpha = alpha;
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = canvasBg;
    ctx.strokeText(text, x, y);                                 // a halo keeps the text legible over dots
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
  };

  const draw = (p, time) => {
    const t = reduce ? 0 : time;
    const rv = smooth(0.03, 0.30, p);                           // the map draws in, west to east
    const act = MARKETS.map(m => smooth(m.from, m.from + 0.08, p));
    const lit = Math.floor(COUNT * smooth(0.12, 0.86, p));
    const rad = Math.max(1.1, S * 0.3);
    const sweepX = reduce ? -1 : (t * 0.00005) % 1.4 - 0.2;

    ctx.clearRect(0, 0, W, H);

    // ---- the dot map
    for (let r = 0; r < ROWS; r++) {
      const row = MAP.rows[r];
      for (let c = 0; c < COLS; c++) {
        const g = row.charCodeAt(c) - 48;
        if (g === 0) continue;
        const edge = Math.min(smooth(0, 9, r), smooth(0, 7, c), smooth(0, 7, COLS - 1 - c));   // the cropped north, west and east edges dissolve
        const cr = clamp(rv * 1.5 - (c / COLS) * 0.5) * edge;
        if (cr <= 0.01) continue;
        const [x, y] = px(c, r);
        const sweep = Math.exp(-Math.pow((c / COLS - sweepX) * 9, 2)) * 0.22;
        let a = (0.26 + sweep) * cr, rr = rad, col = soft;
        if (g === 2 || g === 3 || g === 6) {                    // India, Taiwan, Indonesia: the region itself lights up
          const k = act[g === 2 ? 3 : g === 3 ? 2 : 4];
          a = (0.26 + (0.62 - 0.26) * k + sweep) * cr + 0.12 * k;
          rr = rad * (1 + 0.25 * k);
          col = k > 0.05 ? accent : soft;
          if (k > 0.3) { ctx.globalAlpha = 0.12 * k * cr; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(x, y, rr * 2.4, 0, 6.2832); ctx.fill(); }
        } else if (g === 4 || g === 5) { continue; }            // the two city markers are drawn below
        ctx.globalAlpha = Math.min(1, a);
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // ---- links between markets, with packets of light travelling along them
    const pts = MARKETS.map(m => px(...cellOf(...m.ll)));
    LINKS.forEach(([i, j], n) => {
      const k = Math.min(act[i], act[j]);
      if (k <= 0.02) return;
      const [x0, y0] = pts[i], [x1, y1] = pts[j];
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * 0.28;
      ctx.globalAlpha = 0.42 * k; ctx.strokeStyle = accent; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
      const u = reduce ? 0.5 : ((t * 0.00022 + n * 0.27) % 1);
      const bx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1;
      const by = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1;
      ctx.globalAlpha = 0.25 * k; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(bx, by, rad * 3.2, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 0.95 * k; ctx.beginPath(); ctx.arc(bx, by, rad * 1.2, 0, 6.2832); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ---- market markers, pulses and names
    const fs = Math.max(11, Math.min(15, W * 0.021));
    MARKETS.forEach((m, i) => {
      const k = act[i];
      if (k <= 0.02) return;
      const [x, y] = pts[i];
      for (let n = 0; n < 2; n++) {                             // pulse rings
        const u = reduce ? 0.35 : ((t * 0.0006 + n * 0.5) % 1);
        ctx.globalAlpha = (1 - u) * 0.55 * k; ctx.strokeStyle = accent; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, rad * 2.4 + u * rad * 12, 0, 6.2832); ctx.stroke();
      }
      ctx.globalAlpha = 0.22 * k; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(x, y, rad * 4.2, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = k; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(x, y, rad * 2.1, 0, 6.2832); ctx.fill();
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, rad * 0.9, 0, 6.2832); ctx.fill();
      const lx = x + m.dx * MAP.xs * S, ly = y + m.dy * S;
      ctx.globalAlpha = 0.5 * k; ctx.strokeStyle = accent; ctx.lineWidth = 1;   // leader line
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(m.align === "center" ? lx : lx - (m.align === "left" ? 3 : -3), ly); ctx.stroke();
      label(m.name, lx, ly, m.align, fs, glow, k);
    });
    ctx.globalAlpha = 1;

    // ---- legend
    const ly = H - 14;
    ctx.globalAlpha = rv; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(ox + 5, ly, 4, 0, 6.2832); ctx.fill();
    ctx.font = font(Math.max(10, fs * 0.86)); ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = soft;
    ctx.fillText("Models live in production", ox + 16, ly);
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
    if (!reduce) raf = requestAnimationFrame(frame);            // pulses and packets keep moving while the chapter is on screen
  };
  function wake() { if (!raf && onScreen) raf = requestAnimationFrame(frame); }

  window.addEventListener("scroll", () => { target = progress(); wake(); }, { passive: true });
  window.addEventListener("resize", resize);
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) { target = progress(); wake(); } }, { rootMargin: "20% 0px" }).observe(section);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  resize();
})();
