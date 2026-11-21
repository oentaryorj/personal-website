# Richard Oentaryo — Personal Website

Source for [oentaryorj.github.io](https://oentaryorj.github.io) (once GitHub Pages is enabled) — a personal site for Richard Oentaryo, Ph.D., AI/ML leader.

## Stack

Dependency-free static site: semantic HTML, hand-written CSS, and vanilla JavaScript. No build step.

Designed with the [scroll-craft](.claude/skills/scroll-craft) skill as a chaptered editorial page:

- One persistent WebGL "AI field" behind the whole page (`assets/js/ai-field.js`): a command centre. A large ticked gate holds a hologram Earth (continents as glowing dots from a baked Natural Earth land mask, a pillar of light and a spreading ring on each of the five markets) inside three tilted orbit rings, surrounded by instruments: a row of gauges, leader lines, a radar, framed by console lips and edge rulers. Scrolling flies you through the gate: the cockpit swells past the screen and a ribbed corridor of lit panels opens beyond it; the rest of the page travels along that corridor, and the light at its end warms and grows towards the close. A targeting reticle follows the pointer on desktop and a notch on the right ruler tracks scroll position. Brightest on the title, interlude and close; a calm wash behind reading text. The gate is sized and placed from the measured position of the headlines (right side on wide screens, free sky above the type on phones and tablets), and the scene dims where type overlaps it. Kept light: no libraries or build step, about 36 KB of gzipped code in total, the shader skips pixels outside the gate and instruments, renders at about 30 fps when only breathing behind reading text, adapts its resolution to the device, and asks for the default (not high-performance) GPU. Static frame under `prefers-reduced-motion`, CSS gradient if WebGL is unavailable.
- Title page, chapters over the field, margin folio of chapter ticks
- Lateral career rail (scroll-driven pan)
- Signature move, "Asia Lights Up": a dot-matrix map of Asia (real coastlines baked into `assets/js/models.js`, sampled from Natural Earth via the `world-atlas` package) draws itself in as you scroll; Singapore, Hong Kong, Taiwan, India and Indonesia light up in turn, links open between them with packets of light, and the counter climbs to 250+
- A code-drawn visualisation for each part of the profile (`assets/js/viz.js`): a career route that a comet flies along as you scroll, with each employer lighting up when reached; a constellation of papers around the five research themes, lit by the theme on screen; an orbit system whose rings follow the discipline tabs; a recognition ledger that grows a lit spine; and a scan line over the portrait
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
  js/ai-field.js        # WebGL command centre and corridor
  js/site.js / models.js # page behaviour / the Asia map
  js/viz.js             # career route, research constellation, craft orbit, ledger spine
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

