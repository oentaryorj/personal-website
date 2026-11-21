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

## Revision 3: structure over turbulence
The noise-based filaments still read as turbulent. Replaced with an analytic neural network: two parallax layers of node columns joined by thin connections (neighbouring rows only, so the flow is mostly left to right), with packets of light travelling along selected edges. Same energy-per-chapter logic and HDR path.

## Revision 4: regular shape
Owner wanted a more regular shape related to AI/ML. The scattered network became a symmetric, fully connected feed-forward diagram (6 evenly spaced layers, 4-6-8-8-6-4) over a faint regular dot matrix. Connection strength varies like trained weights (few strong, most faint); a front of activation sweeps through the layers, and scroll shifts its phase. Faint connections were thinned and the type side dimmed after the first pass competed with the text.

## Revision 5: no overlap, CV content
The diagram is confined to a region (right side on wide screens, a strip above the type on phones) and switched off entirely in every chapter with reading text, the career rail and the peak. Content was extended from the owner's CV: dated roles, real metrics, the four market names (Singapore, Hong Kong, Taiwan, India), the CV tagline as the interlude, honours, stack and community roles. Phone and email from the CV were deliberately not published on the page.

## Revision 6: the gateway
Owner asked for an entrance to the utopia of artificial intelligence based on the holographic-interface language of the Iron Man films and Jarvis, kept professional and very responsive (after rejecting a bright daybreak and then a twilight landscape). Taken as a mood, not as film artwork: no characters, logos, armour or reactor imagery. The background is a holographic gate of concentric rings above a perspective grid road running to a luminous horizon. Scroll opens the gate and warms the light beyond it (the utopia). Palette: blue-black, hologram cyan, ice white, a little warm white at the horizon. The title page gains four real figures (20 years, 250+ models, 6 agentic use cases, 40+ papers); the interlude states the thesis ("Intelligence, applied well, makes good things abundant"). Tabular and relational foundation models are listed as an emerging topic beside quantum AI. Responsiveness: the gate is placed from measured headline positions on upright screens; render scale adapts to frame rate. Verified in headless Chrome (software GL) at 1920, 1440, 768, 390, 360 and 844x390 landscape with no horizontal overflow; not verified on a real phone or HDR display.

## Revision 7: signature move becomes a map
Owner disliked the four-grid animation and asked for an Asia map highlighting the four markets. "Scatter to Grid" is replaced by "Asia Lights Up" (assets/js/models.js). Markets confirmed by the owner: Singapore, Hong Kong, Taiwan, India. Owner also did some work in Indonesia during the QuantumBlack years, shown as a quieter hollow highlight labelled "Earlier work" and mentioned on the QuantumBlack card; no per-market figures are shown because none are given. Peak sentence is now: "It's the site where Asia lights up market by market as you scroll." Map data is baked into the file (no runtime fetch, no new dependency). Verified at 1440x900, 768x1024 and 390x844.

## Revision 8: Indonesia is a live market
Owner asked to add Indonesia. It now lights up as a fifth market on the map (marker on Jakarta, whole country highlighted, linked to Singapore) and the copy says five markets (DBS facts line, scale chapter, count label, about text). The earlier "hollow, earlier work" treatment is removed; the QuantumBlack card still notes engagements in Indonesia.

## Revision 9: deeper into the holographic interface language
Owner found the flat gate "lame" and asked to borrow more from the Avengers-era Iron Man interfaces. Taken further as a genre, not as artwork (no helmet, armour, reactor, characters, logos or film names): the gate now holds a rotating wireframe globe with a node network and a scan band, three tilted orbit rings with satellites, a pointer-following targeting reticle, a screen scan line and a scroll-tracking edge ruler; hero figures and the portrait frame get glass panels with corner brackets. Readouts only show real figures already on the site. Verified at 1920, 1440, 768, 390, 360 and 844x390; not on a real phone or HDR display.


## Revision 10: hologram Earth
Gate enlarged and the wireframe globe replaced by a dotted hologram Earth facing Asia, with beacons on the five markets (baked Natural Earth land mask). New `uFree` dims the scene where headline type sits.

## Revision 11: the command centre, then the corridor
Owner supplied a Jarvis-style control-room reference and asked for the background to be an entrance from such a command centre, followed by an animated visualisation of each aspect of the profile, all generated in code. The reference is taken as a genre only: no artwork, layout, text or labels are copied.
- Feeling curve: awe at the threshold (command centre, hero) > surge (the fly-through, interlude) > calm focus (reading chapters in the corridor) > recognition (each visualisation answering its chapter) > the peak (the Asia map, unchanged, the largest span) > arrival (the light at the corridor's end warms and grows at the close).
- Background: cockpit (gate, hologram Earth, gauges, leader lines, radar, console lips, edge rulers) that the scroll flies through, then a ribbed corridor whose motion is tied to scroll distance.
- Visualisations (viz.js, all drawn from the page's own content): career route comet, research constellation lit by the theme on screen, craft orbit driven by the tabs, recognition spine, portrait scan.
- Layout fix: the research links moved out of the sticky column so the column fits every viewport.

## Revision 12: restraint and positioning
Owner asked for a premium editorial CV that does not look machine-made, positioned like a top forward-deployed AI and data science leader, in a cool (not warm) palette.
- Palette: cool graphite with one steel-blue accent; electric cyan and the warm brass trial both dropped.
- Headings: no italics anywhere, a hairline over each heading, emphasis as a quieter tone. Labels in sentence case, no chapter kickers, no colophon credit.
- Hero console calmed to one radar. Fonts self-hosted (latin subset), share card added.
- Copy: scale and impact first ("at scale", $100M+), working next to the business, team size removed. No new facts.
