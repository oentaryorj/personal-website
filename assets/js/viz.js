/* ============================================================================
   Profile visualisations. One small canvas for each part of the story, all
   drawn in code from the page's own content (nothing is hard-coded twice):

     career    a route across 2000 to now; the scroll flies a comet along it
               and each employer lights up as it is reached
     research  a constellation of papers around five research themes; the
               theme on screen lights up and sends pulses to its papers
     craft     an orbit system, one ring per discipline; the chosen tab's ring
               comes forward and spins up
     ledger    the recognition list grows a lit spine as it scrolls past

   Each canvas draws only while it is on screen. Reduced motion draws one still
   frame and redraws on scroll or selection.
   ========================================================================== */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const AC = "214,178,122", IC = "242,221,180", WM = "255,214,160";
  const FONT = getComputedStyle(document.body).fontFamily;

  // A canvas that sizes itself to its box and animates only while visible.
  const stage = (canvas, draw) => {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, raf = 0, on = false;
    const paint = (now = 0) => { ctx.clearRect(0, 0, w, h); if (w > 2 && h > 2) draw(ctx, w, h, now / 1000); };
    const loop = now => { raf = 0; if (!on) return; paint(now); raf = requestAnimationFrame(loop); };
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!on || reduce) paint(performance.now());
    };
    new ResizeObserver(size).observe(canvas);
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (!on || raf) return;
      if (reduce) paint(performance.now()); else raf = requestAnimationFrame(loop);
    }).observe(canvas);
    size();
    return { redraw: () => { if (on || reduce) paint(performance.now()); } };
  };
  const glow = (ctx, x, y, r, rgb, a) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  /* ------------------------------------------------------------- career -- */
  const route = $("#careerRoute"), career = $(".career");
  if (route && career) {
    const stops = $$(".path > div").map(d => ({ year: Number(d.querySelector("dt").textContent), name: d.querySelector("dd").textContent, lit: -1 }));
    const Y0 = 2000, Y1 = new Date().getFullYear();
    const progress = () => { const r = career.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - window.innerHeight)); };
    let p = 0;
    const view = stage(route, (ctx, w, h, t) => {
      const target = progress();
      p = reduce ? target : p + (target - p) * 0.12;
      const pad = Math.max(22, w * 0.045), x0 = pad, x1 = w - pad, y = h * 0.52;
      const xOf = yr => x0 + (yr - Y0) / (Y1 - Y0) * (x1 - x0);
      const tx = x0 + p * (x1 - x0);

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${AC},0.22)`; ctx.setLineDash([2, 5]);
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]);
      for (let yr = Y0; yr <= Y1; yr++) {
        const x = xOf(yr), major = yr % 10 === 0;
        ctx.strokeStyle = `rgba(${AC},${major ? 0.5 : 0.2})`;
        ctx.beginPath(); ctx.moveTo(x, y - (major ? 6 : 3)); ctx.lineTo(x, y + (major ? 6 : 3)); ctx.stroke();
      }
      const g = ctx.createLinearGradient(x0, 0, tx, 0);
      g.addColorStop(0, `rgba(${AC},0)`); g.addColorStop(1, `rgba(${AC},0.95)`);
      ctx.strokeStyle = g; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(tx, y); ctx.stroke();

      ctx.font = `500 11px ${FONT}`; ctx.textAlign = "center";
      stops.forEach((s, i) => {
        const x = xOf(s.year), lit = tx >= x - 1;
        if (lit && s.lit < 0) s.lit = t;
        const age = lit ? t - s.lit : -1;
        if (lit && age < 1.4 && !reduce) {                       // a ring spreads from a node the moment it ignites
          ctx.strokeStyle = `rgba(${IC},${0.8 * (1 - age / 1.4)})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(x, y, 4 + age * 18, 0, 6.2832); ctx.stroke();
        }
        if (lit) glow(ctx, x, y, 16, AC, 0.35);
        ctx.fillStyle = lit ? `rgb(${IC})` : `rgba(${AC},0.35)`;
        ctx.beginPath(); ctx.arc(x, y, lit ? 4 : 3, 0, 6.2832); ctx.fill();
        ctx.fillStyle = lit ? `rgba(${IC},0.95)` : `rgba(${AC},0.45)`;
        ctx.fillText(s.name, x, i % 2 ? y + 22 : y - 14);
      });

      // the comet
      for (let k = 0; k < 14; k++) {
        const a = 1 - k / 14;
        ctx.fillStyle = `rgba(${IC},${0.5 * a * a})`;
        ctx.beginPath(); ctx.arc(tx - k * 3.2, y + Math.sin(t * 3 + k) * 0.6, 2.2 * a + 0.4, 0, 6.2832); ctx.fill();
      }
      glow(ctx, tx, y, 22, WM, 0.55);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(tx, y, 2.4, 0, 6.2832); ctx.fill();
    });
    if (reduce) window.addEventListener("scroll", view.redraw, { passive: true });
  }

  /* ----------------------------------------------------------- research -- */
  const net = $("#researchNet");
  const themes = $$(".themes li:not(.service)");
  if (net && themes.length) {
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const PER = 8;                                             // 5 themes x 8 papers: the "40+" on the page
    const clusters = themes.map(() => ({
      hub: { x: 0, y: 0 },
      papers: Array.from({ length: PER }, (_, k) => ({ a: k * 2.399 + rnd(), r: 0.35 + 0.65 * Math.sqrt((k + 0.6) / PER), ph: rnd() * 6.28 }))
    }));
    const numerals = ["I", "II", "III", "IV", "V", "VI"];
    let active = 0;
    if (!reduce) {                                             // the theme in the middle of the screen is the live one
      const io = new IntersectionObserver(es => {
        for (const e of es) if (e.isIntersecting) active = themes.indexOf(e.target);
      }, { rootMargin: "-40% 0px -40% 0px" });
      themes.forEach(li => io.observe(li));
    }

    stage(net, (ctx, w, h, t) => {
      const n = clusters.length, cx = w * 0.5, cy = h * 0.5;
      const rx = w * 0.33, ry = h * 0.31, cr = Math.min(w * 0.15, h * 0.30);
      const pos = c => c.papers.map(q => ({
        x: c.hub.x + Math.cos(q.a + t * 0.12) * q.r * cr + Math.sin(t * 0.5 + q.ph) * 2,
        y: c.hub.y + Math.sin(q.a + t * 0.12) * q.r * cr * 0.8 + Math.cos(t * 0.45 + q.ph) * 2
      }));
      clusters.forEach((c, i) => {
        const a = -Math.PI / 2 + i / n * 6.2832;
        c.hub.x = cx + Math.cos(a) * rx; c.hub.y = cy + Math.sin(a) * ry;
      });
      const on = reduce ? -1 : active;           // reduced motion lights every theme equally
      // links between the themes
      ctx.lineWidth = 1;
      for (let i = 0; i < n; i++) for (const j of [(i + 1) % n, (i + 2) % n]) {
        const hot = i === on || j === on;
        ctx.strokeStyle = `rgba(${AC},${hot ? 0.34 : 0.10})`;
        ctx.beginPath(); ctx.moveTo(clusters[i].hub.x, clusters[i].hub.y); ctx.lineTo(clusters[j].hub.x, clusters[j].hub.y); ctx.stroke();
      }
      clusters.forEach((c, i) => {
        const hot = i === on || on < 0, ps = pos(c);
        ps.forEach((q, k) => {
          ctx.strokeStyle = `rgba(${AC},${i === on ? 0.30 : 0.09})`;
          ctx.beginPath(); ctx.moveTo(c.hub.x, c.hub.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          if (i === on && !reduce) {                           // a pulse runs out to each paper
            const f = (t * 0.7 + k * 0.37) % 1;
            ctx.fillStyle = `rgba(${IC},${0.9 * (1 - f)})`;
            ctx.beginPath(); ctx.arc(c.hub.x + (q.x - c.hub.x) * f, c.hub.y + (q.y - c.hub.y) * f, 1.6, 0, 6.2832); ctx.fill();
          }
          ctx.fillStyle = hot ? `rgba(${IC},${0.55 + 0.4 * Math.sin(t * 2 + k + i)})` : `rgba(${AC},0.5)`;
          ctx.beginPath(); ctx.arc(q.x, q.y, hot ? 2.3 : 1.8, 0, 6.2832); ctx.fill();
        });
        if (i === on) glow(ctx, c.hub.x, c.hub.y, cr * 1.5, AC, 0.22);
        ctx.strokeStyle = `rgba(${IC},${hot ? 0.95 : 0.5})`; ctx.lineWidth = hot ? 1.6 : 1;
        ctx.beginPath(); ctx.arc(c.hub.x, c.hub.y, 11, 0, 6.2832); ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = hot ? `rgb(${IC})` : `rgba(${IC},0.6)`;
        ctx.font = `500 10px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(numerals[i], c.hub.x, c.hub.y + 0.5);
      });
    });
  }

  /* -------------------------------------------------------------- craft -- */
  const orbit = $("#craftOrbit"), tabs = $$('#craftIndex [role="tab"]');
  if (orbit && tabs.length) {
    const groups = tabs.map(tab => ({
      name: tab.querySelector("span").textContent,
      n: $$("li", document.getElementById(tab.getAttribute("aria-controls"))).length
    }));
    const tilt = [-0.32, 0.20, -0.10, 0.42];
    let sel = Math.max(0, tabs.findIndex(t => t.getAttribute("aria-selected") === "true"));
    let boost = groups.map((_, i) => (i === sel ? 1 : 0));
    const spin = groups.map((_, i) => i * 1.7);
    let lastT = 0;
    const view = stage(orbit, (ctx, w, h, t) => {
      const dt = reduce ? 0 : Math.min(0.05, t - lastT); lastT = t;
      const cx = w * 0.5, cy = h * 0.5, base = Math.min(w * 0.5, h * 1.05) * 0.88;
      const pts = [];
      groups.forEach((g, i) => {
        boost[i] += ((i === sel ? 1 : 0) - boost[i]) * (reduce ? 1 : 0.08);
        spin[i] += dt * (0.18 + 0.55 * boost[i]) * (i % 2 ? -1 : 1);
        const R = base * (0.40 + 0.20 * i), ry = R * 0.44, c = Math.cos(tilt[i]), s = Math.sin(tilt[i]);
        ctx.strokeStyle = `rgba(${AC},${0.20 + 0.5 * boost[i]})`; ctx.lineWidth = 1 + boost[i];
        ctx.beginPath();
        for (let k = 0; k <= 96; k++) {
          const a = k / 96 * 6.2832, x = Math.cos(a) * R, y = Math.sin(a) * ry;
          const X = cx + x * c - y * s, Y = cy + x * s + y * c;
          k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
        }
        ctx.stroke();
        for (let k = 0; k < g.n; k++) {
          const a = spin[i] + k / g.n * 6.2832, x = Math.cos(a) * R, y = Math.sin(a) * ry;
          pts.push({ x: cx + x * c - y * s, y: cy + x * s + y * c, depth: Math.sin(a), b: boost[i] });
        }
      });
      pts.sort((a, b) => a.depth - b.depth);
      glow(ctx, cx, cy, base * 0.42, AC, 0.16);
      let coreDone = false;
      for (const q of pts) {
        if (!coreDone && q.depth > 0) { coreDone = true; ctx.fillStyle = `rgb(${IC})`; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 6.2832); ctx.fill(); }
        const near = 0.5 + 0.5 * q.depth;
        if (q.b > 0.4) glow(ctx, q.x, q.y, 11, AC, 0.4 * q.b);
        ctx.fillStyle = `rgba(${IC},${(0.35 + 0.55 * near) * (0.45 + 0.55 * q.b)})`;
        ctx.beginPath(); ctx.arc(q.x, q.y, 2.2 + 1.8 * near * (0.4 + 0.6 * q.b), 0, 6.2832); ctx.fill();
      }
      if (!coreDone) { ctx.fillStyle = `rgb(${IC})`; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 6.2832); ctx.fill(); }
      ctx.font = `500 11px ${FONT}`; ctx.textAlign = "center"; ctx.fillStyle = `rgba(${IC},0.9)`;
      ctx.fillText(groups[sel].name, cx, cy + 22);
    });
    new MutationObserver(() => {
      const i = tabs.findIndex(t => t.getAttribute("aria-selected") === "true");
      if (i >= 0 && i !== sel) { sel = i; view.redraw(); }
    }).observe($("#craftIndex"), { attributes: true, attributeFilter: ["aria-selected"], subtree: true });
  }

  /* ------------------------------------------------------------- ledger -- */
  const ledger = $(".ledger");
  if (ledger) {
    const setSpine = () => {
      const r = ledger.getBoundingClientRect();
      ledger.style.setProperty("--spine", clamp((window.innerHeight * 0.7 - r.top) / Math.max(1, r.height)).toFixed(3));
    };
    window.addEventListener("scroll", setSpine, { passive: true });
    window.addEventListener("resize", setSpine);
    setSpine();
  }
})();
