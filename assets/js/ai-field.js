/* ============================================================================
   AI field: one persistent, scroll-driven world behind the whole page.
   Raw WebGL, no libraries, no assets. A dark neural network: columns of
   nodes and thin connections on two parallax depth layers, with packets of
   light travelling along the edges (an inference pass), a soft key light and
   fine grain. Energy (how bright and busy it is) follows the chapter under the
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

    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    // Does a node exist at column c, row r, and where is it (world units)?
    float exists(float c, float r){ return step(0.34, h21(vec2(c, r) * 1.37 + 3.1)); }
    float rowY(float c, float r, float sp){ return (r + (h21(vec2(r, c) + 8.3) - 0.5) * 0.46) * sp; }

    // One network layer: columns of nodes, thin connections, light pulses.
    //   cs = column spacing, sp = row spacing, lw = line width, k = brightness
    vec3 network(vec2 w, float t, float cs, float sp, float lw, float k, vec3 tint){
      float c0 = floor(w.x / cs);
      float u  = (w.x - c0 * cs) / cs;            // 0..1 across this strip
      float r0 = floor(w.y / sp);
      float line = 0.0, pulse = 0.0, node = 0.0, ring = 0.0;

      for (int i = -2; i <= 2; i++){
        float ri = r0 + float(i);
        float ei = exists(c0, ri);
        float yi = rowY(c0, ri, sp);

        // the node itself (left column), and its twin on the right column
        vec2 pl = vec2(c0 * cs, yi);
        float dl = length(w - pl);
        float nr = cs * 0.040;
        node += ei * (exp(-dl * dl / (nr * nr)) * 1.6 + exp(-dl * dl / (nr * nr * 18.0)) * 0.18);
        ring += ei * exp(-pow((dl - nr * 2.3) / (nr * 0.22), 2.0)) * 0.30;

        float er = exists(c0 + 1.0, r0 + float(i));
        float yr = rowY(c0 + 1.0, r0 + float(i), sp);
        vec2 pr = vec2((c0 + 1.0) * cs, yr);
        float dr = length(w - pr);
        node += er * (exp(-dr * dr / (nr * nr)) * 1.6 + exp(-dr * dr / (nr * nr * 18.0)) * 0.18);
        ring += er * exp(-pow((dr - nr * 2.3) / (nr * 0.22), 2.0)) * 0.30;

        for (int j = -2; j <= 2; j++){
          float rj = r0 + float(j);
          float ej = exists(c0 + 1.0, rj);
          float yj = rowY(c0 + 1.0, rj, sp);
          float id = h21(vec2(c0 * 5.1 + ri, rj * 3.7 + 1.3));
          float on = ei * ej * step(0.64, id) * step(abs(float(j - i)), 1.0);

          float slope = (yj - yi) / cs;
          float d = abs(w.y - (yi + (yj - yi) * u)) / sqrt(1.0 + slope * slope);
          float l = exp(-d * d / (lw * lw));
          line += on * l * 0.50;

          // a packet of light travelling along selected connections
          float live = step(0.70, h21(vec2(id * 91.7, c0 + ri)));
          float phase = fract(t * (0.10 + 0.08 * id) + id * 7.0);
          float g = exp(-pow((u - phase) * 4.6, 2.0));
          pulse += on * live * l * g * 3.2;
        }
      }
      return tint * (line + node + ring) * k + vec3(0.80, 0.93, 1.0) * pulse * k;
    }

    void main(){
      float asp = uRes.x / uRes.y;
      vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
      vec2 uv = gl_FragCoord.xy / uRes;
      float t = uTime;
      vec2 m = uMouse;

      // ground: near-black, a cold key light from the upper right
      vec3 col = mix(vec3(0.008, 0.012, 0.026), vec3(0.003, 0.005, 0.012), uv.y);
      col += vec3(0.016, 0.040, 0.100) * exp(-length(p - vec2(0.50 * asp, 0.32)) * 1.4);

      // calmer on the left where the type sits
      float lane = 0.30 + 0.70 * smoothstep(-0.36 * asp, 0.40 * asp, p.x);

      // far layer: small, dim, slow. near layer: larger, brighter, moves more.
      vec2 wf = p + vec2(t * 0.006, uScroll * 0.32) + m * 0.020 + vec2(3.7, 0.0);
      col += network(wf, t, 0.34, 0.11, 0.0036, 0.30, vec3(0.30, 0.52, 1.00)) * lane;

      vec2 wn = p * 0.92 + vec2(t * 0.010, uScroll * 0.80) + m * 0.055;
      col += network(wn, t * 1.1, 0.62, 0.20, 0.0050, 0.70, vec3(0.46, 0.72, 1.00)) * lane;

      col *= uEnergy;

      // vignette
      col *= 1.0 - 0.50 * smoothstep(0.35, 1.25, length(uv - 0.5) * 1.6);

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
  const uRes = U("uRes"), uTime = U("uTime"), uScroll = U("uScroll"), uEnergy = U("uEnergy"), uHdr = U("uHdr"), uMouse = U("uMouse");

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
  let scale = small ? 0.45 : 0.62;                 // adaptive, see frame timing
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

  /* ------------------------------------------------------------- energy -- */
  // which chapter is under the middle of the screen decides how loud the field is
  const zones = [
    ["#top", 0.85], [".intertitle", 0.95], ["#about", 0.34], ["#career", 0.48], ["#scale", 0.40],
    ["#recognition", 0.30], ["#research", 0.32], ["#craft", 0.32], ["#contact", 0.75]
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
  let last = t0, slow = 0, fast = 0;
  const draw = (time, dt) => {
    gl.uniform1f(uTime, reduce ? 12.0 : time);
    gl.uniform1f(uScroll, scrollShown);
    gl.uniform1f(uEnergy, energy);
    gl.uniform1f(uHdr, hdr);
    gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(now - last, 100); last = now;
    scrollShown += (scrollVh - scrollShown) * (reduce ? 1 : 0.10);
    energy += (energyTarget - energy) * 0.045;
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    draw((now - t0) / 1000, dt);

    // adaptive resolution: if the shader cannot hold ~40fps, render fewer pixels
    if (dt > 26) { slow++; fast = 0; } else { fast++; slow = Math.max(0, slow - 1); }
    if (slow > 40 && scale > 0.3) { scale = Math.max(0.3, scale * 0.82); slow = 0; resize(); }
    if (fast > 600 && scale < (small ? 0.45 : 0.62)) { scale = Math.min(small ? 0.45 : 0.62, scale * 1.1); fast = 0; resize(); }
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
