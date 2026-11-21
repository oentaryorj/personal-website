/* ============================================================================
   AI field: one persistent, scroll-driven world behind the whole page.
   Raw WebGL, no libraries, no assets. A dark volume of neural filaments and
   node glints with parallax depth, a soft key light, anamorphic streak and
   film grain. Energy (how bright and busy it is) follows the chapter under the
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

    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p){
      float a = 0.5, s = 0.0;
      for (int i = 0; i < 4; i++){ s += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; }
      return s;
    }

    // thin luminous filaments: ridged noise, domain-warped
    float veins(vec2 p, float t, out float soft){
      vec2 q = vec2(fbm(p + vec2(0.0, t * 0.035)), fbm(p + vec2(5.2, 1.3) - t * 0.028));
      float n = fbm(p + 1.15 * q + t * 0.02);
      float r = 1.0 - abs(n * 2.0 - 1.0);
      soft = pow(r, 6.0);
      return pow(r, 34.0);
    }

    // node glints: a core, a faint halo, a slow twinkle
    float nodes(vec2 p, float t){
      vec2 g = floor(p), f = fract(p) - 0.5;
      float h = hash(g);
      vec2 off = (vec2(hash(g + 1.7), hash(g + 9.2)) - 0.5) * 0.62;
      float d = length(f - off);
      float on = step(0.62, h);
      float tw = 0.55 + 0.45 * sin(t * (0.35 + h) + h * 40.0);
      return (exp(-d * d * 260.0) * 2.4 + exp(-d * d * 30.0) * 0.22) * on * tw;
    }

    void main(){
      float asp = uRes.x / uRes.y;
      vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
      vec2 uv = gl_FragCoord.xy / uRes;
      float t = uTime;
      vec2 m = uMouse;

      // ground: near-black with a cold blue key light from the upper right
      vec3 col = mix(vec3(0.010, 0.014, 0.028), vec3(0.004, 0.006, 0.014), uv.y);
      float key = exp(-length(p - vec2(0.52 * asp, 0.30)) * 1.5);
      col += vec3(0.022, 0.050, 0.120) * key;

      // composition: calmer on the left where the type sits
      float lane = 0.22 + 0.78 * smoothstep(-0.40 * asp, 0.46 * asp, p.x);

      float soft; float v;
      vec3 far  = vec3(0.30, 0.50, 1.00);
      vec3 mid  = vec3(0.42, 0.70, 1.00);
      vec3 near = vec3(0.80, 0.92, 1.00);

      // three depth layers, each moving at its own rate with scroll
      vec2 p0 = p * 0.95 + vec2( 0.00, uScroll * 0.55) + m * 0.04;
      v = veins(p0, t, soft);
      col += far  * (v * 1.0 + soft * 0.035) * lane;
      col += far * nodes(p * 3.0 + vec2(0.0, uScroll * 0.90) + m * 0.05, t) * 0.55 * lane;

      vec2 p1 = p * 1.6 + vec2(3.7, uScroll * 1.15) + m * 0.09;
      v = veins(p1, t * 1.15, soft);
      col += mid  * (v * 1.15 + soft * 0.03) * lane;
      col += mid * nodes(p * 5.2 + vec2(8.0, uScroll * 1.80) + m * 0.10, t * 1.2) * 0.75 * lane;

      vec2 p2 = p * 2.6 + vec2(9.1, uScroll * 2.10) + m * 0.16;
      v = veins(p2, t * 1.3, soft);
      col += near * (v * 0.9) * lane * 0.7;
      col += near * nodes(p * 7.0 + vec2(2.0, uScroll * 3.20) + m * 0.20, t * 1.4) * 0.9 * lane;

      // anamorphic streak across the key light
      float sy = p.y - 0.30 - m.y * 0.03;
      float streak = exp(-abs(sy) * 38.0) * exp(-abs(p.x - 0.30 * asp) * 0.9);
      col += vec3(0.20, 0.38, 0.95) * streak * 0.20;

      col *= uEnergy;

      // vignette
      col *= 1.0 - 0.55 * smoothstep(0.35, 1.25, length(uv - 0.5) * 1.6);

      // tone map. SDR: soft roll-off to white. HDR: leave headroom for specular.
      vec3 sdr = 1.0 - exp(-col * 1.25);
      vec3 hdr = col / (1.0 + col * 0.10) * 1.35;
      col = mix(sdr, hdr, uHdr);

      // film grain, also dithers banding in the blacks
      float g = hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5;
      col += g * 0.014;

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
