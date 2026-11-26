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

## Revision 13: a calmer entrance for senior readers
Owner asked for a better entrance for senior readers. The gauges, radar, leader lines, edge rulers, pointer reticle, scan line and portrait scan were removed (shader code included); the globe gate and the fly-through stay. Hero role and figure labels are larger, and a Download CV button sits beside Say hello so the CV is one click from the first screen.

## Revision 14: employer-first structure
Owner asked for a radical improvement aimed at top employers. The world (globe gate, corridor, Asia map peak, cool palette) was kept because the owner steered it across 13 revisions; the change is to what a hiring manager meets and how fast.
- Hero: one line of prior employers under the role (QuantumBlack, McLaren Applied, SMU), so credibility lands in the first screen.
- Persistent action: the running head now carries CV and Say hello on every chapter.
- "Selected results" (which repeated the hero figures) became "How I work": four positioning principles, each backed by a real figure from the site. No new facts.
- Career rail: each station now leads with its result (Gold Medal, 12 papers, Days to hours, 30% lower defaults, 250+ models) above the employer, so a skim reads as an outcome story. Duplicate facts removed.
- Close: a primary "Say hello on LinkedIn" button beside Download CV, replacing an inline link.
- schema.org Person data for search and recruiter tooling.
Verified in headless Chrome (software GL) at 1440x900 and 390x844, no horizontal overflow; not on a real phone.

## Revision 15: responsiveness
Owner reported the background janky on a laptop Chrome and the map slow.
- Background field: drawn at 0.6 of CSS pixels (0.5 on compact screens), never above 1 device pixel per CSS pixel (was up to 1.25 x 0.8, so about full retina resolution). Behind reading text it renders at 30fps while scrolling and 15fps otherwise; full rate only on the title, interlude and close. Adaptive resolution now backs off within about a third of a second (floor 0.32) instead of after 40 slow frames.
- Asia map: no idle loop and no ambient animation (sweep, travelling packets and pulse rings removed). It draws only when the scroll position changes, with a 150ms ease; dots are batched into a dozen fills and the settled land is a cached image; section geometry is measured on resize, not per scroll event. Chapter scroll length cut from 6.4 to 4.6 screens.
- Career route, research net and orbit canvases: 30fps, device pixel ratio capped at 1.5.
Measured in headless Chrome with software GL (hero scroll 31 to 60 fps page-wide); not measured on a real laptop GPU.

## Revision 16: less empty space on desktop
Content column widened (82rem to 98rem) with clearance kept for the chapter ticks; section padding roughly halved; interlude cut from a full screen to 62%; career cards enlarged and centred in their stage; the model chapter gives the map 8 of 12 columns; recognition gains a derived "9 honours since 2004" figure; the skills chapter's gap closed. Page height at 1440x900 dropped from 22.5 to 18.9 screens. Desktop only; phone layout untouched.

## Revision 17: 60fps target
The 30fps cap behind reading text is gone: the field now runs at the display rate whenever the page is scrolling, the pointer is moving or the scene is the star, and resolution (not frame rate) gives way: a frame over 19ms counts as slow, and 5 of them cut the pixels by 18% (floor 0.32). Only a page left still eases to 30fps, then 12fps. Ambient canvases are back to full rate. Add ?fps to the address to show the real frame rate, field scale and resolution on any machine. Measured only on software GL (58fps at the floor scale); not on a real laptop GPU.

## Revision 18: product-page system, no background animation
Owner reported the live background still janky on a laptop with the frame-rate meter on, and asked for a very professional, Apple-website-like layout on phone and desktop. The WebGL field, its fly-through and every ambient canvas (career route, research net, orbit, ledger spine) were removed; the page is now one global bar over alternating black, light grey and white sections with large sans type and rounded cards. The Asia map stays as the single signature piece, pinned for 3.2 screens and drawing only on scroll. Content and facts unchanged. Page height at 1440x900: 18.9 to 12.9 screens. Checked in headless Chrome at 1440x900 and 390x844, no horizontal overflow; not checked on the owner's laptop.

## Revision 19: Apple-style scroll motion, compositor only
Owner asked for a super-professional, Apple-like page with smooth scrolling. Kept the product-page system and added four scroll-linked moments, all CSS scroll-driven animations (view timelines) on transform and opacity, so no JavaScript runs while scrolling and the browser does the work off the main thread: the title scales back and fades as it leaves; a new black statement band (three lines from existing claims) wakes line by line at mid-screen; the portrait drifts slower than the page; the closing headline settles in. No JS smooth-scroll library was added on purpose: wheel hijacking is what makes pages feel laggy; native scrolling stays. Verified in headless Chrome at 1440x900 and 390x844; unsupported browsers show the finished state. Not checked on the owner's laptop.

## Revision 20: dark glass, from the owner's reference
Owner supplied a screenshot of a motionsites.org template (dark full-bleed hero with light streaks, glass nav pill, badge, bold headline with an accent phrase, stats row, glass cards) and asked for it to look professional and very responsive. motionsites.ai could not be fetched (network policy; the owner declined to allow it), so this follows the screenshot only. The streak hero is a pre-rendered 31 KB WebP, so there is no video and no live canvas; the only blurred element is the nav. The surfaces all go near-black with glass cards, and the accent phrase uses a red-to-pink gradient as in the reference (a deliberate exception to the earlier no-gradient-text preference, at the owner's request). Layout checked at 1920, 1440, 1024, 768, 390 and 360 wide: no horizontal overflow.

## Revision 21: five industries
Owner asked to highlight experience across finance, oil and gas, telecommunication, motorsport/transport and education. Added an Industries section (five icon cards, each tied to the role it comes from: DBS and QuantumBlack, QuantumBlack energy, QuantumBlack telecoms, McLaren Applied, NTU and SMU), named the five in the hero line, changed the career heading from four to five industries, and added them to the page description and structured data. The industry names are the owner's; each card's evidence line only restates roles already on the page.

## Revision 22: desktop tightening and scroll choreography
Owner said the desktop view looked messed up. A scroll sweep at 1366x768, 1280x720 and 1920x1080 found: dead scroll and empty frames (the three statement lines spread over a long blank stretch; the map chapter opening empty and using a narrow strip of the screen), very tall section padding, and no scroll-linked entry motion for cards. Fixes: the statement is now a pinned section whose three lines light up one after another (one named view timeline, ranges per line); the map chapter is a two-column layout (heading and counter left, map across the right two thirds), 2.6 screens long and revealing from the first frame; section padding cut by about a quarter; cards, ledger rows and headings now rise and settle on their own view timelines where supported (IntersectionObserver fallback elsewhere). All motion stays on transform and opacity. Not checked on the owner's own machine; if the layout still looks wrong there, a screenshot of the broken area is needed.

## Revision 23: forward-deployed positioning
Owner found the three giant statement lines too big and asked for a more embedded feel that sells a top-tier forward-deployed data scientist. The pinned statement is gone. In its place: a normal-scale "A forward-deployed data scientist, embedded where the work is" section with four steps (sit with the business, frame the real problem, build and ship, own the outcome), each with one proof point already on the page (five markets, 250+ models, days to hours, $100M+), a line that draws across the top as it scrolls in, and a closing line on where the owner has embedded. The hero badge now reads "Forward-deployed data scientist" and the hero line says "I embed with the business and own the result". "Top-tier" is shown through the evidence rather than claimed in words.

## Revision 24: pre-merge audit
Checked for dead code (removed an unused custom property, a stray selector and an unused id; every asset is referenced; no unused keyframes or broken anchors), accessibility and responsiveness (no horizontal overflow from 320 to 2560 wide; tap targets raised to at least 32px high; the nav links now hide below 960px so nothing pokes out at tablet width; small gradient pills darkened for contrast; one h1, no images without alt, sensible tab order), resilience (works with JavaScript off, with scroll-driven animations unsupported, and with reduced motion) and cost (about 110 KB before the lazy portrait; first paint about 70 to 190 ms; steady 16.7 ms frames through a full scroll in headless Chrome, one 54 ms long task at load). Not measured on the owner's laptop.

## Revision 25: sharp AI-themed hero art
Owner found the hero background low resolution and abstract and asked for an AI theme, still Apple-like. The 1920px blurred streak image is replaced by a rendered neural lattice at 2880x1620 (about 1,250 nodes, nearest-neighbour connections, depth of field with crisp in-focus cores and soft bokeh behind, attention-head rings, data streams, dust) in soft blue, violet and magenta with a touch of warm orange, plus a separate 1170x2100 portrait composition for phones and portrait tablets. Both are static WebP (197 KB and 108 KB) generated offline, so there is still no video, no canvas and no per-frame cost at runtime; the old 31 KB image is removed. The headline side stays dark for legibility.

## Revision 26: portrait at the top, black background
Owner asked for the photo to have a black background and sit at the top. The portrait is cut out from the existing photo (OpenCV GrabCut, cleaned to the largest piece with holes filled, 1px edge pull-in and a soft feathered edge) and exported as a transparent WebP (75 KB), so it sits on the page's black rather than the old navy box. It now leads the hero: top right over the neural background on desktop, centred above the headline on phones and portrait tablets, fading out below the shoulders and easing away as you scroll past. The About section loses its photo and becomes two text columns. The old WebP portrait is removed (the original JPG stays for the structured data). The source photo is only 760x884, so on large or retina screens it is softer than the rest; a higher resolution original would sharpen it.

## Revision 27: no overlap, cleaner hero
Owner said the background and photo should not overlap and the page should be clean, not busy. The portrait is now a grid item of the hero on its own opaque black rounded panel (soft inner glow, vignetted edges so the cutout outline never shows), so it never sits on the lattice. The lattice is dimmed (0.7 opacity plus a stronger overlay on the headline side) and shows only as a halo around the panel on desktop. Tablets in portrait and phones stack: panel first, then headline, then figures. The hero sentence is shortened. The panel's scroll-exit animation sits on the panel and the entrance animation on the image inside it, so the two never fight over the same properties.

## Revision 28: Apple-style audit
Owner said the boxed photo looked weird and asked for an Apple-level audit. Changes: the portrait panel is gone; the cutout now stands directly on the black page, large and flush to the bottom edge (side and bottom edges feathered so no crop line shows), with the figures in a tidy 2x2 grid beside it and a wider container on screens of 1500px and up; on tablets in portrait and phones it leads, then headline, then figures. The lattice no longer sits behind the hero (no overlap, less busy); it is a static glow under the closing call to action. The "How I work" section was removed because the Approach section and the hero figures already say it; the nav and skip link no longer point to it. The three old hero images are replaced by one 107 KB closing-section image. Checked at 320 to 2560 wide: no overflow; tap targets, tab order, no-JS, fallback and reduced-motion checks pass.

## Revision 29: AI design accents
Owner allowed the background to go if needed but asked for more AI character in the design. The hero stays quiet and on black; accents are vector and text only: a fine orbital neural halo (concentric rings, two tilted ellipses, about 27 nodes joined by hairlines, blue to violet to magenta strokes) behind the portrait, turning once every 120 seconds on the compositor (still under reduced motion); four glass callout chips for the fields on the page (Agentic AI, Causal AI, Foundation models, Quantum AI), shown from 1100px up and kept clear of the face; an AI sparkle in the badge; and glowing node markers along the line above the Approach steps so it reads as a pipeline. The closing-section lattice glow stays.
