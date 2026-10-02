/*
 * The app's animated FLOW backdrop, as a fixed full-page WebGL canvas.
 *
 * A direct port of pnyx-native/src/components/FlowBackground.tsx (itself a
 * port of FeralUI's FLOW recipe): four colour blobs orbit slowly, the plane is
 * warped and swirled around the centre, the blobs are blended by inverse
 * distance in OKLab, and static film grain is overlay-blended on top. Same
 * stops, constants and clock as the app — keep the two in step.
 *
 * Without WebGL the body's fallback grey (styles.css) shows instead. With
 * reduced motion it paints one still frame.
 */
(function () {
  "use strict";

  var STOPS = ["#FFFFFF", "#B8B8B8", "#DDDDD6", "#A6A6A6"];
  /** FeralUI's clock: `speed / 100 * 1.2` units per second, from the recipe's saved startT. */
  var START_T = 36.8185668799998;
  var RATE = (30 / 100) * 1.2;

  var VERT = "attribute vec2 a_pos; void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 u_res;",
    "uniform float u_time;",
    "uniform vec3 u_c0;",
    "uniform vec3 u_c1;",
    "uniform vec3 u_c2;",
    "uniform vec3 u_c3;",
    "",
    "const float ZOOM = 1.0;",
    "const float DISTORTION = 0.6;",
    "const float SWIRL = 0.1;",
    "const float HALF_POWER = 1.75;",
    "const float GRAIN = 0.075;",
    "",
    "float smooth01(float x) { float t = clamp(x, 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }",
    "",
    "vec2 orbit(float k, float t) {",
    "  float n = k * 0.37;",
    "  float a = 0.6 + fract(k / 3.0) * 0.9;",
    "  float o = 0.8 + fract((k + 1.0) / 4.0);",
    "  return vec2(0.5 + 0.5 * sin(t * a + n), 0.5 + 0.5 * cos(t * o + n * 1.5));",
    "}",
    "",
    "float weight(vec2 p, vec2 c) {",
    "  vec2 d = p - c;",
    "  return 1.0 / (pow(dot(d, d), HALF_POWER) + 1e-4);",
    "}",
    "",
    // x*x*x rather than pow(x, 3.0): GLSL's pow is undefined for negative bases.
    "float cube(float x) { return x * x * x; }",
    "",
    "vec3 oklabToSrgb(vec3 lab) {",
    "  float l = cube(lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z);",
    "  float m = cube(lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z);",
    "  float s = cube(lab.x - 0.0894841775 * lab.y - 1.291485548 * lab.z);",
    "  vec3 lin = vec3(",
    "    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,",
    "    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,",
    "    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);",
    "  lin = max(lin, vec3(0.0));",
    "  vec3 lo = lin * 12.92;",
    "  vec3 hi = 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055;",
    "  return clamp(mix(hi, lo, step(lin, vec3(0.0031308))), 0.0, 1.0);",
    "}",
    "",
    "void main() {",
    // Skia's `pos` is top-left origin; gl_FragCoord is bottom-left.
    "  vec2 pos = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);",
    "  float t = u_time;",
    "  vec2 uv = pos / u_res;",
    "  float x = (uv.x - 0.5) / ZOOM + 0.5;",
    "  float y = (uv.y - 0.5) / ZOOM + 0.5;",
    "",
    "  float edge = smooth01(length(vec2(x - 0.5, y - 0.5)));",
    "  float inner = 1.0 - edge;",
    "  for (int i = 1; i <= 2; i++) {",
    "    float k = float(i);",
    "    x += DISTORTION * inner / k * sin(t + k * 0.4 * smooth01(y)) * cos(0.2 * t + k * 2.4 * smooth01(y));",
    "    y += DISTORTION * inner / k * cos(t + k * 2.0 * smooth01(x));",
    "  }",
    "",
    "  float swirl = -3.0 * SWIRL * edge;",
    "  float cs = cos(swirl);",
    "  float sn = sin(swirl);",
    "  vec2 p = vec2(cs * (x - 0.5) - sn * (y - 0.5) + 0.5, sn * (x - 0.5) + cs * (y - 0.5) + 0.5);",
    "",
    "  float w0 = weight(p, orbit(0.0, t));",
    "  float w1 = weight(p, orbit(1.0, t));",
    "  float w2 = weight(p, orbit(2.0, t));",
    "  float w3 = weight(p, orbit(3.0, t));",
    "  vec3 lab = (u_c0 * w0 + u_c1 * w1 + u_c2 * w2 + u_c3 * w3) / max(1e-4, w0 + w1 + w2 + w3);",
    "  vec3 base = oklabToSrgb(lab);",
    "",
    "  float g = fract(sin(dot(floor(pos), vec2(12.9898, 78.233))) * 43758.5453);",
    "  vec3 overlay = mix(2.0 * base * g, 1.0 - 2.0 * (1.0 - base) * (1.0 - g), step(0.5, base));",
    "  gl_FragColor = vec4(mix(base, overlay, GRAIN), 1.0);",
    "}",
  ].join("\n");

  /** sRGB hex → OKLab, exactly as FlowBackground.tsx's hexToOklab. */
  function hexToOklab(hex) {
    var n = parseInt(hex.slice(1), 16);
    var rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      var c = v / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    var r = rgb[0], g = rgb[1], b = rgb[2];
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
  }

  var canvas = document.createElement("canvas");
  canvas.className = "flow";
  canvas.setAttribute("aria-hidden", "true");
  var gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) return;

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("[flow] shader:", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }
  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  // One triangle that covers the whole viewport.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, "u_res");
  var uTime = gl.getUniformLocation(prog, "u_time");
  STOPS.forEach(function (hex, i) {
    gl.uniform3fv(gl.getUniformLocation(prog, "u_c" + i), hexToOklab(hex));
  });

  document.body.insertBefore(canvas, document.body.firstChild);

  // One canvas pixel per CSS pixel, like the app's per-point shader: the
  // gradient is soft anyway, the grain keeps the app's size, and a 3x phone
  // screen would otherwise shade nine times the pixels for no visible gain.
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }

  function draw(t) {
    gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // The clock only advances while the page is on screen (rAF pauses in a
  // background tab), so it resumes where it was instead of jumping ahead.
  var clock = START_T;
  var last = null;
  var raf = 0;

  function frame(now) {
    if (last !== null) clock += (Math.min(now - last, 100) / 1000) * RATE;
    last = now;
    resize();
    draw(clock);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(raf);
    last = null;
    if (reduceMotion.matches) {
      resize();
      draw(clock);
    } else {
      raf = requestAnimationFrame(frame);
    }
  }

  window.addEventListener("resize", function () {
    if (reduceMotion.matches) { resize(); draw(clock); }
  });
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", start);
  start();
})();
