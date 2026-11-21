/* ============================================================================
   Page behaviour. The scroll devices live in scrollcraft.js (untouched).
   This file holds the three things that are bespoke to this site:
     1. the margin folio (chapter ticks that follow the reader)
     2. the signature move, "Scatter to Grid" (250 points, one per model)
     3. the craft index (pointer-operated tabs)
   ========================================================================== */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------- 1. folio -- */
  (() => {
    const folio = document.getElementById("folio");
    if (!folio) return;
    folio.hidden = false;
    const chapters = [...document.querySelectorAll("[data-folio]")];
    const links = new Map([...folio.querySelectorAll("a[data-ch]")].map(a => [a.dataset.ch, a]));
    let current = null;
    let raf = 0;

    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let hit = null;
      for (const ch of chapters) {
        const r = ch.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) { hit = ch; break; }
      }
      folio.classList.toggle("is-on", !!hit);
      if (!hit) { current = null; links.forEach(a => a.removeAttribute("aria-current")); return; }
      folio.dataset.tone = hit.classList.contains("ch--paper") ? "paper" : "ink";
      if (hit !== current) {
        current = hit;
        links.forEach((a, k) => (k === hit.dataset.folio ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
      }
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    update();
  })();

  /* ------------------------------------- 2. signature: Scatter to Grid -- */
  (() => {
    const section = document.getElementById("scale");
    const canvas = document.getElementById("modelField");
    const counter = document.getElementById("modelCount");
    if (!section || !canvas || !counter) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const N = 250;           // one point per production model
    const CLUSTERS = 4;      // four markets
    const COLS = 8;          // 8 x 8 slots per market (63 or 64 used)

    // deterministic scatter so the page looks the same every visit
    let seed = 20040701;
    const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const dots = Array.from({ length: N }, (_, i) => {
      const cluster = i % CLUSTERS;
      const slot = Math.floor(i / CLUSTERS);
      const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd());
      return {
        sx: 0.04 + rnd() * 0.92, sy: 0.04 + rnd() * 0.92,       // scatter
        ca: a, cr: rr,                                           // blob inside cluster
        cluster, row: Math.floor(slot / COLS), col: slot % COLS, // grid slot
        ph: rnd() * Math.PI * 2, amp: 0.006 + rnd() * 0.014
      };
    });
    const centers = [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]];

    let W = 0, H = 0, dpr = 1, inkSoft = "", accent = "", ink = "";
    const readColors = () => {
      const cs = getComputedStyle(section);
      ink = cs.getPropertyValue("--sc-ink").trim() || "#ECEAE4";
      inkSoft = cs.getPropertyValue("--sc-ink-soft").trim() || "#A3A8B1";
      accent = cs.getPropertyValue("--sc-accent").trim() || "#8FA8FF";
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      draw(true);
    };

    const progress = () => {
      const r = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      return clamp(-r.top / travel);
    };

    let target = reduce ? 1 : progress(), shown = target, last = -1, visible = true;

    const draw = (force) => {
      if (!force && Math.abs(shown - last) < 0.00005 && !visible) return;
      last = shown;
      const p = shown;
      const toCluster = smooth(0.10, 0.42, p);   // scatter to four markets
      const toGrid    = smooth(0.40, 0.72, p);   // markets to ordered grids
      const lit       = Math.floor(N * smooth(0.36, 0.84, p) + 0.0001);
      const unit = Math.min(W, H);
      const pitch = unit * (W < H ? 0.052 : 0.056);
      const r = Math.max(1.6, unit * 0.0105);
      const t = performance.now() * 0.0004;
      const idle = reduce ? 0 : 1 - toCluster;

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < N; i++) {
        const d = dots[i];
        const sx = (d.sx + Math.sin(t + d.ph) * d.amp * idle) * W;
        const sy = (d.sy + Math.cos(t * 1.1 + d.ph) * d.amp * idle) * H;
        const [cx0, cy0] = centers[d.cluster];
        const cx = cx0 * W + Math.cos(d.ca) * d.cr * unit * 0.085;
        const cy = cy0 * H + Math.sin(d.ca) * d.cr * unit * 0.085;
        const gx = cx0 * W + (d.col - (COLS - 1) / 2) * pitch;
        const gy = cy0 * H + (d.row - (COLS - 1) / 2) * pitch;

        const ax = sx + (cx - sx) * toCluster, ay = sy + (cy - sy) * toCluster;
        const x = ax + (gx - ax) * toGrid,     y = ay + (gy - ay) * toGrid;

        const on = i < lit;
        ctx.beginPath();
        ctx.arc(x, y, on ? r * 1.08 : r * 0.78, 0, Math.PI * 2);
        if (on) { ctx.globalAlpha = 1; ctx.fillStyle = accent; ctx.fill(); }
        else { ctx.globalAlpha = 0.55; ctx.strokeStyle = inkSoft; ctx.lineWidth = 1; ctx.stroke(); }
      }
      ctx.globalAlpha = 1;

      const shownCount = Math.min(N, lit);
      counter.textContent = shownCount >= N ? "250+" : String(shownCount);
    };

    const tick = () => {
      if (!reduce) shown += (target - shown) * 0.12;
      if (Math.abs(target - shown) < 0.0004) shown = target;
      if (visible) draw();
      requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", () => { target = progress(); }, { passive: true });
    window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "20% 0px" }).observe(section);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    resize();
    if (reduce) { shown = target = 1; draw(true); } else { requestAnimationFrame(tick); }
  })();

  /* ---------------------------------------------------- 3. craft index -- */
  (() => {
    const root = document.getElementById("craftIndex");
    if (!root) return;
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));
    const select = (i, focus) => {
      tabs.forEach((t, k) => {
        const on = k === i;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      t.addEventListener("keydown", e => {
        const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); select((i + k + tabs.length) % tabs.length, true); }
        else if (e.key === "Home") { e.preventDefault(); select(0, true); }
        else if (e.key === "End") { e.preventDefault(); select(tabs.length - 1, true); }
      });
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        t.addEventListener("pointerenter", () => select(i));
      }
    });
    select(0);
  })();
})();
