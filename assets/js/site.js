/* Page behaviour: reveal on entry, the discipline tabs, the footer year.
   No scroll handlers and no animation loops live here. The only moving canvas is
   the market map (models.js), and it draws only while you scroll through it. */
(() => {
  "use strict";
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // Hidden only once this script is running, so a failure leaves the content visible.
  root.classList.add("reveal");
  // Where the browser can run scroll-driven animations, entries are declared in CSS and need no observer.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sd = !reduceMotion && window.CSS && CSS.supports("animation-timeline: view()");
  if (sd) root.classList.add("sd");
  const seen = new IntersectionObserver((entries, io) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      e.target.classList.add("in");
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
  if (!sd) $$("[data-stagger]").forEach(parent => {
    const step = Number(parent.dataset.stagger) || 60;
    [...parent.children].forEach((child, i) => { child.style.transitionDelay = `${Math.min(i, 5) * step}ms`; seen.observe(child); });
  });
  if (!sd) $$("[data-in]").forEach(el => { if (!el.hasAttribute("data-stagger")) seen.observe(el); else el.classList.add("in"); });

  // discipline tabs
  const tabRoot = $("#craftIndex");
  if (tabRoot) {
    const tabs = $$('[role="tab"]', tabRoot);
    const panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));
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
