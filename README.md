# Richard Oentaryo: Personal Website

Source for [oentaryorj.github.io/personal-website](https://oentaryorj.github.io/personal-website/), a personal site for Richard Oentaryo, Ph.D., AI/ML leader.

## Stack

Dependency-free static site: semantic HTML, hand-written CSS, vanilla JavaScript. No build step.

## Design

A calm, product-page system for both phone and desktop:

- A floating glass navigation pill, then a quiet, typographic hero: the headline on the left and the portrait (a transparent cutout, `assets/img/richard-cutout.webp`) standing directly on the black page at the right, flush to the bottom edge; on phones the portrait comes first. The AI-themed neural lattice (`assets/img/contact-neural.webp`, a static render, not video and not a live canvas) is a soft glow in the closing section
- Near-black surfaces with translucent glass cards; fluid type and layout from 320px phones to wide desktops
- An "Embedded in the business" four-step approach, a five-industries section (finance, oil and gas, telecommunication, motorsport and transport, education), outcome-led career cards, honours ledger, research cards, discipline tabs
- One signature piece: a still dot-matrix map of Asia (`assets/js/models.js`) with the five markets lit and linked, drawn once with no scroll handler, no loop and no counting
- No background animation, no WebGL, no per-frame work: scrolling is handled by the browser alone. Scroll-linked effects (title fades out, cards and rows rise as they enter, the approach line draws, portrait drift, closing headline settles) are CSS scroll-driven animations on transform and opacity, so they run on the compositor; browsers without support show everything in its finished state
- Respects `prefers-reduced-motion`; no horizontal overflow on phones

## Structure

```
index.html
assets/
  css/style.css    # the whole design
  js/site.js       # reveal on entry, discipline tabs, footer year
  js/models.js     # the market map, drawn once
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
