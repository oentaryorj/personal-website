/* ============================================================================
   Page behaviour. Everything here is used by index.html; nothing else.
     - scroll progress bar
     - reveal on entry (data-in, data-stagger) and number count-up (data-count)
     - the career rail (pan) and the pinned model chapter's text cues (pin)
     - portrait wipe and parallax
     - margin folio (chapter ticks)
     - expertise tabs, footer year
   One passive scroll listener, one rAF per frame, geometry measured only on
   resize. Reduced motion keeps opacity changes and drops every movement.
   ========================================================================== */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t * t * (3 - 2 * t);
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ------------------------------------------------------ reveal on entry -- */
  // Hidden only once this script is running, so a failure leaves content visible.
  root.classList.add("reveal");
  const seen = new IntersectionObserver((entries, io) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      e.target.classList.add("in");
    }
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.01 });

  $$("[data-stagger]").forEach(parent => {
    const step = Number(parent.dataset.stagger) || 60;
    [...parent.children].forEach((child, i) => {
      child.style.transitionDelay = `${i * step}ms`;
      seen.observe(child);
    });
  });
  $$("[data-in]").forEach(el => seen.observe(el));

  // numbers count up once, when they are mostly on screen
  const counted = new IntersectionObserver((entries, io) => {
    for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); countUp(e.target); }
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(el => counted.observe(el));

  function countUp(el) {
    const end = Number(el.dataset.count);
    if (reduce || !Number.isFinite(end)) { el.textContent = end; return; }
    const t0 = performance.now(), ms = 1500;
    const tick = now => {
      const t = clamp((now - t0) / ms);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  /* -------------------------------------------------- scroll-driven parts -- */
  const bar = $("[data-progress]");
  const rail = $("[data-pan]");
  const flatRail = window.matchMedia("(max-height: 560px)");   // too short to pin: the rail becomes a list (see CSS)
  const railAct = rail && rail.closest(".act");
  const pin = $("[data-pin]");
  const cues = pin ? $$("[data-cue]", pin).map(el => {
    const [from, to] = el.dataset.cue.split(" ").map(Number);
    return { el, from, to };
  }) : [];
  const wipe = $("[data-wipe]");
  const parallax = $("[data-parallax]");

  let vh = 0, docMax = 1, panTop = 0, panSpan = 1, panTravel = 0, pinTop = 0, pinSpan = 1;
  let wipeTop = 0, wipeH = 1, parTop = 0, parH = 1;
  const top = el => el.getBoundingClientRect().top + window.scrollY;

  const measure = () => {
    vh = window.innerHeight;
    docMax = Math.max(1, root.scrollHeight - vh);
    if (railAct) {
      panTop = top(railAct);
      panSpan = Math.max(1, railAct.offsetHeight - vh);
      panTravel = Math.max(0, rail.scrollWidth - window.innerWidth);
    }
    if (pin) { pinTop = top(pin); pinSpan = Math.max(1, pin.offsetHeight - vh); }
    if (wipe) { wipeTop = top(wipe); wipeH = wipe.offsetHeight; }
    if (parallax) { parTop = top(parallax); parH = parallax.offsetHeight; }
  };

  const RAMP = 0.07;                                   // cue fade length, in act progress
  let frame = 0;
  const render = () => {
    frame = 0;
    const y = window.scrollY;

    if (bar) bar.style.transform = `scaleX(${clamp(y / docMax)})`;

    if (rail) rail.style.transform = reduce || flatRail.matches ? "" : `translate3d(${-clamp((y - panTop) / panSpan) * panTravel}px,0,0)`;

    if (pin) {
      const p = clamp((y - pinTop) / pinSpan);
      for (const c of cues) {
        const o = ease(clamp(Math.min((p - c.from) / RAMP, (c.to - p) / RAMP)));
        c.el.style.opacity = o;
        if (!reduce) c.el.style.transform = `translate3d(0,${(1 - o) * 16}px,0)`;
      }
    }

    if (wipe && !reduce) {
      // the portrait is uncovered from the bottom as it enters
      const t = clamp((y + vh * 0.92 - wipeTop) / (wipeH * 0.75));
      wipe.style.clipPath = `inset(${(1 - ease(t)) * 100}% 0 0 0)`;
    }
    if (parallax && !reduce) {
      // the image drifts inside its frame (the frame is overscaled to cover the travel)
      const c = clamp((y + vh * 0.5 - parTop) / (parH + vh * 0.5) * 2 - 1, -1, 1);
      parallax.style.transform = `translate3d(0,${(-c * 28).toFixed(1)}px,0) scale(1.14)`;
    }

    folioUpdate();
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(render); };

  /* ----------------------------------------------------------------- folio -- */
  const folio = $("#folio");
  const folioLinks = folio ? $$("a", folio) : [];
  const chapters = folioLinks.map(a => $(a.getAttribute("href")));
  const runhead = $("#runhead");
  const runChap = $("#runChap");
  let folioCurrent = -1;
  const folioUpdate = () => {
    if (!folio) return;
    const mid = vh * 0.5;
    let hit = -1;
    for (let i = 0; i < chapters.length; i++) {
      const r = chapters[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) { hit = i; break; }
    }
    // the career rail slides under the left margin, so the ticks step aside there
    folio.classList.toggle("on", hit >= 0 && chapters[hit].id !== "career");
    if (runhead) runhead.classList.toggle("on", hit >= 0);
    if (hit === folioCurrent) return;
    folioCurrent = hit;
    if (runChap && hit >= 0) runChap.textContent = folioLinks[hit].textContent.trim().replace(/^(\S+)\s+/, "$1. ");
    folioLinks.forEach((a, i) => (i === hit ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
  };
  if (folio) folio.hidden = false;

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", () => { measure(); request(); });
  window.addEventListener("load", () => { measure(); request(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); request(); });
  measure();
  request();

  /* ------------------------------------------------------------------ tabs -- */
  const tabRoot = $("#craftIndex");
  if (tabRoot) {
    const tabs = $$('[role="tab"]', tabRoot);
    const panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));
    const hoverSelects = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const select = (i, focus) => {
      tabs.forEach((t, k) => {
        t.setAttribute("aria-selected", k === i ? "true" : "false");
        t.tabIndex = k === i ? 0 : -1;
        panels[k].hidden = k !== i;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      if (hoverSelects) t.addEventListener("pointerenter", () => select(i));
      t.addEventListener("keydown", e => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (step) { e.preventDefault(); select((i + step + tabs.length) % tabs.length, true); }
        else if (e.key === "Home") { e.preventDefault(); select(0, true); }
        else if (e.key === "End") { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
    select(0);
  }

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
