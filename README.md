# Richard Oentaryo: Personal Website

Source for [oentaryorj.github.io/personal-website](https://oentaryorj.github.io/personal-website/), a personal site for Richard Oentaryo, Ph.D., AI/ML leader.

## Stack

Dependency-free static site: semantic HTML, hand-written CSS, vanilla JavaScript. No build step.

## Design

A calm, product-page system for both phone and desktop:

- One global bar with section links and a Contact button
- Full-width sections that alternate black, light grey and white; large sans headlines (the system's San Francisco font on Apple devices, self-hosted Geist elsewhere); rounded cards
- Hero with the four headline figures and CV and contact actions
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
