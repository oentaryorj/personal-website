/* ============================================================================
   AI field: a transformer, drawn as a self-attention matrix.

   Raw WebGL, no libraries, no assets. A causal attention map (tokens on both
   axes, the upper triangle masked, an attention sink on the first token) in a
   stacked deck of layers. An autoregressive pass fills the matrix one row at a
   time: each new token attends back across the keys, then joins the sequence.
   Scrolling advances which attention head is shown.

   The diagram only ever lives in empty space (see REGION) and is switched off,
   with the loop stopped, in every chapter that carries reading text.

   HDR: on displays that report (dynamic-range: high), in browsers that expose
   canvas HDR, highlights may exceed SDR white. Feature-detected and guarded;
   anything that fails falls back to SDR, then to the CSS gradient.
   ========================================================================== */
(() => {
  "use strict";
  const canvas = document.getElementById("aiField");
  if (!canvas) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stripMQ = window.matchMedia("(max-width: 860px) and (orientation: portrait)");   // phones held upright
  const compactMQ = window.matchMedia("(max-width: 860px), (max-height: 560px)");        // lighter render

  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "high-performance" })
    || canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "high-performance" });
  if (!gl) return;                                  // the CSS gradient stays as the fallback

  const ROW_SECONDS = 0.5;                          // time to generate one token
  let tokens = 12, maxScale = 0.9, disabled = false;

  const VERT = `
    attribute vec2 aPos;
    void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FRAG = `
    precision highp float;
    uniform vec2  uRes;
    uniform float uTime;
    uniform float uScroll;   // scroll position in viewport heights
    uniform float uEnergy;   // 0..1, follows the chapter
    uniform float uHdr;      // 0 = SDR tone map, 1 = allow highlights above white
    uniform vec2  uMouse;    // -0.5..0.5
    uniform vec4  uRegion;
    uniform float uN;        // tokens per side
    uniform float uRowSec;
    uniform float uCycle;

    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    float sdBox(vec2 p, vec2 b, float r){
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }

    // attention weight of query i on key j: local, a sink on token 0, a few
    // long-range spikes. Causal: nothing above the diagonal.
    float attn(float i, float j, float seed){
      float d = i - j;
      float local = exp(-d * 0.75) * 0.85;
      float sink  = step(j, 0.5) * 0.5;
      float spike = step(0.85, h21(vec2(i, j) + seed * 7.13)) * 0.8;
      return (local + sink + spike) * step(0.0, d);
    }
    float head(float i, float j, float s){
      float s0 = floor(s);
      return mix(attn(i, j, s0), attn(i, j, s0 + 1.0), smoothstep(0.3, 0.7, fract(s)));
    }

    // one attention matrix. front = 1 runs the autoregressive pass; the layers
    // behind it are drawn complete and dim.
    vec3 matrixLayer(vec2 g, float aa, float seed, float front, float cyc, float cur){
      vec2 id = floor(g);
      vec2 f = fract(g) - 0.5;
      float i = uN - 1.0 - id.y;
      float j = id.x;
      float cell = smoothstep(aa, -aa, sdBox(f, vec2(0.40), 0.12));
      float a = head(i, j, seed);

      float done = mix(1.0, step(i + 0.5, cur), front);
      float act  = front * step(abs(i - cur), 0.5);
      float sweep = fract(cyc) * (i + 1.0);
      float lit = act * step(j, sweep);

      float v = a * (done * 0.72 + lit * 1.55);
      v += act * step(abs(i - j), 0.5) * 0.55;                      // the query token itself
      float live = step(j, i + 0.5);
      vec3 cool = vec3(0.34, 0.58, 1.00);
      vec3 hot  = vec3(0.85, 0.95, 1.00);
      vec3 col = mix(cool, hot, clamp(v - 0.55, 0.0, 1.0)) * v * cell;
      col += cool * cell * (0.065 * live + 0.022 * (1.0 - live));    // empty cell and masked cell
      return col;
    }

    // a token: a short bar, lit once it exists, brightest while it is the newest
    float tokenBar(vec2 p, float len){ return smoothstep(0.02, -0.02, sdBox(p, vec2(len, 0.075), 0.07)); }

    void main(){
      vec2 uv = gl_FragCoord.xy / uRes;
      vec3 base = mix(vec3(0.008, 0.012, 0.026), vec3(0.003, 0.005, 0.012), uv.y);

      vec2 rc = vec2(uRegion.x + uRegion.z, uRegion.y + uRegion.w) * 0.5;
      vec2 rs = vec2(uRegion.z - uRegion.x, uRegion.w - uRegion.y) * uRes;
      vec2 q = (gl_FragCoord.xy - rc * uRes) / (rs * 0.5);                 // -1..1 inside the region
      if (abs(q.x) > 1.0 || abs(q.y) > 1.0){ gl_FragColor = vec4(base, 1.0); return; }

      float k = min(rs.x / 1.40, rs.y / 1.30);                              // pixels per design unit
      // the matrix is 1 x 1; the axes and the deck extend it, so centre the whole
      vec2 w = (gl_FragCoord.xy - rc * uRes) / k + vec2(-0.02, 0.075);
      float aa = uN / k * 0.75;

      float cyc = uTime / uRowSec;
      float phase = mod(cyc, uCycle);
      float cur = floor(phase);
      float fade = 1.0 - smoothstep(uN + 3.0, uN + 4.6, phase);
      float seed = uScroll * 0.7;

      vec3 col = vec3(0.0);
      vec2 g = (w + 0.5) * uN;                                              // matrix cells, 0..N
      float inFront = step(0.0, g.x) * step(g.x, uN) * step(0.0, g.y) * step(g.y, uN);

      if (inFront > 0.5){
        col += matrixLayer(g, aa, seed, 1.0, cyc, cur) * fade;
      } else {
        // the deck behind: two more layers peeking out above and to the right
        for (int l = 1; l <= 2; l++){
          float fl = float(l);
          vec2 off = vec2(0.055, 0.055) * fl + uMouse * 0.012 * fl;
          vec2 gb = (w - off + 0.5) * uN;
          float inB = step(0.0, gb.x) * step(gb.x, uN) * step(0.0, gb.y) * step(gb.y, uN);
          if (inB > 0.5) col += matrixLayer(gb, aa, seed + 17.0 * fl, 0.0, cyc, cur) * (0.34 / fl);
        }
      }

      // token axes: left (queries) and top (keys)
      if (g.y >= 0.0 && g.y <= uN && g.x < -0.1 && g.x > -2.2){
        float i = uN - 1.0 - floor(g.y);
        float len = 0.20 + 0.70 * h21(vec2(i, 3.1));
        float bar = tokenBar(vec2(g.x + 0.2 + len, fract(g.y) - 0.5), len);
        float exists = step(i, cur);
        float newest = step(abs(i - cur), 0.5);
        col += mix(vec3(0.34, 0.58, 1.0), vec3(0.85, 0.95, 1.0), newest) * bar * (0.10 + 0.40 * exists + 0.5 * newest) * fade;
      }
      if (g.x >= 0.0 && g.x <= uN && g.y > uN + 0.1 && g.y < uN + 2.2){
        float j = floor(g.x);
        float len = 0.20 + 0.70 * h21(vec2(j, 9.7));
        float bar = tokenBar(vec2(g.y - uN - 0.2 - len, fract(g.x) - 0.5), len);
        float exists = step(j, cur);
        float newest = step(abs(j - cur), 0.5);
        col += mix(vec3(0.34, 0.58, 1.0), vec3(0.85, 0.95, 1.0), newest) * bar * (0.10 + 0.40 * exists + 0.5 * newest) * fade;
      }

      // soft wash behind the diagram, then fade the region's edge to nothing
      float edge = smoothstep(1.0, 0.74, abs(q.x)) * smoothstep(1.0, 0.74, abs(q.y));
      col += vec3(0.016, 0.040, 0.100) * exp(-dot(q, q) * 3.2) * 1.2;
      col = base + col * edge;

      col = base + (col - base) * uEnergy;
      col *= 1.0 - 0.35 * smoothstep(0.35, 1.25, length(uv - 0.5) * 1.6);

      vec3 sdr = 1.0 - exp(-col * 1.25);
      vec3 hdr = col / (1.0 + col * 0.10) * 1.35;
      col = mix(sdr, hdr, uHdr);

      float grain = h21(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5;
      gl_FragColor = vec4(max(col + grain * 0.010, 0.0), 1.0);
    }`;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return; }
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = n => gl.getUniformLocation(prog, n);
  const $ = sel => document.querySelector(sel);
  const u = {
    res: U("uRes"), time: U("uTime"), scroll: U("uScroll"), energy: U("uEnergy"), hdr: U("uHdr"), mouse: U("uMouse"),
    region: U("uRegion"), n: U("uN"), cycle: U("uCycle")
  };
  gl.uniform1f(U("uRowSec"), ROW_SECONDS);

  // Where the diagram may live (x0,y0,x1,y1 in 0..1, y up) and how detailed it is.
  // Upright phones get a strip above the type, if the screen is tall enough to have one;
  // everything else gets the empty right side. Recomputed on resize and rotation.
  const layout = () => {
    const strip = stripMQ.matches;
    tokens = compactMQ.matches ? 10 : 12;
    maxScale = compactMQ.matches ? 0.75 : 0.9;
    disabled = strip && window.innerHeight < 600;
    const r = strip ? [0.0, 0.76, 1.0, 0.99] : [0.62, 0.07, 0.99, 0.93];
    gl.uniform4f(u.region, r[0], r[1], r[2], r[3]);
    gl.uniform1f(u.n, tokens);
    gl.uniform1f(u.cycle, tokens + 5);               // fill, hold, fade
  };

  /* ---------------------------------------------------- HDR, best effort -- */
  let hdr = 0;
  const tryHdr = (w, h) => {
    try {
      if (!window.matchMedia("(dynamic-range: high)").matches) return 0;
      if (!("configureHighDynamicRange" in canvas) || !gl.drawingBufferStorage) return 0;
      if ("drawingBufferColorSpace" in gl) gl.drawingBufferColorSpace = "display-p3";
      gl.drawingBufferStorage(gl.RGBA16F, w, h);
      canvas.configureHighDynamicRange({ mode: "default" });
      return 1;
    } catch { return 0; }
  };
  if ("drawingBufferColorSpace" in gl) { try { gl.drawingBufferColorSpace = "display-p3"; } catch { /* stays sRGB */ } }

  /* ---------------------------------------------------------- resolution -- */
  let scale = 0.9;
  const resize = () => {
    layout();
    scale = Math.min(scale, maxScale);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(2, Math.round(window.innerWidth * dpr * scale));
    const h = Math.max(2, Math.round(window.innerHeight * dpr * scale));
    canvas.width = w;
    canvas.height = h;
    hdr = tryHdr(w, h);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.res, w, h);
  };

  /* ------------------------------------------------------------- energy -- */
  // The field belongs to the three chapters that leave the right side empty (the
  // title, the interlude, the close). Its brightness follows how much of the screen
  // they cover, raised to a power so it is already gone while the next chapter's
  // text is still entering. Every reading chapter therefore sits on a plain ground.
  const zones = [$("#top"), $(".intertitle"), $("#contact")].filter(Boolean);
  const PEAK = 0.9;

  let energy = 0, energyTarget = 0, scrollVh = 0, scrollShown = 0, mx = 0, my = 0, tx = 0, ty = 0;
  let zoneDirty = true, visible = !document.hidden, raf = 0, last = 0;
  const t0 = performance.now();

  const pickZone = () => {
    zoneDirty = false;
    if (disabled) { energyTarget = 0; return; }
    const vh = window.innerHeight;
    let covered = 0;
    for (const el of zones) {
      const r = el.getBoundingClientRect();
      covered += Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh;
    }
    const e = PEAK * Math.pow(Math.min(1, covered), 4);
    energyTarget = e < 0.01 ? 0 : e;
  };

  const draw = (time) => {
    gl.uniform1f(u.time, time);
    gl.uniform1f(u.scroll, scrollShown);
    gl.uniform1f(u.energy, energy);
    gl.uniform1f(u.hdr, hdr);
    gl.uniform2f(u.mouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // reduced motion: one still frame with the pass complete, redrawn when the chapter changes
  const drawStill = () => { pickZone(); energy = energyTarget; draw((tokens + 1) * ROW_SECONDS); };

  let slow = 0, fast = 0;
  const frame = (now) => {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(now - last, 100);
    last = now;
    if (zoneDirty) pickZone();
    scrollShown += (scrollVh - scrollShown) * 0.1;
    energy += (energyTarget - energy) * 0.06;
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;

    if (energyTarget === 0 && energy < 0.004) {       // nothing to show: draw one empty frame and stop
      energy = 0;
      draw((now - t0) / 1000);
      return;
    }
    draw((now - t0) / 1000);

    // adaptive resolution: if the shader cannot hold ~40fps, render fewer pixels
    if (dt > 26) { slow++; fast = 0; } else { fast++; slow = Math.max(0, slow - 1); }
    if (slow > 40 && scale > 0.4) { scale = Math.max(0.4, scale * 0.85); slow = 0; resize(); }
    else if (fast > 600 && scale < maxScale) { scale = Math.min(maxScale, scale * 1.1); fast = 0; resize(); }

    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (reduce) { drawStill(); return; }
    if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); }
  };

  window.addEventListener("scroll", () => { scrollVh = window.scrollY / window.innerHeight; zoneDirty = true; wake(); }, { passive: true });
  window.addEventListener("resize", () => { resize(); zoneDirty = true; wake(); });
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) wake(); });
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", e => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = 0.5 - e.clientY / window.innerHeight;
      if (energyTarget > 0) wake();
    }, { passive: true });
  }

  scrollVh = scrollShown = window.scrollY / window.innerHeight;
  resize();
  document.documentElement.classList.add("has-field");
  wake();
})();
