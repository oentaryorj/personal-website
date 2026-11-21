# Richard Oentaryo: personal site redesign

Self-authored under explicit creative delegation. Owner answers: editorial /
premium-minimal, distinct chapters, code-only visuals (no generated assets),
"use your judgment" for the rest. All facts and figures come from the existing
site; nothing invented.

## The eight topics
1. **Vibe.** Printed monograph, quiet authority, serif on paper, then ink. References (non-web): a museum catalogue, an annual-report cover, a Bloomberg Businessweek feature spread.
2. **Journey.** Title page, an intertitle, foundations (who), career rail (where), scale (the proof), recognition, research, craft, colophon.
3. **Energy curve.** Calm, calm, warm, travelling, intense, settled, curious, hands-on, still.
4. **Feeling curve and peak.** See below.
5. **Never-seen-before.** The thesis of the work (research becomes production) is performed by the page itself: scattered points self-organise into ordered grids under the visitor's own scroll.
6. **Range.** Editorial / premium-minimal.
7. **World.** Distinct chapters, hard cuts between paper and ink grounds.
8. **Assets.** The existing portrait only. Everything else is type, rules and one hand-written canvas.

## Grammar: chaptered editorial
Why the other seven lost: filmic one-shot and worldflight need footage we do not have and are the default look; live surface fits a product, not a person; the rest (specimen, cutlist, etc.) have no natural fit for a career narrated as chapters with one proof point.

## Feeling curve
| Act | Feeling | Cause |
|---|---|---|
| Title page | Composed confidence | One enormous serif name, space, a single line of claim |
| Intertitle | Anticipation | Full stop, ink ground, one sentence |
| I Foundations | Trust | Portrait in its own column, plain first-person prose |
| II Career | Momentum, breadth | Lateral travel through five stations |
| III Scale (PEAK) | Awe, then relief | 250 scattered points settle into four ordered grids and the count lands |
| IV Recognition | Quiet pride | A ledger, nothing animated beyond entry |
| V Research | Curiosity | Sticky heading, four themes passing |
| VI Craft | Agency | A pointer-driven index the visitor operates |
| Colophon | Stillness | Small type, one sentence, held |

## The peak
Chapter III, the largest span on the page. The sentence a visitor tells a friend: "It's the site where a cloud of random dots organises itself into 250 production models as you scroll."

## Tell-someone sentence
It's the site where you scroll and watch research turn into production.

## Signature move: Scatter to Grid
Bespoke canvas in `assets/js/main.js` (not an engine parameter). 250 points, one per production model. Scroll progress through the pinned chapter drives scatter, then four market clusters, then four 8x8 ordered grids, lighting points in sequence while the counter climbs to 250.

## Authored silence
The intertitle (a whole viewport with one sentence) and the colophon are deliberate stillness, not dead scroll.

## Revision 2: cinematic AI world
Owner asked for a futuristic, Netflix-like HDR background about AI, kept professional and clean. The paper/ink chapter cuts were replaced by one dark world: a persistent WebGL neural field (assets/js/ai-field.js, no generated assets). Energy follows the chapter: bright on the title and interlude, calm behind reading text, restrained behind the Scatter to Grid peak. Filaments were deliberately thinned and the left (type) side darkened after a first pass read as turbulent plasma. HDR is feature-detected and unverified on real HDR hardware.
