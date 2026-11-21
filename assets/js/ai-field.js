/* ============================================================================
   AI field: one persistent, scroll-driven world behind the whole page.
   Raw WebGL, no libraries, no assets. A regular, fully connected feed-forward
   network (6 evenly spaced layers, widths 4-6-8-8-6-4) over a faint matrix
   grid, with a front of activation sweeping through it like a forward pass. Energy (how bright and busy it is) follows the chapter under the
   reader: loud on the title and interludes, calm behind reading text.

   HDR: on displays that report (dynamic-range: high) and browsers that expose
   canvas HDR, highlights are allowed above SDR white. Everywhere else the same
   scene is tone-mapped into SDR with a soft highlight roll-off. Feature-
   detected and wrapped; a failure falls back to SDR, then to the CSS gradient.
   ========================================================================== */
(() => {
  "use strict";
  const canvas = document.getElementById("aiField");
  if (!canvas) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 860px)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  let gl = null;
  try {
    gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "high-performance" })
      || canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "high-performance" });
  } catch (e) { gl = null; }
  if (!gl) return;                       // CSS gradient stays as the fallback

  const VERT = `
    attribute vec2 aPos;
    void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FRAG = `
    precision highp float;
    uniform vec2  uRes;
    uniform float uTime;
    uniform float uScroll;   // scroll position in viewport heights
    uniform float uEnergy;   // 0..1.2, follows the chapter
    uniform float uHdr;      // 0 = SDR tone map, 1 = allow highlights above white
    uniform vec2  uMouse;    // -0.5..0.5
    uniform vec4  uRegion;   // x0,y0,x1,y1 in 0..1 (y up): the only place the diagram may live

    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    // A regular feed-forward network: 6 layers, evenly spaced, fully connected.
    // Widths 4 - 6 - 8 - 8 - 6 - 4, mirrored about the centre line.
    float layerN(float l){
      if (l < 0.5) return 4.0;
      if (l < 1.5) return 6.0;
      if (l < 3.5) return 8.0;
      if (l < 4.5) return 6.0;
      return 4.0;
    }
    float nodeY(float l, float k, float sp){ return (k - (layerN(l) - 1.0) * 0.5) * sp; }

    void main(){
      vec2 uv = gl_FragCoord.xy / uRes;
      float t = uTime;

      // the diagram is fitted into its region, never the whole screen
      vec2 rc = vec2(uRegion.x + uRegion.z, uRegion.y + uRegion.w) * 0.5;
      vec2 rs = vec2(uRegion.z - uRegion.x, uRegion.w - uRegion.y) * uRes;   // pixels
      float k = min(rs.x / 1.30, rs.y / 1.15);                               // pixels per design unit
      vec2 w = (gl_FragCoord.xy - rc * uRes) / k + uMouse * vec2(0.020, 0.014);
      vec2 q = (gl_FragCoord.xy - rc * uRes) / (rs * 0.5);                   // -1..1 inside the region
      float inReg = smoothstep(1.0, 0.74, abs(q.x)) * smoothstep(1.0, 0.74, abs(q.y));
      float radial = 1.0 - smoothstep(0.50, 1.0, length(q));

      float xmin = -0.5, xmax = 0.5;
      float dx = (xmax - xmin) / 5.0;
      float sp = 0.118;                         // row spacing
      float lw = 1.7 / k, nr = 0.030;

      // the forward pass: a front of activation sweeping through the layers
      float cycle = 8.2;
      float f = mod(t * 0.85 + uScroll * 1.6, cycle) - 1.6;
      float s = (w.x - xmin) / dx;              // position in layer units, 0..5

      // ---- backdrop: a regular matrix of dots (tensor grid) ----
      vec2 gp = fract(w * 9.0 + uMouse * 0.2) - 0.5;
      float dots = smoothstep(0.075, 0.0, length(gp));
      float gl = exp(-pow(s - f, 2.0) * 0.30);
      vec3 base = mix(vec3(0.008, 0.012, 0.026), vec3(0.003, 0.005, 0.012), uv.y);
      vec3 col = base;
      col += vec3(0.016, 0.040, 0.100) * exp(-dot(q, q) * 3.2) * 1.2;
      col += vec3(0.22, 0.38, 0.85) * dots * radial * (0.060 + 0.16 * gl);

      // ---- connections between the two layers this pixel sits between ----
      float lay = clamp(floor(s), 0.0, 4.0);
      float u = clamp(s - lay, 0.0, 1.0);
      float inside = step(-0.02, s) * step(s, 5.02);
      float nl = layerN(lay), nr1 = layerN(lay + 1.0);
      float line = 0.0, glowLine = 0.0;
      for (int i = 0; i < 8; i++){
        float fi = float(i);
        if (fi < nl){
          float yi = nodeY(lay, fi, sp);
          for (int j = 0; j < 8; j++){
            float fj = float(j);
            if (fj < nr1){
              float yj = nodeY(lay + 1.0, fj, sp);
              float slope = (yj - yi) / dx;
              float d = abs(w.y - (yi + (yj - yi) * u)) / sqrt(1.0 + slope * slope);
              float l = exp(-d * d / (lw * lw));
              float wt = h21(vec2(lay * 17.0 + fi, fj * 5.0 + 2.0));   // the "weight"
              float strength = 0.035 + 0.55 * wt * wt * wt * wt;
              float band = exp(-pow((s - f) * 1.15, 2.0));
              line += l * strength;
              glowLine += l * strength * band * 3.2;
            }
          }
        }
      }
      vec3 lineCol = vec3(0.34, 0.58, 1.00);
      vec3 hotCol  = vec3(0.80, 0.93, 1.00);
      col += (lineCol * line * 0.80 + hotCol * glowLine * 0.9) * inside;

      // ---- nodes ----
      float node = 0.0, ring = 0.0;
      for (int l = 0; l < 6; l++){
        float fl = float(l);
        float nL = layerN(fl);
        float xl = xmin + dx * fl;
        float act = exp(-pow((fl - f) * 1.15, 2.0));
        for (int k = 0; k < 8; k++){
          float fk = float(k);
          if (fk < nL){
            vec2 pos = vec2(xl, nodeY(fl, fk, sp));
            float d2 = dot(w - pos, w - pos);
            float a = 0.55 + 1.9 * act;
            node += exp(-d2 / (nr * nr)) * a + exp(-d2 / (nr * nr * 16.0)) * (0.05 + 0.30 * act);
            float dd = sqrt(d2);
            ring += exp(-pow((dd - nr * 2.2) / (nr * 0.22), 2.0)) * (0.16 + 0.45 * act);
          }
        }
      }
      col += (vec3(0.62, 0.80, 1.00) * node + vec3(0.40, 0.65, 1.00) * ring) * 0.55;

      // nothing outside the region: the type area stays clean
      col = base + (col - base) * inReg;

      col *= uEnergy;

      // vignette
      col *= 1.0 - 0.35 * smoothstep(0.35, 1.25, length(uv - 0.5) * 1.6);

      // tone map. SDR: soft roll-off to white. HDR: leave headroom for the pulses.
      vec3 sdr = 1.0 - exp(-col * 1.25);
      vec3 hdr = col / (1.0 + col * 0.10) * 1.35;
      col = mix(sdr, hdr, uHdr);

      // fine grain, also dithers banding in the blacks
      float g = h21(gl_FragCoord.xy + fract(t) * 91.0) - 0.5;
      col += g * 0.010;

      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }`;

  const compile = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = n => gl.getUniformLocation(prog, n);
  const uRes = U("uRes"), uTime = U("uTime"), uScroll = U("uScroll"), uEnergy = U("uEnergy"), uHdr = U("uHdr"), uMouse = U("uMouse"), uRegion = U("uRegion");

  /* ---------------------------------------------------- HDR, best effort -- */
  let hdr = 0;
  const wantHdr = window.matchMedia && window.matchMedia("(dynamic-range: high)").matches;
  const enableHdr = (w, h) => {
    try {
      if (!wantHdr || !("configureHighDynamicRange" in canvas) || !gl.drawingBufferStorage) return 0;
      if ("drawingBufferColorSpace" in gl) gl.drawingBufferColorSpace = "display-p3";
      gl.drawingBufferStorage(gl.RGBA16F, w, h);
      canvas.configureHighDynamicRange({ mode: "default" });
      return 1;
    } catch (e) { return 0; }
  };
  if (!hdr && "drawingBufferColorSpace" in gl) { try { gl.drawingBufferColorSpace = "display-p3"; } catch (e) {} }

  /* ---------------------------------------------------------- resolution -- */
  let scale = small ? 0.6 : 0.85;                 // adaptive, see frame timing
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(2, Math.round(window.innerWidth * dpr * scale));
    const h = Math.max(2, Math.round(window.innerHeight * dpr * scale));
    canvas.width = w; canvas.height = h;
    hdr = enableHdr(w, h);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  };
  window.addEventListener("resize", resize);
  resize();

  /* ------------------------------------------------------------- region -- */
  // The diagram only ever lives in empty space: the right of the title page,
  // the interlude and the close on wide screens, the strip above the type on
  // phones. Everywhere text can sit, the field is switched off entirely.
  const region = small ? [0.0, 0.76, 1.0, 0.99] : [0.62, 0.07, 0.99, 0.93];

  /* ------------------------------------------------------------- energy -- */
  // which chapter is under the middle of the screen decides how loud the field is
  const zones = [
    ["#top", 0.90], [".intertitle", 0.90], ["#contact", 0.85],
    ["#about", 0], ["#career", 0], ["#scale", 0], ["#recognition", 0], ["#research", 0], ["#craft", 0]
  ].map(([sel, e]) => [document.querySelector(sel), e]).filter(([el]) => el);
  let energy = 1, energyTarget = 1;
  const pickEnergy = () => {
    const mid = window.innerHeight * 0.5;
    for (const [el, e] of zones) {
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) { energyTarget = e; return; }
    }
  };

  let mx = 0, my = 0, tx = 0, ty = 0;
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", e => { tx = e.clientX / window.innerWidth - 0.5; ty = 0.5 - e.clientY / window.innerHeight; }, { passive: true });
  }

  /* --------------------------------------------------------------- frame -- */
  let scrollVh = window.scrollY / window.innerHeight, scrollShown = scrollVh;
  window.addEventListener("scroll", () => { scrollVh = window.scrollY / window.innerHeight; pickEnergy(); }, { passive: true });
  pickEnergy();

  let visible = !document.hidden;
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) last = performance.now(); });

  const t0 = performance.now();
  let last = t0, slow = 0, fast = 0, blank = false;
  const draw = (time, dt) => {
    gl.uniform1f(uTime, reduce ? 12.0 : time);
    gl.uniform1f(uScroll, scrollShown);
    gl.uniform1f(uEnergy, energy);
    gl.uniform1f(uHdr, hdr);
    gl.uniform2f(uMouse, mx, my);
    gl.uniform4f(uRegion, region[0], region[1], region[2], region[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(now - last, 100); last = now;
    scrollShown += (scrollVh - scrollShown) * (reduce ? 1 : 0.10);
    energy += (energyTarget - energy) * 0.06;
    if (energy < 0.004 && energyTarget === 0) { if (!blank) { energy = 0; draw((now - t0) / 1000, dt); blank = true; } return; }
    blank = false;
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    draw((now - t0) / 1000, dt);

    // adaptive resolution: if the shader cannot hold ~40fps, render fewer pixels
    if (dt > 26) { slow++; fast = 0; } else { fast++; slow = Math.max(0, slow - 1); }
    if (slow > 40 && scale > 0.3) { scale = Math.max(0.3, scale * 0.82); slow = 0; resize(); }
    if (fast > 600 && scale < (small ? 0.6 : 0.85)) { scale = Math.min(small ? 0.6 : 0.85, scale * 1.1); fast = 0; resize(); }
  };

  if (reduce) {
    // one still frame, redrawn on scroll so chapters keep their calm/bright state
    energy = energyTarget;
    const still = () => { energy += (energyTarget - energy) * 0.25; draw(12, 16); };
    window.addEventListener("scroll", () => { scrollShown = scrollVh; still(); }, { passive: true });
    window.addEventListener("resize", () => { resize(); still(); });
    still();
  } else {
    requestAnimationFrame(frame);
  }
  document.documentElement.classList.add("has-field");
})();
