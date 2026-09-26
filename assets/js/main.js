// ============================================================
// Richard Oentaryo — Personal Site interactions
// ============================================================
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Letterbox intro ---------------- */
  const letterbox = document.querySelector(".letterbox");
  if (letterbox) {
    if (reduceMotion) letterbox.remove();
    else letterbox.lastElementChild.addEventListener("animationend", () => letterbox.remove());
  }

  /* ---------------- Year ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Custom cursor ---------------- */
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  if (cursorDot && cursorRing && !reduceMotion && matchMedia("(hover: hover)").matches) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, ringRaf = null;
    // The ring eases toward the pointer; once it has caught up, the loop
    // parks itself instead of writing a transform every frame forever.
    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      ringRaf = Math.abs(mouseX - ringX) + Math.abs(mouseY - ringY) > 0.3
        ? requestAnimationFrame(animateRing)
        : null;
    }
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
      if (!ringRaf) ringRaf = requestAnimationFrame(animateRing);
    }, { passive: true });

    document.querySelectorAll('[data-cursor="link"]').forEach((el) => {
      el.addEventListener("mouseenter", () => cursorRing.classList.add("active"));
      el.addEventListener("mouseleave", () => cursorRing.classList.remove("active"));
    });
  } else if (cursorDot && cursorRing) {
    cursorDot.style.display = "none";
    cursorRing.style.display = "none";
  }

  /* ---------------- 3D card tilt ---------------- */
  // A pure-CSS-transform tilt driven by pointer position — no extra
  // layers, no canvas, just a translateZ/rotate already on the compositor
  // thread. Fine-pointer only: touch has no hover to drive it from, and
  // the constant pointermove listener isn't worth paying for on mobile.
  if (!reduceMotion && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      let raf = null;
      function onMove(e) {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          card.style.setProperty("--tilt-x", (-py * 7).toFixed(2) + "deg");
          card.style.setProperty("--tilt-y", (px * 9).toFixed(2) + "deg");
          card.style.setProperty("--glow-x", `${(px + 0.5) * 100}%`);
          card.style.setProperty("--glow-y", `${(py + 0.5) * 100}%`);
          raf = null;
        });
      }
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  /* ---------------- Scroll progress + nav state ---------------- */
  const progressBar = document.getElementById("progressBar");
  const nav = document.getElementById("nav");
  const toTop = document.getElementById("toTop");

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${pct / 100})`;
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
     shafts, a perspective grid on the hero floor and a parallax star
     field — all in a single rAF loop. The hero's neural-network motif is
     now a real 3D WebGL piece (see three-hero.js), not drawn here.

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
    let stars = [];
    let gridLayer = null;
    let fieldGrad = null, fieldKey = -1;

    const atm = document.querySelector(".atm");
    const heroInner = document.querySelector(".hero-inner");
    let heroStyled = false;
    let lastDriftY = -1;
    let t = 0;
    let velocity = 0;
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

      gridLayer = makeGridLayer();
    }

    function resize() {
      const nextW = window.innerWidth;
      const nextH = canvas.clientHeight || window.innerHeight;
      const nextDpr = Math.min(window.devicePixelRatio || 1, 1.75);
      heroH = hero ? hero.offsetHeight : nextH;
      // The canvas is 100lvh, so a mobile toolbar collapsing doesn't change
      // its size at all — nothing to reallocate or rebuild.
      if (nextW === W && nextH === H && nextDpr === dpr) return;
      dpr = nextDpr;
      W = nextW;
      H = nextH;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fieldGrad = null;
      if (stars.length && Math.abs(W - lastW) < 40) {
        gridLayer = makeGridLayer();
      } else {
        lastW = W;
        build();
      }
      // Resetting canvas.width wipes it; with reduced motion there is no
      // rAF loop to repaint, so the backdrop used to go blank on resize.
      if (reduceMotion) frame();
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

    /* Stars stretch into warp streaks in proportion to scroll speed and
       depth — near stars streak more — then relax back to points. Lines
       are no dearer to draw than the arcs they replace. */
    function drawStars() {
      const warp = Math.max(-70, Math.min(70, velocity));
      const streaking = Math.abs(warp) > 1.2;
      for (const s of stars) {
        s.x += .012 * s.depth;
        if (s.x > W + 4) s.x = -4;
        const py = wrap(s.y - scrollY * s.depth * .38, H + 60) - 30;
        const tw = s.a + Math.sin(t * s.tw + s.ph) * .26;
        if (tw <= 0) continue;
        if (streaking) {
          const len = warp * s.depth * .55;
          ctx.strokeStyle = `rgba(214,232,255,${Math.min(1, tw * 1.1)})`;
          ctx.lineWidth = s.r * 1.4;
          ctx.beginPath();
          ctx.moveTo(s.x, py);
          ctx.lineTo(s.x, py + len);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(s.x, py, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(214,232,255,${tw})`;
          ctx.fill();
        }
      }
    }

    /* The hero pulls away as you scroll: its copy drifts at 0.84x scroll
       speed and fades, like a camera tracking back. Driven by the real
       scroll position (not the smoothed one) so text never wobbles, and
       styles are cleared at rest so no layer stays promoted.
       Tuned so the copy has fully faded before the drift carries it into
       the hero's bottom edge (overflow: hidden would otherwise slice a
       hard line through the stats). Desktop only: on phones the hero is a
       tall block of text people read while scrolling, so fading it early
       would hurt, and there's no sphere there to pull toward anyway. */
    const driftOK = matchMedia("(min-width: 901px)").matches;
    function driftHero() {
      if (!heroInner || reduceMotion || !driftOK) return;
      const y = target;
      if (y <= 1 || y > heroH) {
        if (heroStyled && y <= 1) {
          heroInner.style.transform = "";
          heroInner.style.opacity = "";
          heroStyled = false;
          lastDriftY = -1;
        }
        return;
      }
      if (y === lastDriftY) return;
      lastDriftY = y;
      const p = y / heroH;
      heroInner.style.transform = `translate3d(0, ${(y * .16).toFixed(1)}px, 0)`;
      heroInner.style.opacity = Math.max(0, 1 - p * 1.7).toFixed(3);
      heroStyled = true;
    }

    function frame() {
      t += 1;
      const prev = scrollY;
      scrollY += (target - scrollY) * .08;
      velocity = scrollY - prev;
      driftHero();
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

      if (!reduceMotion) requestAnimationFrame(frame);
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    resize();
    frame();
  })();
})();
