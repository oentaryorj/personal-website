# Richard Oentaryo — Personal Website

Source for [oentaryorj.github.io](https://oentaryorj.github.io) (once GitHub Pages is enabled) — a personal site for Richard Oentaryo, Ph.D., AI/ML leader.

## Stack

Dependency-free static site: semantic HTML, hand-written CSS, and vanilla JavaScript. No build step.

Designed with the [scroll-craft](.claude/skills/scroll-craft) skill as a chaptered editorial page:

- One persistent, scroll-driven WebGL "AI field" behind the whole page (`assets/js/ai-field.js`): a clean neural network (columns of nodes, thin connections, light pulses travelling along them like an inference pass), calmer behind text, brighter on the title and interludes. HDR highlights on HDR displays, SDR tone-mapped elsewhere, CSS gradient if WebGL is unavailable
- Title page, chapters over the field, margin folio of chapter ticks
- Lateral career rail (scroll-driven pan)
- Signature move, "Scatter to Grid": 250 points (one per production model) settle into four ordered grids as you scroll, while the count climbs to 250
- Pointer-operated expertise index (keyboard accessible tabs)
- Respects `prefers-reduced-motion`; no layout shift; no horizontal overflow on phones
- Design brief: `scrollcraft/builds/richard/BRIEF.md`

## Structure

```
index.html
assets/
  css/scrollcraft.css   # engine tokens and devices (unmodified)
  css/style.css         # this site's design
  js/scrollcraft.js     # engine (unmodified)
  js/ai-field.js        # WebGL background world
  js/main.js            # folio, Scatter to Grid, expertise index
.github/workflows/deploy.yml
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
