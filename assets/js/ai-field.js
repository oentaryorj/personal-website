/* ============================================================================
   AI field: the gateway.

   Raw WebGL, no libraries, no assets. A large hairline gate with a hologram Earth
   inside it (the continents as glowing dots from baked Natural Earth data, a
   pillar of light and a spreading ring on each of the five markets) and three
   tilted orbit rings.

   Scrolling flies you through the gate: the gate swells past the screen and a
   ribbed corridor opens beyond it. The rest of the page travels
   along that corridor, and the light at its end grows towards the close.

   It is brightest on the title, the interlude and the close, and recedes to a
   calm wash behind reading chapters so text always sits on a quiet ground.
   Reduced motion: one still frame. No WebGL: the CSS gradient stays.
   Responsive: on upright phones the gate moves above the type; the render
   scale adapts to the device's frame rate.
*/
(() => {
  "use strict";
  const canvas = document.getElementById("aiField");
  if (!canvas) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compactMQ = window.matchMedia("(max-width: 860px), (max-height: 560px)");
  const portraitMQ = window.matchMedia("(max-width: 860px) and (orientation: portrait)");

  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "default" })
    || canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "default" });
  if (!gl) return;                                   // the CSS gradient stays as the fallback

  const VERT = `
    attribute vec2 aPos;
    void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FRAG = `
    precision highp float;
    uniform vec2  uRes;
    uniform float uTime;
    uniform float uProg;      // 0 top .. 1 end of page, follows scroll
    uniform float uEnergy;    // 0..1, follows the chapter
    uniform vec2  uMouse;     // -0.5..0.5
    uniform sampler2D uLand;  // 360 x 180 land mask, row 0 = 90S, column 0 = 180W
    uniform vec4  uFree;      // x, y of the region where the scene is at full strength, softness, level outside it
    uniform vec3  uGate;      // gate centre x (aspect-scaled), centre y, radius
    uniform vec2  uFly;       // how far through the gate (0..1), and distance travelled in screens

    const vec3 cy   = vec3(0.56, 0.69, 0.84);
    const vec3 ice  = vec3(0.84, 0.90, 0.97);
    const vec3 warm = vec3(0.90, 0.94, 1.00);   // a cool white: the highlight colour

    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float ringL(float d, float R, float w){ return smoothstep(w, 0.0, abs(d - R)); }
    float segs(float a, float n, float duty, float off){
      float f = fract(a * 0.15915494 * n + off);
      return 1.0 - smoothstep(duty - 0.02, duty + 0.02, f);
    }
    float seg(vec2 p, vec2 a, vec2 b){
      vec2 pa = p - a, ba = b - a;
      return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
    }

    // ----------------------------------------------- the gate and its Earth --
    vec3 gateArt(vec2 g, float R, float t, float lift, float aa){
      float d = length(g);
      if (d > R * 1.3) return vec3(0.0);                      // nothing of the gate lives out here
      float a = atan(g.y, g.x);
      float sc = 1.0 + lift * 0.07;                    // it opens a little as you scroll
            float rot = t * 0.08 + lift * 2.6;
            float Rs = R * sc;
            float w = aa * 1.3;
            vec3 gate = vec3(0.0);
            vec3 lineCol = mix(cy, warm, 0.45 * lift);
      
            // outer bezel: a rim and two hairline rings, nothing more
            gate += cy * ringL(d, Rs, w) * 0.55;
            gate += cy * ringL(d, Rs * 0.955, w) * 0.20;
            gate += cy * ringL(d, Rs * 0.885, w) * 0.16;
      
            // three orbit rings, tilted in depth: drawn as ellipses, far side dimmer, a satellite on each
            for (int k = 0; k < 3; k++){
              float fk = float(k);
              float ro = Rs * (0.84 - fk * 0.04);
              float tilt = 0.30 + fk * 0.34;                                  // cos of the tilt: flatter ring = more tilted
              float roll = rot * (0.7 + fk * 0.35) * (mod(fk, 2.0) < 0.5 ? 1.0 : -1.0) + fk * 2.1;
              vec2 q = vec2(cos(roll) * g.x + sin(roll) * g.y, -sin(roll) * g.x + cos(roll) * g.y);
              vec2 e = vec2(q.x / ro, q.y / (ro * tilt));
              float de = (length(e) - 1.0) * ro * tilt;                       // approx pixel distance to the ellipse
              float th = atan(e.y, e.x);
              float far = 0.35 + 0.65 * smoothstep(-0.25, 0.25, sin(th));     // near side brighter
              gate += cy * smoothstep(w * 1.4, 0.0, abs(de)) * far * (0.30 - fk * 0.05);
              float sat = t * (0.55 + fk * 0.23) * (mod(fk, 2.0) < 0.5 ? 1.0 : -1.0) + fk * 1.7;
              vec2 sp = vec2(cos(sat) * ro, sin(sat) * ro * tilt);
              gate += ice * exp(-pow(length(q - sp) / (Rs * 0.014), 2.0)) * (0.5 + 0.5 * smoothstep(-0.2, 0.2, sin(sat))) * 0.8;
            }
      
            // the globe: Earth drawn as glowing dots, a faint graticule, and a pillar of light on each market
            float rS = Rs * 0.66;
            vec2 qs = g / rS;
            float rr2 = dot(qs, qs);
            float ay = 1.85 + 0.40 * sin(t * 0.16) + lift * 0.45;              // Asia faces the viewer, with a slow sway
            float ax = 0.36;
            float pxs = rS * uRes.y;                                           // pixels per sphere unit
            if (rr2 < 1.0){
              float zf = sqrt(1.0 - rr2);
              float wr = 1.5 / pxs / max(zf, 0.2);
              for (int side = 0; side < 2; side++){
                float zz = side == 0 ? zf : -zf;
                vec3 P = vec3(qs, zz);
                vec3 Q = vec3(cos(ay) * P.x + sin(ay) * P.z, P.y, -sin(ay) * P.x + cos(ay) * P.z);
                Q = vec3(Q.x, cos(ax) * Q.y - sin(ax) * Q.z, sin(ax) * Q.y + cos(ax) * Q.z);
                float lat = asin(clamp(Q.y, -1.0, 1.0)), lon = atan(Q.x, Q.z);
                float vis = side == 0 ? 1.0 : 0.20;
                float band = exp(-pow((Q.y - sin(t * 0.55) * 0.95) * 9.0, 2.0));
      
                float gs = 0.5235988;                                          // graticule every 30 degrees
                float la = abs(fract(lat / gs + 0.5) - 0.5) * gs;
                float lo = abs(fract(lon / gs + 0.5) - 0.5) * gs * max(cos(lat), 0.12);
                float grat = smoothstep(wr, 0.0, la) + smoothstep(wr, 0.0, lo) * step(abs(lat), 1.45);
      
                float stp = 0.0524;                                            // dot grid, about 3 degrees
                float row = floor(lat / stp + 0.5);
                float rowLat = row * stp;
                float cl = max(cos(rowLat), 0.08);
                float nLon = max(1.0, floor(6.2831853 * cl / stp));
                float cellLon = ((floor((lon / 6.2831853 + 0.5) * nLon) + 0.5) / nLon - 0.5) * 6.2831853;
                float dd = length(vec2(lat - rowLat, (lon - cellLon) * cl));
                float isLand = step(0.5, texture2D(uLand, vec2(cellLon / 6.2831853 + 0.5, rowLat / 3.14159265 + 0.5)).r);
                float dotM = smoothstep(stp * 0.30 + wr * 0.5, stp * 0.14, dd);
      
                gate += lineCol * grat * vis * (0.06 + 0.35 * band);
                gate += lineCol * dotM * (1.0 - isLand) * vis * 0.10;
                gate += mix(lineCol, ice, 0.45) * dotM * isLand * vis * (0.85 + 1.2 * band);
              }
              gate += lineCol * pow(1.0 - zf, 2.2) * 0.34;                     // fresnel rim glow
              gate += lineCol * 0.05;                                           // faint volume
            }
            // the five markets: a pillar of light rising from each, a bright head, a ring spreading across the surface
            for (int i = 0; i < 5; i++){
              vec2 ll = i == 0 ? vec2(1.35, 103.82) : (i == 1 ? vec2(22.32, 114.17) : (i == 2 ? vec2(23.7, 121.0) : (i == 3 ? vec2(22.5, 78.5) : vec2(-6.2, 106.85))));
              float la2 = ll.x * 0.0174533, lo2 = ll.y * 0.0174533;
              vec3 N = vec3(cos(la2) * sin(lo2), sin(la2), cos(la2) * cos(lo2));
              vec3 N1 = vec3(N.x, cos(ax) * N.y + sin(ax) * N.z, -sin(ax) * N.y + cos(ax) * N.z);
              vec3 Pn = vec3(cos(ay) * N1.x - sin(ay) * N1.z, N1.y, sin(ay) * N1.x + cos(ay) * N1.z);
              float fr = smoothstep(-0.05, 0.28, Pn.z);
              vec2 a0 = Pn.xy, b0 = Pn.xy * 1.5;
              vec2 pa = qs - a0, ba = b0 - a0;
              float hh = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
              float spike = smoothstep(1.7, 0.0, length(pa - ba * hh) * pxs) * (1.0 - hh * 0.55);
              float head = exp(-pow(length(qs - b0) * pxs / 3.4, 2.0));
              float baseG = exp(-pow(length(pa) * pxs / 4.5, 2.0));
              float u = fract(t * 0.42 + float(i) * 0.21);
              float ring = smoothstep(1.5, 0.0, abs(length(pa) - (0.03 + 0.15 * u) * max(Pn.z, 0.25)) * pxs) * (1.0 - u);
              gate += (warm * (spike * 0.95 + head * 1.7) + ice * baseG * 1.3 + cy * ring * 0.9) * fr;
            }
            gate += mix(cy * 0.5, warm, 0.7 * lift) * exp(-d / (Rs * 0.20)) * (0.14 + 0.22 * lift);   // light beyond the gate
      return gate;
    }

    // ------------------------------------------------------------- corridor --
    // What lies beyond the gate: a ribbed corridor of lit panels. Scrolling moves you along it.
    vec3 corridor(vec2 q, float trav, float t, float lift){
      float r = length(q) + 0.0006;
      float a = atan(q.y, q.x);
      float z = 0.11 / r;                                   // depth of the wall at this pixel
      float f = (z + trav * 1.2 + t * 0.10) * 2.0;          // position along the corridor, two ribs per unit
      float px = 1.5 / uRes.y;
      float wf = clamp(px * 2.0 * 0.11 / (r * r), 0.012, 0.45);
      float rib = 1.0 - smoothstep(0.0, wf, abs(fract(f) - 0.5));
      const float N = 20.0;
      float s = a * 0.15915494 * N + N;
      float ws = clamp(px / r * N * 0.15915494, 0.01, 0.4);
      float seam = 1.0 - smoothstep(0.0, ws, min(fract(s), 1.0 - fract(s)));
      vec2 cell = vec2(floor(s), floor(f));
      float cu = fract(s), cv = fract(f);
      float glowCell = 0.0;
      float hv = h21(cell + 7.1);
      if (hv > 0.88){                                        // a lit panel, steady
        float box = smoothstep(0.10, 0.20, cu) * smoothstep(0.10, 0.20, 1.0 - cu) * smoothstep(0.16, 0.30, cv) * smoothstep(0.16, 0.30, 1.0 - cv);
        glowCell = box * 0.45;
      }
      float far = smoothstep(0.015, 0.20, r);
      float near = exp(-r * 1.5);
      vec3 c = (cy * (rib * 0.42 + seam * 0.22) + ice * glowCell) * far * near;
      float end = 0.10 + 0.10 * smoothstep(0.80, 1.0, uProg);          // the light at the end of it
      c += mix(cy, warm, 0.25 + 0.6 * lift) * exp(-r / end) * (0.18 + 0.27 * lift);
      return c;
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / uRes;
      float asp = uRes.x / uRes.y;
      vec2 p = vec2((uv.x - 0.5) * asp, uv.y);
      float t = uTime;
      float lift = uProg * uProg * (3.0 - 2.0 * uProg);
      float aa = 1.5 / uRes.y;
      float fly = uFly.x;

      vec2 gc = uGate.xy + uMouse * vec2(0.022, 0.016);
      float R = uGate.z;

      // ------------------------------------------------------------ space --
      vec3 col = mix(vec3(0.020, 0.023, 0.028), vec3(0.006, 0.007, 0.009), smoothstep(0.0, 1.0, uv.y));
      float d0 = length(p - gc);
      col += vec3(0.12, 0.17, 0.24) * exp(-d0 / (R * 1.7)) * 0.40;
      col += vec3(0.30, 0.42, 0.60) * exp(-d0 / (R * 0.55)) * 0.16;

      // ----------------------------------------- cockpit, then the corridor --
      float zoom = exp(fly * 3.0);                                          // flying at the gate makes it grow past the screen
      float cockW = 1.0 - smoothstep(0.30, 0.78, fly);
      float corrW = smoothstep(0.22, 0.85, fly);
      vec3 scene = vec3(0.0);
      if (cockW > 0.001) scene += gateArt((p - gc) / zoom, R, t, lift, aa) * cockW;
      if (corrW > 0.001) scene += corridor(p - gc, uFly.y, t, lift) * corrW;
      float freeM = smoothstep(uFree.x - uFree.z, uFree.x + uFree.z, uv.x) * smoothstep(uFree.y - uFree.z, uFree.y + uFree.z, uv.y);
      scene *= mix(uFree.w, 1.0, freeM);                                    // where the type sits, the scene steps back
      col += scene;

      // --------------------------------------------- chapter energy, finish --
      vec3 wash = mix(vec3(0.030, 0.034, 0.042), vec3(0.010, 0.012, 0.015), uv.y);
      col = mix(wash, col, uEnergy);
      col *= 1.0 - 0.32 * smoothstep(0.45, 1.25, length(uv - vec2(0.5, 0.48)) * 1.5);
      float grain = h21(gl_FragCoord.xy + fract(t) * 91.0) - 0.5;
      gl_FragColor = vec4(clamp(col + grain * 0.012, 0.0, 1.0), 1.0);
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

  // land mask for the globe: 360 x 180 bits (1 degree cells), baked from Natural Earth via world-atlas
  const LAND = "/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v//////////////////////////////////////////////////////+/gAAH/////////////////////////////////////////////////////8AAAAP/////////////////////////////////////////////////////gAAAAAH///////////////h////////////////////////////////////wAAAAAAf//////////////gAAAf////////////////////////////////+AAAAAAAAH///////////+A/A/wAA///////////////////////////////8AAAAAA4Af///////////gAAAH+AA///////////////////////////////+AAAAADh/////////////AAAAB8A/////////////////////////////////+AAAAAD/////////////4AAAAAAD////////////////////////////////wAAAAAAAD////////////wAAAAAAP///////////////////////////////wAAAAAAAD/////////////gAAAAAAB//////////////////////////////wAAAAAAAAAP/Y/oAf/////4AAAAAAAP/////////////////////////////8AAAAAAAAAABmAAB8f+HB/+AAAAAAAP//////////////////////////////gAAAAAAAAAAAAAAAAAAAB+AAAAAAAB//////////////////////////////4AAAAAAAAAAAAAAAAAAH9+AAAAAAAAZ////////////w////////////////4AAAAAAAAAAAAAAAAAAA78AAAAAAAAAAA8/8///////wf/////////////+AAAAAAAAAAAAAAAAAAAAAz4AAAAAAAAAAAAAAAPz////8B/////////////wAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAf///4Af///////////AAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAA//AAAD//////////wAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAH4AAAAAAB4HgAD8AAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAOAAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAHAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAADQAAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAB/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAB//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYAAAAcAAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAQAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAgAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAABAAAAAAAAAAAAAAAAAAA//3AAAAAAAAAAAAYAAAAAAAAAAAAAAAOAAF//gAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAA/4AAAAAAAAAAAAAAf8AG//gAAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAAAAA/+AAAAAAAAAAAAAAP/AP//wAAAAAAAAAAAAAAAAAAAAAA///4AAAAAAAAAAA//AAAAAAAAAAAAAAP/////4AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAAf//8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAD//wAAAAAAAAAAAAAf/////8AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AEAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAAAAH//+AOAAAAAAAAAAB//////wAAAAAAAAAAAAAAAAAAAAAAP///4AAAAAAAAAP//+APAAAAAAAAAAA//////gAAAAAAAAAAAAAAAAAAAAAAP////AAAAAAAAAP///AfAAAAAAAAAAA//////AAAAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAP//+AfAAAAAAAAAAAf////+AAEAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAD////+AAIAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAAf///4AAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAA////APgAAAAAAAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAf////4AAAAAAAA////wPgAAAAAAAAAAAP//3wAAAACAAAAAAAAAAAAAAAAAB/////4AAAAAAAA////8PwAAAAAAAAAAAD//HwAABABAAAAAAAAAAAAAAAAAH/////4AAAAAAAA////8BwAAAAAAAAAAAD/8DgAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAA////+AwAAAAAAAAAAAA38DgAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAAf///+AQAAAAAAAAAAAAD8DAAAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAAf///+AQAAAAAAAAAAAAB+CAAAAAAAAAAAAAAAAAAAAAAAf/////+AAAAAAAAP///8AAAAAAAAAAAAAAAgCAAAAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAf///8AAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAB///////AAAAAAAAf///8AAAAAAAAAAAABCAAAGADAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///4AAAAAAAAAAAAmogAOMAAAAAAAAAAAAAAAAAAAAAD///////gAAAAAAAf///4AAAAAAAAAAB+AAAA/4AIAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAADgAAAI/8BAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAAMAAIAI/ywAAAAAAAAAAAAAAAAAAAAH//////8AAAAAAAB////4AAAAAAAAAAcAAIAD/gAAAAAAAAAAAAAAAAAAAAAD//////4AAAAAAAB////8AAAAAAAAAA8AxQif+AAAAAAAAAAAAAAAAAAAAAAH/////6AAAAAAAAD////+AAAAAAAAAB8P5wATwAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAAH/////AAAAAAAAABwP5wBwAAAAAAAAAAAAAAAAAAAAAAAD////+AAAAAAAAAH/////AAAAAAAAADwf8AAgAAAAAAAAAAAAAAAAAAAAAAAD////8AAAAAAAAAH/////gAAAAAAAAHgf88IAAAAAAAAAAAAAAAAAAAAAAAAB////8AAAAAAAAAH/////4AAAAAAAAHQf8AIAAAAAAAAAAAAAAAAAAAAAAAAB////4AAAAAAAAAD/////8AAAAAAAAMwH8AAAAAAAAAAAAAAAAAAAAAAAAAAAf///4AAAAAAAAAD/////+AAAAAAAAZgB4AAAAAAAAAAAAAAAAAAAAAAAAAAAf///wAAAAAACAA///////AAAAAAAAxgA+AAAAAAAAAAAAAAAAAAAAAAAAAAA////gAAAAAAP/B///////gAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAf/////////gAAAAMAADAAMCAAAAAAAAAAAAAAAAAAAAAAAAAE///gAAAAAAB//////////wAAAAMAAEAAALgAAAAAAAAAAAAAAAAAAAAAAAA8///AAAAAAAB//////////wAAABIAAMAAAFAAAAAAAAAAAAAAAAAAAAAAAAAyPf+AAAAAAAD//////////4AAADoAAIEACBAAAAAAAAAAAAAAAAAAAAAAAADgPfKAAAAAAAH/////////34AAADwAAIOABAAAAAAAAAAAAAAAAAAAAAAAAADABAAAAAAAAAP/////////gYAAADwAAEfgAJAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAf/////////gAAAAHwAAM/gACAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAf/////////eAAAAHwAAP/gAMAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAf////////+fgAAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAf////////8f8AAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAH/wAAAAAAAAAAAf////////4f+AAAf8AD//AAwAAAAAAAAAAAAAAAAAAAAAAf/wAAAAAAAAAAAP////////4//gAAf+AD/+AAwAAAAAAAAAAAAAAAAAAAAAD/nwAD9AAAAAAAAP////////x//4AAf/AD/8QAAAAAAAAAAAAAAAgAAAAAAAH/B4ABwAAAAAAAAP////////h//8AAf/gD/8YAAAAAAAAAAAAAAAAAAAAAAAP+A4AYAAAAAAAAAP////////j//+AAf/4H/+AAAAAAAAAAAAAAAAAAAAAAAAH+AABgAAAAAAAAAf////////n//+AD//4P//YAAAAAAAAAAAAAAAAAAAAAAAP8AAuAAAAAAAAAAP////////H///AD///v///ggAAAAAAAAAAAAAAAAAAAAAf8AAAAAAAAAAAAAP////////H//+AP///////4gAAAAAAAAAAAAAAAAAAAAI/8AAAAAAAAAAAAAH///////+f/44Af///////+QAAAAAAAAAAAAAAAAAAAAJ/+AAEAAAAAAAAAAH///////+f/0B/////////+AAAAAAAAAAAAAAAAAAAAAR/+AANAAAAAAAAAAD///////8//wH//////////AAAAAAAAAAAAAAAAAAAAB3/+AAcAAAAAAAAAAB///////4//h///////////gAAAAAAAAAAAAAAAAAAAAv//AAYAAAAAAAAAAAf//////9//H///////////wAAAAAAAAAAAAAAAAAAABP//hgYAAAAAAAAAAAP//////3//P///////////wAAAAAAAAAAAAAAAAAAACf////4AAAAAAAAAAAP////v////////////////gAAAAAAAAAAAAAAAAAAAG/////4AAAAAAAAAAAP///8P4h//////////////wCAAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAH///4GAB//////////////gDAAAAAAAAAAAAAAAAAAP/////+AAAAAAAAAAAD//+AAAB//////////////gDwAAAAAAAAAAAAAAAAA///////gAAAAAAAAAAB//8AAAA//////////////Ah2AAAAAAAAAAAAAAAAB///////wAAAAAAAAAAAj/+AAAA//////////////AYf4AAAAAAAAAAAAAAAD///////wAAAAAAAAAAAgf+ACBs//////////////g4D4AAAAAAAAAAAAAAAH///////wAAAAAAAAAAH+AAYGH///w//////////+w4A4AAAAAAAAAAAAAAAH///////4AAAAAAAAAAH/AAAHP///g//////////8BwAIAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/AMCOP///h//////////+JwAMAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/gMHfJ///x///////////v4AMAAAAAAAAAAAAAAAP////////gAAAAAAAAAH/wA8f8Ph/g////////////8AAAAAAAAAAAAAAAAAP////////gAAAAAAAAAH/4Bw/8AA/B////////////+APAAAAAAAAAAAAAAAP////////wAAAAAAAAADj/jz/8AD/H/////////////4HgAAAAAAAAAAAAAAP////////8wAAAAAAAAAB//H/+AP+P/////////////8CAAAAAAAAAAAAAAAP/////////+AAAAAAAAAB//v//Gf/B/////////////+AAAAAAAAAAAAAAAAP/////////pAAAAAAAAAD/////uP/x//////////////DAAAAAAAAAAAAAAAL/////////gCgAAAAAAAH///////////////////////iAAAAAAAAAAAAAAAH////////7gfgAAAAAAAf///////////////////////yAAAAAAAAAAAAAABv////////+MNAAAAAAAAD///////////////////////zAAAAAAAAAAAAAAC///////////MAAAAAAAAYf//////////////////////7AAAAAAAAAAAAAAD///////9///6AAAAAAAAPj//////////////////////6AAQAAAAAAAAAAAD///////x///8AAAAAAAGPz//////////////////////6AAwAAAAAAAAAABH///////x///8AAAAAAAHHAf/////////////////////6AA8AAAAAEAAAAAf///////z///4AAAAAAAHOAEDv//////////////////+AAA+AAAAABgAAAA///////8A///AAAAAAAAA8ANwH//////////////////8AAB/AAAAAAMAAAA///////wAf/8AAAAAAAAA4AO8H///////////////////AAA/gAAAAADcAAD//////4AAf/8AAAAAAAAA8AC+C///////////////////wAAfgAAAAABwAA///////4AA/94AAAAAAAAAYA5+A///////////////////4AAHAAAAAA/zAD///////gAA/4wAAAAAAAAAAB//Ab///////////////////+eDgAAAAH//z////////wAA/wAAAOAAAAAAAB//D/////////////////////+A/4AAAP///////////wAA/AAAB+AAAAAAAB/+H//////////////////////nP+AAAH///////////8AwgGAAD+AAAAAAAA//H/////////////////////////6AMAf//////////+DIA/gAH/gAAAAAAAH/z/////////////////////////+AgEf///////////zw7/AAP/gAAP4AAAB/4/+f//////////////////////8fw/////////////6AD8YAf/wAAf8AAAA/8f+D///////////////////////+4E/////////////gD/8Af//gAAIAAAAf//4+P////f/////////////////8AD////////////34Z/wA///4AAAAAAAP///+M////n/////////////////wAf////////A4CPz4H8AAP///wAAAAAAD///wADH/n3/////////////////AAB///+H//H/+PeDwf+AA3////AAAAAAA//4AAAA8fv///////////////P8AAAf+AAAAAAf+A8f//4AB////8gAAAAAAA/gAAAAAfv/////////////8AAAgAAAAAAAAPf/4O4//9AAB/////wAAAAAAAAAAADwAPb////////4m//gAAAAAAAAAAAAAfv+4+w/4gAAB/////wAAAAAAAAAAADwAHgH///////4AfwAAAAAAAAAAAAAAP8AYe+c3AAAD/////4AAAAAAAAAAAA4AAAH////++HgAOAAAAAAAAAAAAAAAAAwAAA+QAAAH/////8AAAAAAAAAAAAOAAAAP///wAAAAAAAAAAAAAAAAAAAAAH9wc374AAAf/////8AAAAAAAAAAAAH4AAAA////AAAB/gAAAAAAAAAAAAAADwDAc+f+AP///////4AAAAAAAAAAAAAB4AAAAB/8AAAAAAAAAAAAAAAAAAAAAcIAAQP/AH///////+AAAAAPCAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAcH3Hv/5////////8AAAAA/gAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAf//8A///////+AAAAB/ngAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAAAA/gf/x////////wAAAAAbgAAB4AAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAB////D//////n/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADf//8AAf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  {
    const raw = atob(LAND), px = new Uint8Array(360 * 180);
    for (let i = 0; i < px.length; i++) px[i] = (raw.charCodeAt(i >> 3) & (0x80 >> (i & 7))) ? 255 : 0;
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 360, 180, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, px);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  const U = n => gl.getUniformLocation(prog, n);
  const $ = sel => document.querySelector(sel);
  const u = { res: U("uRes"), time: U("uTime"), prog: U("uProg"), energy: U("uEnergy"), mouse: U("uMouse"), gate: U("uGate"), land: U("uLand"), free: U("uFree"), fly: U("uFly") };

  /* ------------------------------------------------------------ the gate -- */
  // Wide screens: the empty right side. Upright screens: the free sky above the
  // type. The page measures where its three open chapters put their headline and
  // fits the gate above the highest one, so it never sits behind text.
  const fitGate = () => {
    const vw = window.innerWidth, vh = window.innerHeight, asp = vw / vh;
    if (!portraitMQ.matches) {
      gl.uniform3f(u.gate, asp * 0.315, 0.62, Math.min(0.285, asp * 0.178));
      gl.uniform4f(u.free, 0.60, 0.0, 0.06, 0.30);
      return;
    }
    const sy = window.scrollY, docMax = document.documentElement.scrollHeight - vh;
    const docTop = el => el.getBoundingClientRect().top + sy;
    let top = vh * 0.62;
    const hero = $(".hero__name"), inter = $(".intertitle__line"), close = $(".contact__title");
    if (hero) top = Math.min(top, docTop(hero));
    if (inter) { const sec = inter.closest(".intertitle"); top = Math.min(top, docTop(inter) - docTop(sec)); }
    if (close) top = Math.min(top, docTop(close) - docMax);
    const limitY = 1 - top / vh;                            // the type starts below this line (0..1 from the bottom)
    const R = Math.max(0.06, Math.min(0.21, asp * 0.46, (0.985 - limitY + 0.03) / 2.13));   // as big as the sky allows
    gl.uniform3f(u.gate, 0, 0.985 - R * 1.13, R);
    gl.uniform4f(u.free, 0.0, limitY - 0.005, 0.05, 0.28);   // full strength in the free sky, dimmed behind the headline
  };

  /* ---------------------------------------------------------- resolution -- */
  let maxScale = 0.8, scale = 0.8;
  const resize = () => {
    maxScale = compactMQ.matches ? 0.65 : 0.8;
    scale = Math.min(scale, maxScale);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const w = Math.max(2, Math.round(window.innerWidth * dpr * scale));
    const h = Math.max(2, Math.round(window.innerHeight * dpr * scale));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.res, w, h);
    fitGate();
    if (drawnAt) draw(drawnAt);                      // resizing clears the buffer: repaint at once so it never flashes black
  };

  /* ------------------------------------------------------------- energy -- */
  // Bright where the page leaves the scene uncovered (title, interlude, close),
  // a faint wash everywhere else.
  const zones = [$("#top"), $(".intertitle"), $("#contact")].filter(Boolean);
  const PEAK = 1, FLOOR = 0.2;

  let energy = FLOOR, energyTarget = FLOOR, scr = 0, scrShown = 0, mx = 0, my = 0, tx = 0, ty = 0;
  let zoneDirty = true, visible = !document.hidden, raf = 0, last = 0;
  const t0 = performance.now();

  // Where each bright zone sits in the document, measured on resize and load, so a scroll
  // frame never has to ask the browser for layout.
  let zoneBox = [];
  const measureZones = () => {
    const sy = window.scrollY;
    zoneBox = zones.map(el => { const r = el.getBoundingClientRect(); return { top: r.top + sy, bottom: r.bottom + sy }; });
  };
  const pickZone = () => {
    zoneDirty = false;
    const vh = window.innerHeight, sy = window.scrollY;
    let covered = 0;
    for (const z of zoneBox) covered += Math.max(0, Math.min(z.bottom - sy, vh) - Math.max(z.top - sy, 0)) / vh;
    energyTarget = FLOOR + (PEAK - FLOOR) * Math.pow(Math.min(1, covered), 2);
  };
  let docMax = 1;
  const measureDoc = () => { docMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); measureZones(); };
  const measureProg = () => { scr = Math.min(1, Math.max(0, window.scrollY / docMax)); };

  let drawnAt = 0;
  const draw = (time) => {
    drawnAt = time;
    gl.uniform1f(u.time, time);
    gl.uniform1f(u.prog, scrShown);
    const travel = scrShown * docMax / window.innerHeight;           // screens scrolled, smoothed
    gl.uniform2f(u.fly, Math.min(1, Math.max(0, (travel - 0.1) / 1.3)), travel);
    gl.uniform1f(u.energy, energy);
    gl.uniform2f(u.mouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // reduced motion: a single still frame, redrawn when the chapter changes
  const drawStill = () => { measureDoc(); pickZone(); measureProg(); scrShown = scr; energy = energyTarget; draw(6.0); };

  // Full rate while the page is moving or the scene is the star (title, interlude, close);
  // about 30fps when it is only breathing behind reading text.
  const IDLE_SLOW = 20000, IDLE_STOP = 120000;
  let slow = 0, fast = 0, scrollAt = -1e9, activeAt = 0;
  const frame = (now) => {
    raf = 0;
    if (!visible) return;
    // Nobody is interacting: ease off, then stop. A page left open for hours must not keep the GPU busy.
    const idle = now - activeAt;
    if (idle > IDLE_STOP) return;                                   // paused; any scroll, touch or key wakes it
    const resting = idle > IDLE_SLOW;
    const busy = !resting && (now - scrollAt < 250 || energy > 0.6 || Math.abs(tx - mx) + Math.abs(ty - my) > 0.002);
    if (!busy && now - last < (resting ? 83 : 32)) { raf = requestAnimationFrame(frame); return; }
    const dt = Math.min(now - last, 100);
    last = now;
    if (zoneDirty) pickZone();
    scrShown += (scr - scrShown) * 0.06;
    energy += (energyTarget - energy) * 0.07;
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    draw((now - t0) / 1000);

    // adaptive resolution: if the shader cannot hold ~40fps, render fewer pixels
    if (dt > (busy ? 26 : 50)) { slow++; fast = 0; } else { fast++; slow = Math.max(0, slow - 1); }
    if (slow > 40 && scale > 0.4) { scale = Math.max(0.4, scale * 0.85); slow = 0; resize(); }
    else if (fast > 600 && scale < maxScale) { scale = Math.min(maxScale, scale * 1.1); fast = 0; resize(); }

    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (reduce) { drawStill(); return; }
    activeAt = performance.now();
    if (!raf && visible && !lost) { last = activeAt; raf = requestAnimationFrame(frame); }
  };

  window.addEventListener("scroll", () => { measureProg(); zoneDirty = true; scrollAt = performance.now(); wake(); }, { passive: true });
  // Mobile browsers fire resize each time the address bar slides. Reallocating the GL buffer for that
  // is wasted work (and memory churn over a long session), so only a real change in size is acted on.
  let vw = window.innerWidth, vh = window.innerHeight, resizeT = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const w = window.innerWidth, h = window.innerHeight;
      if (w === vw && Math.abs(h - vh) < vh * 0.2) { measureDoc(); measureProg(); zoneDirty = true; wake(); return; }
      vw = w; vh = h;
      resize(); measureDoc(); measureProg(); zoneDirty = true; wake();
    }, 200);
  });
  window.addEventListener("touchstart", wake, { passive: true });
  window.addEventListener("keydown", wake);
  let lost = false;                                  // the GPU can take the context back (memory pressure, long sessions)
  canvas.addEventListener("webglcontextlost", e => {
    e.preventDefault(); lost = true;
    cancelAnimationFrame(raf); raf = 0;
    canvas.style.display = "none";                   // the dark page background shows through
  });
  canvas.addEventListener("webglcontextrestored", () => location.reload());
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) wake(); });
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", e => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = 0.5 - e.clientY / window.innerHeight;
      wake();
    }, { passive: true });
  }

  measureDoc();
  measureProg();
  scrShown = scr;
  gl.uniform1i(u.land, 0);
  resize();
  document.documentElement.classList.add("has-field");
  const refit = () => { fitGate(); measureDoc(); measureProg(); zoneDirty = true; wake(); };
  window.addEventListener("load", refit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
  wake();
})();
