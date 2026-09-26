// ============================================================
// Richard Oentaryo — Personal Site interactions
// ============================================================
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Year ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Custom cursor ---------------- */
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  if (cursorDot && cursorRing && !reduceMotion && matchMedia("(hover: hover)").matches) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });
    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('[data-cursor="link"]').forEach((el) => {
      el.addEventListener("mouseenter", () => cursorRing.classList.add("active"));
      el.addEventListener("mouseleave", () => cursorRing.classList.remove("active"));
    });
  } else if (cursorDot && cursorRing) {
    cursorDot.style.display = "none";
    cursorRing.style.display = "none";
  }

  /* ---------------- Scroll progress + nav state ---------------- */
  const progressBar = document.getElementById("progressBar");
  const nav = document.getElementById("nav");
  const toTop = document.getElementById("toTop");

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
    if (nav) nav.classList.toggle("scrolled", scrollTop > 40);
    if (toTop) toTop.classList.toggle("visible", scrollTop > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------- Mobile menu ---------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (navToggle && mobileMenu) {
    function setMenuOpen(open) {
      navToggle.classList.toggle("open", open);
      mobileMenu.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      mobileMenu.setAttribute("aria-hidden", String(!open));
    }
    navToggle.addEventListener("click", () => {
      setMenuOpen(!mobileMenu.classList.contains("open"));
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setMenuOpen(false))
    );
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    });
  }

  /* ---------------- Active section in nav ---------------- */
  const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));
  const sectionTargets = navAnchors
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if (sectionTargets.length && "IntersectionObserver" in window) {
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navAnchors.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sectionTargets.forEach((s) => navIO.observe(s));
  }

  /* ---------------- Reveal on scroll ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- Animated counters ---------------- */
  const counters = document.querySelectorAll("[data-count]");
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;
      const display = Number.isInteger(target) ? Math.round(value) : value.toFixed(1);
      el.textContent = prefix + display + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(frame);
  }
  // The markup already carries the final figures, so no-JS visitors see real
  // numbers; only animate them when motion is welcome.
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    const cIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cIO.observe(c));
  }

  /* ---------------- Cinematic stage ----------------
     One fixed, full-page canvas composites every background layer: a
     scroll-reactive colour field, drifting nebulae, volumetric light
     shafts, a perspective grid on the hero floor, a parallax star field
     and the neural network — all in a single rAF loop.

     Everything that can be pre-rendered is. A first pass that built its
     gradients inline each frame measured 22fps here: large-area
     `lighter` compositing and per-frame createGradient calls dominate.
     Baking those into sprites blitted per frame restores 60fps.        */
  (function initStage() {
    const canvas = document.getElementById("stage");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const hero = document.getElementById("hero");

    let W = 0, H = 0, dpr = 1, heroH = 800, lastW = 0;
    let stars = [], nodes = [];
    let gridLayer = null;
    let fieldGrad = null, fieldKey = -1;
    const pulses = [];

    const atm = document.querySelector(".atm");
    const mouse = { x: null, y: null };
    let t = 0;
    let scrollY = window.scrollY;
    let target = scrollY;

    window.addEventListener("scroll", () => { target = window.scrollY; }, { passive: true });

    const wrap = (v, r) => { const m = v % r; return m < 0 ? m + r : m; };
    const lerp = (a, b, p) => a + (b - a) * p;

    function surface(w, h) {
      const c = document.createElement("canvas");
      c.width = Math.max(1, w | 0);
      c.height = Math.max(1, h | 0);
      return c;
    }

    /* The grid's converging lines and horizon glow never move; only the
       horizontal rungs flow, so bake the rest into one layer. */
    function makeGridLayer() {
      const c = surface(W, H);
      const g = c.getContext("2d");
      const horizon = H * .86;
      const vpX = W * .5;

      const glow = g.createRadialGradient(vpX, horizon, 0, vpX, horizon, W * .5);
      glow.addColorStop(0, "rgba(70,190,255,.13)");
      glow.addColorStop(1, "rgba(70,190,255,0)");
      g.fillStyle = glow;
      g.fillRect(0, horizon - W * .5, W, W);

      g.lineWidth = 1;
      const cols = 22;
      for (let i = 0; i <= cols; i++) {
        const xb = vpX + (i / cols - .5) * W * 3.4;
        const lg = g.createLinearGradient(vpX, horizon, xb, H);
        lg.addColorStop(0, "rgba(96,178,255,0)");
        lg.addColorStop(1, "rgba(96,178,255,.18)");
        g.strokeStyle = lg;
        g.beginPath();
        g.moveTo(vpX, horizon);
        g.lineTo(xb, H);
        g.stroke();
      }
      return c;
    }

    function build() {
      stars = Array.from({ length: Math.min(170, Math.round((W * H) / 8200)) }, () => {
        const depth = .25 + Math.random() * 1.15;
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          depth,
          r: (.35 + depth * .8) * (.8 + Math.random() * .4),
          a: Math.min(.9, .16 + depth * .42),
          tw: .004 + Math.random() * .017,
          ph: Math.random() * Math.PI * 2,
        };
      });

      nodes = Array.from({ length: Math.min(48, Math.round((W * Math.min(H, heroH)) / 26000)) }, () => ({
        x: Math.random() * W,
        y: Math.random() * Math.min(H, heroH),
        vx: (Math.random() - .5) * .3,
        vy: (Math.random() - .5) * .3,
        r: Math.random() * 1.5 + .55,
      }));

      gridLayer = makeGridLayer();
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      heroH = hero ? hero.offsetHeight : H;
      fieldGrad = null;
      // Width-only guard: mobile browsers fire resize on toolbar collapse.
      if (stars.length && Math.abs(W - lastW) < 40) {
        gridLayer = makeGridLayer();
        return;
      }
      lastW = W;
      build();
    }

    /* Colour field — the "camera" travels into a colder, darker register
       as the page scrolls, so depth reads as distance. */
    function drawField(progress) {
      const key = Math.round(progress * 30);
      if (key !== fieldKey || !fieldGrad) {
        fieldKey = key;
        const p = key / 30;
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, `rgb(${lerp(10, 5, p) | 0},${lerp(26, 14, p) | 0},${lerp(66, 40, p) | 0})`);
        g.addColorStop(.55, `rgb(${lerp(6, 4, p) | 0},${lerp(14, 9, p) | 0},${lerp(36, 26, p) | 0})`);
        g.addColorStop(1, "#04070f");
        fieldGrad = g;
      }
      ctx.fillStyle = fieldGrad;
      ctx.fillRect(0, 0, W, H);
    }

    function drawGrid(fade) {
      ctx.globalAlpha = fade;
      ctx.drawImage(gridLayer, 0, 0, W, H);
      ctx.globalAlpha = 1;

      const horizon = H * .86;
      const depth = H - horizon;
      ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const d = ((i / 16) + t * .00024) % 1;
        const y = horizon + depth * Math.pow(d, 2.6);
        ctx.strokeStyle = `rgba(96,178,255,${fade * .22 * Math.min(1, d * 4) * (1 - d * .25)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }

    function drawStars() {
      for (const s of stars) {
        s.x += .012 * s.depth;
        if (s.x > W + 4) s.x = -4;
        const py = wrap(s.y - scrollY * s.depth * .38, H + 60) - 30;
        const tw = s.a + Math.sin(t * s.tw + s.ph) * .26;
        if (tw <= 0) continue;
        ctx.beginPath();
        ctx.arc(s.x, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214,232,255,${tw})`;
        ctx.fill();
      }
    }

    /* Neural network, anchored to the hero and faded out past it. */
    function drawNetwork(fade) {
      const linkDist = Math.min(150, W * .14);
      const lim = Math.min(H, heroH);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > lim) n.vy *= -1;
        if (mouse.x !== null) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y;
          if (dx * dx + dy * dy < 19600) { n.x -= dx * .0022; n.y -= dy * .0022; }
        }
      }

      const links = [];
      ctx.lineWidth = .6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.strokeStyle = `rgba(128,168,255,${(1 - dist / linkDist) * .3 * fade})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            links.push(a, b);
          }
        }
      }

      if (Math.random() < .05 && links.length) {
        const k = ((Math.random() * links.length / 2) | 0) * 2;
        pulses.push({ a: links[k], b: links[k + 1], t: 0, sp: .012 + Math.random() * .014 });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.sp;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const px = p.a.x + (p.b.x - p.a.x) * p.t;
        const py = p.a.y + (p.b.y - p.a.y) * p.t;
        const f = Math.sin(p.t * Math.PI) * fade;
        ctx.beginPath();
        ctx.arc(px, py, 2.2 * f + .6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140,220,255,${.9 * f})`;
        ctx.fill();
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(178,206,255,${.85 * fade})`;
        ctx.fill();
      }
    }

    function frame() {
      t += 1;
      scrollY += (target - scrollY) * .08;
      const doc = document.documentElement.scrollHeight - H;
      const progress = doc > 0 ? Math.min(1, scrollY / doc) : 0;
      const heroFade = Math.max(0, 1 - scrollY / (heroH * .85));

      drawField(progress);
      if (atm) {
        const driftX = Math.sin(t * .0002) * 14;
        const driftY = Math.cos(t * .00015) * 10;
        atm.style.transform =
          `translate3d(${driftX}px, ${-Math.min(scrollY * .05, 50) + driftY}px, 0)`;
      }
      if (heroFade > .01) drawGrid(heroFade);
      drawStars();
      if (heroFade > .01) drawNetwork(heroFade);

      if (!reduceMotion) requestAnimationFrame(frame);
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });

    resize();
    frame();
  })();
})();
