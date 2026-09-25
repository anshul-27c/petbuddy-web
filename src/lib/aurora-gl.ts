/**
 * A soft, slowly moving aurora drawn with raw WebGL: four brand-coloured glows
 * drifting over a base colour, with a gentle domain warp and a little grain.
 * Loaded on demand by <ShaderBackdrop>; nothing here runs on pages without it.
 */

type Rgb = [number, number, number];

export interface AuroraPalette {
  base: Rgb;
  glows: [Rgb, Rgb, Rgb, Rgb];
  /** Strength of each glow, 0–1. */
  strength: [number, number, number, number];
}

const hex = (value: string): Rgb => {
  const n = parseInt(value.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const PALETTES = {
  day: {
    base: hex("#f8fafd"),
    glows: [hex("#5170ff"), hex("#d9e0ff"), hex("#f26a2e"), hex("#eaeeff")],
    strength: [0.26, 0.9, 0.14, 0.85],
  },
  night: {
    base: hex("#081527"),
    glows: [hex("#5170ff"), hex("#3a51d9"), hex("#f26a2e"), hex("#0e2038")],
    strength: [0.55, 0.5, 0.3, 0.6],
  },
} satisfies Record<string, AuroraPalette>;

export type AuroraTone = keyof typeof PALETTES;

const VERTEX = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_base;
uniform vec3 u_glow[4];
uniform vec4 u_strength;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float glow(vec2 p, vec2 centre, float radius) {
  float d = length(p - centre) / radius;
  return exp(-d * d * 2.2);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = u_time * 0.06;

  vec2 warp = vec2(noise(p * 1.4 + t), noise(p * 1.4 - t + 7.3)) - 0.5;
  p += warp * 0.45;

  vec2 c0 = vec2(aspect * (0.18 + 0.10 * sin(t * 1.3)), 0.78 + 0.10 * cos(t * 1.1));
  vec2 c1 = vec2(aspect * (0.80 + 0.08 * cos(t * 0.9)), 0.86 + 0.08 * sin(t * 1.4));
  vec2 c2 = vec2(aspect * (0.72 + 0.12 * sin(t * 0.7 + 1.0)), 0.16 + 0.10 * cos(t * 1.2));
  vec2 c3 = vec2(aspect * (0.30 + 0.14 * cos(t * 0.8 + 2.0)), 0.12 + 0.08 * sin(t));

  vec3 colour = u_base;
  colour = mix(colour, u_glow[1], glow(p, c1, 0.95) * u_strength.y);
  colour = mix(colour, u_glow[3], glow(p, c3, 0.90) * u_strength.w);
  colour = mix(colour, u_glow[0], glow(p, c0, 0.80) * u_strength.x);
  colour = mix(colour, u_glow[2], glow(p, c2, 0.70) * u_strength.z);

  colour += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.012;
  gl_FragColor = vec4(colour, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Pixel budget: the glows are soft, so half resolution looks the same and costs a quarter. */
const RESOLUTION_SCALE = 0.5;
const MAX_PIXEL_RATIO = 1.5;
const FRAME_MS = 1000 / 30;

/**
 * Starts drawing into `canvas`. Pauses while the canvas is off-screen or the
 * tab is hidden; with `animate: false` it draws one still frame. Returns a
 * stop function, or null when WebGL is unavailable (the CSS fallback stays).
 */
export function startAurora(
  canvas: HTMLCanvasElement,
  { tone, animate, onReady }: { tone: AuroraTone; animate: boolean; onReady: () => void },
): (() => void) | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const palette = PALETTES[tone];
  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const uTime = gl.getUniformLocation(program, "u_time");
  gl.uniform3fv(gl.getUniformLocation(program, "u_base"), palette.base);
  gl.uniform3fv(gl.getUniformLocation(program, "u_glow"), palette.glows.flat());
  gl.uniform4fv(gl.getUniformLocation(program, "u_strength"), palette.strength);

  // Each backdrop starts at a different point in its loop.
  const offset = Math.random() * 60;
  let visible = true;
  let frame = 0;
  let last = 0;
  let ready = false;
  let stopped = false;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO) * RESOLUTION_SCALE;
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uResolution, width, height);
    }
  };

  const draw = (now: number) => {
    resize();
    gl.uniform1f(uTime, offset + now / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!ready) {
      ready = true;
      onReady();
    }
  };

  const loop = (now: number) => {
    frame = 0;
    if (stopped || !visible || document.hidden) return;
    if (now - last >= FRAME_MS) {
      last = now;
      draw(now);
    }
    frame = requestAnimationFrame(loop);
  };

  const wake = () => {
    if (!animate) {
      if (!ready) draw(0);
      return;
    }
    if (!frame && visible && !document.hidden && !stopped) frame = requestAnimationFrame(loop);
  };

  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    wake();
  });
  observer.observe(canvas);

  const resizeObserver = new ResizeObserver(() => {
    if (!animate) draw(0);
  });
  resizeObserver.observe(canvas);

  const onVisibility = () => wake();
  document.addEventListener("visibilitychange", onVisibility);

  const onLost = (event: Event) => {
    event.preventDefault();
    stopped = true;
  };
  canvas.addEventListener("webglcontextlost", onLost);

  wake();

  return () => {
    stopped = true;
    if (frame) cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onLost);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
