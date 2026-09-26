// ============================================================
// Hero 3D centerpiece — a WebGL data-sphere. three.js is vendored locally
// (assets/js/vendor) rather than pulled from a CDN: the sandbox this site
// is built in blocks every CDN host, so a CDN <script> could never be
// tested here, and vendoring removes an external runtime dependency.
// ============================================================

const canvas = document.getElementById("hero3d");
// Matches the CSS breakpoint that hides #hero3d on phones/tablets.
const skip = !canvas || window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;

if (!skip) {
  // Imported dynamically, not statically: a static import made every phone
  // download and parse the whole 656KB library just to discover it was
  // going to skip the sphere anyway.
  import("./vendor/three.module.min.js")
    .then(init)
    .catch(() => canvas.remove());
}

function init(THREE) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.getElementById("hero");

  let renderer;
  try {
    // antialias off and dpr pinned to 1: a parameter sweep on this build
    // found those two, not geometry, dominate frame cost in software WebGL
    // (dpr 1.75 -> 1 took the scene from 27fps to 60fps).
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch (e) {
    canvas.remove(); // no WebGL — the 2D stage still carries the hero
    return;
  }
  renderer.setPixelRatio(1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  const CAM_Z = 7.5;
  camera.position.set(0, 0, CAM_Z);

  const group = new THREE.Group();
  scene.add(group);

  /* Soft round sprite so points read as glowing orbs, not hard squares. */
  function glowTexture() {
    const s = 64;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.4, "rgba(200,225,255,.7)");
    grd.addColorStop(1, "rgba(200,225,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(c);
  }
  const glow = glowTexture();

  /* Fibonacci sphere — even coverage without pole banding. */
  const COUNT = 130;
  const RADIUS = 2.35;
  const positions = new Float32Array(COUNT * 3);
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const jitter = 1 + (Math.random() - 0.5) * 0.12;
    const v = new THREE.Vector3(
      Math.cos(theta) * r * RADIUS * jitter,
      y * RADIUS * jitter,
      Math.sin(theta) * r * RADIUS * jitter
    );
    v.toArray(positions, i * 3);
    pts.push(v);
  }

  const pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pointMat = new THREE.PointsMaterial({
    size: 0.09, map: glow, transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending, color: 0xa8cbff,
  });
  group.add(new THREE.Points(pointGeo, pointMat));

  /* Near-neighbour edges — the "activation graph". */
  const LINK_DIST = 0.95;
  const edges = [];
  const linePositions = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (pts[i].distanceTo(pts[j]) < LINK_DIST) {
        edges.push([i, j]);
        linePositions.push(...pts[i].toArray(), ...pts[j].toArray());
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x5b8fd6, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  group.add(new THREE.LineSegments(lineGeo, lineMat));

  /* Faint inner core so the shell doesn't read as a flat ring head-on. */
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x3a6bd8, transparent: true, opacity: 0, wireframe: true });
  group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 1), coreMat));

  /* Activation pulses: bright signals that travel along random edges,
     brightening and fading over each trip. 16 points — negligible cost. */
  const PULSES = 16;
  const pulsePos = new Float32Array(PULSES * 3);
  const pulseCol = new Float32Array(PULSES * 3);
  const pulses = Array.from({ length: PULSES }, () => ({
    edge: edges[(Math.random() * edges.length) | 0],
    t: Math.random(),
    speed: 0.006 + Math.random() * 0.01,
  }));
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3));
  pulseGeo.setAttribute("color", new THREE.BufferAttribute(pulseCol, 3));
  const pulseMat = new THREE.PointsMaterial({
    size: 0.2, map: glow, vertexColors: true, transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  group.add(new THREE.Points(pulseGeo, pulseMat));

  function stepPulses() {
    for (let i = 0; i < PULSES; i++) {
      const p = pulses[i];
      p.t += p.speed;
      if (p.t >= 1) {
        p.t = 0;
        p.edge = edges[(Math.random() * edges.length) | 0];
      }
      const a = pts[p.edge[0]], b = pts[p.edge[1]];
      pulsePos[i * 3] = a.x + (b.x - a.x) * p.t;
      pulsePos[i * 3 + 1] = a.y + (b.y - a.y) * p.t;
      pulsePos[i * 3 + 2] = a.z + (b.z - a.z) * p.t;
      const k = Math.sin(p.t * Math.PI);
      pulseCol[i * 3] = 0.55 * k;
      pulseCol[i * 3 + 1] = 0.86 * k;
      pulseCol[i * 3 + 2] = 1.0 * k;
    }
    pulseGeo.attributes.position.needsUpdate = true;
    pulseGeo.attributes.color.needsUpdate = true;
  }

  let mouseX = 0, mouseY = 0;
  let scrollY = window.scrollY;
  let introT = reduceMotion ? 1 : 0;

  function resize() {
    // Sized to the canvas element's own sphere-sized box, not the hero:
    // every transparent pixel of a larger canvas is compositing work.
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render() {
    introT = Math.min(1, introT + 0.012);
    const ease = 1 - Math.pow(1 - introT, 3);
    pointMat.opacity = 0.9 * ease;
    lineMat.opacity = 0.22 * ease;
    coreMat.opacity = 0.1 * ease;
    pulseMat.opacity = reduceMotion ? 0 : ease;

    if (!reduceMotion) {
      /* Scroll dolly: leaving the hero, the camera pushes in toward the
         sphere and it spins up, as if flying into the network. The push
         stops where the sphere would outgrow its (deliberately small)
         canvas; a CSS scale on the element carries the rest, masked by the
         simultaneous fade. */
      const heroH = hero ? hero.clientHeight : window.innerHeight;
      const p = Math.min(1, Math.max(0, scrollY / (heroH * 0.85)));
      const pe = p * p * (3 - 2 * p);

      group.rotation.y += 0.0022 + pe * 0.014;
      group.rotation.x = Math.sin(performance.now() * 0.00015) * 0.08 + pe * 0.35;

      camera.position.x += (mouseX * 0.7 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 0.44 - camera.position.y) * 0.04;
      camera.position.z = CAM_Z - pe * 1.8;
      camera.lookAt(0, 0, 0);

      canvas.style.opacity = (1 - pe).toFixed(3);
      canvas.style.scale = (1 + pe * 0.22).toFixed(3);

      stepPulses();
    }

    renderer.render(scene, camera);
  }

  /* Start/stop, rather than "schedule the next frame while visible": the
     old version kept a stale rAF id after pausing, so its restart guard
     never fired and the sphere froze for good once scrolled past. */
  let running = false;
  let rafId = 0;
  function loop() {
    if (!running) return;
    render();
    rafId = requestAnimationFrame(loop);
  }
  function start() {
    if (running || reduceMotion) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) render();
  });
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  resize();
  render();

  // Only spend GPU time while the hero is on screen.
  if ("IntersectionObserver" in window && hero) {
    new IntersectionObserver((entries) => {
      entries[0].isIntersecting ? start() : stop();
    }).observe(hero);
  } else {
    start();
  }
}
