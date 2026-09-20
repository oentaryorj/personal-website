# Richard Oentaryo — Personal Website

Source for [oentaryorj.github.io](https://oentaryorj.github.io) (once GitHub Pages is enabled) — a personal site for Richard Oentaryo, Ph.D., AI/ML leader.

## Stack

Dependency-free static site: semantic HTML, hand-written CSS (no framework), and vanilla JavaScript for interactions — no build step required.

- Custom cursor + scroll progress bar
- Canvas-based animated neural-network hero background
- Scroll-triggered reveal animations (`IntersectionObserver`)
- Animated counters, typed role text, skill bars, timeline
- Fully responsive, respects `prefers-reduced-motion`

## Structure

```
index.html
assets/
  css/style.css
  js/main.js
  favicon.svg
.github/workflows/deploy.yml   # GitHub Pages deploy
```

## Local preview

Any static server works, e.g.:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deployment

Pushing to `master` (this repo's default branch) triggers `.github/workflows/deploy.yml`, which publishes the repo root to GitHub Pages. Enable Pages in the repo settings with source set to **GitHub Actions**.

## Content

Profile details (roles, education, publications, awards) are sourced from publicly available profiles (LinkedIn, Google Scholar, ResearchGate, GitHub). Update `index.html` directly to refresh content — there is no CMS or data layer.
