# Richard Oentaryo: Personal Website

Source for [oentaryorj.github.io/personal-website](https://oentaryorj.github.io/personal-website/), a personal site for Richard Oentaryo, Ph.D., AI/ML leader.

## Stack

Dependency-free static site: semantic HTML, hand-written CSS, vanilla JavaScript. No build step.

## Design

A calm, product-page system for both phone and desktop:

- A floating glass navigation pill, then a full-bleed hero: a pre-rendered light-streak image (`assets/img/hero-beams.webp`, 31 KB, not video and not a live canvas), a badge, a bold headline with one gradient phrase, glass buttons and a key-figures row
- Near-black surfaces with translucent glass cards; fluid type and layout from 320px phones to wide desktops
- "How I work" card grid, outcome-led career cards, honours ledger, research cards, discipline tabs
- One signature piece: a dot-matrix map of Asia (`assets/js/models.js`) pinned for a few screens, where the five markets light up and the counter climbs to 250+. It draws only when the scroll position changes; nothing runs while it is still
- No background animation, no WebGL, no per-frame work: scrolling is handled by the browser alone. Scroll-linked effects (title fades out, statement lines light up, portrait drift, closing headline settles) are CSS scroll-driven animations on transform and opacity, so they run on the compositor; browsers without support show everything in its finished state
- Respects `prefers-reduced-motion`; no horizontal overflow on phones

## Structure

```
index.html
assets/
  css/style.css    # the whole design
  js/site.js       # reveal on entry, discipline tabs, footer year
  js/models.js     # the market map
.github/workflows/deploy.yml
```

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which publishes the repo root to GitHub Pages (source set to **GitHub Actions**).

## Content

Profile details are sourced from publicly available profiles (LinkedIn, Google Scholar, ResearchGate, GitHub). Update `index.html` directly: there is no CMS or data layer.
