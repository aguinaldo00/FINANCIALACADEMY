// Recorta la isla de Gestión Financiera generada (fondo azul marino liso), hornea sus máscaras
// (R = ventanas, G = agua) y prepara la capa de niebla. Las zonas de las cascadas son propias de
// esta imagen: para otra isla hay que ajustarlas. Después se pasan a WebP (ver docs/fase-2-arquitectura.md).
// Uso: node scripts/recortar-isla.mjs <carpeta-con-isla-gf.png-y-niebla.png> <carpeta-salida>
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const [gen, out] = process.argv.slice(2);
const W = 1024, H = 1024;
const raw = execFileSync('convert', [join(gen, 'isla-gf.png'), '-depth', '8', 'rgb:-'], { maxBuffer: 1 << 26 });
const BG = [9, 20, 37];
const N = W * H;
const d = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const r = raw[i * 3] - BG[0], g = raw[i * 3 + 1] - BG[1], b = raw[i * 3 + 2] - BG[2];
  d[i] = Math.hypot(r, g, b);
}
// Zonas de bruma de las cascadas (donde el borde debe ser suave).
const enBruma = (x, y) => (x > 120 && x < 330 && y > 420 && y < 860) || (x > 640 && x < 900 && y > 410 && y < 900);
const brumosa = (i) => {
  const r = raw[i * 3], g = raw[i * 3 + 1], b = raw[i * 3 + 2];
  return b >= r + 6 && b >= g - 4; // blanco azulado sobre azul marino: nunca roca cálida ni musgo
};
// Relleno desde el borde: lo alcanzable es fondo (o bruma); lo demás, isla maciza.
const fuera = new Uint8Array(N);
const pila = [];
const pasa = (x, y) => {
  const i = y * W + x;
  // Arriba solo hay edificios iluminados: el cielo entre torres (algo más claro por la bruma) también es fondo.
  return d[i] < (y < 330 ? 26 : 14) || (enBruma(x, y) && brumosa(i));
};
for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (pasa(x, y)) { fuera[y * W + x] = 1; pila.push(y * W + x); }
for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (pasa(x, y)) { fuera[y * W + x] = 1; pila.push(y * W + x); }
while (pila.length) {
  const i = pila.pop();
  const x = i % W, y = (i / W) | 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const j = ny * W + nx;
    if (!fuera[j] && pasa(nx, ny)) { fuera[j] = 1; pila.push(j); }
  }
}
// Alfa: macizo = 1 con un borde suavizado de ~1 px; fuera, alfa por distancia al fondo (bruma).
const macizo = new Float32Array(N);
for (let i = 0; i < N; i++) {
  // Huecos de cielo encerrados entre las torres: no los alcanza el relleno, pero son fondo.
  if (!fuera[i] && (i / W | 0) < 330 && d[i] < 22) fuera[i] = 1;
  macizo[i] = fuera[i] ? 0 : 1;
}
const suave = new Float32Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  let s = 0, n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = Math.min(W - 1, Math.max(0, x + dx)), ny = Math.min(H - 1, Math.max(0, y + dy));
    s += macizo[ny * W + nx]; n++;
  }
  suave[y * W + x] = s / n;
}
const ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const rgba = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const x = i % W, y = (i / W) | 0;
  const bruma = enBruma(x, y) ? ss(5, 150, d[i]) : ss(8, 40, d[i]) * 0.6;
  const a = Math.max(macizo[i] ? 1 : 0, Math.max(suave[i], fuera[i] ? bruma : 0));
  for (let c = 0; c < 3; c++) {
    const v = raw[i * 3 + c];
    // Quita la contaminación del fondo en los píxeles semitransparentes.
    const limpio = a > 0.02 ? (v - BG[c] * (1 - a)) / a : v;
    rgba[i * 4 + c] = Math.max(0, Math.min(255, Math.round(limpio)));
  }
  rgba[i * 4 + 3] = Math.round(a * 255);
}
execFileSync('convert', ['-size', `${W}x${H}`, '-depth', '8', 'rgba:-', join(out, 'isla-gf.png')], { input: rgba });

// Máscaras: R = ventanas y farolas encendidas (parpadeo), G = agua de las cascadas (caída).
const m = Buffer.alloc(N * 3);
for (let i = 0; i < N; i++) {
  const x = i % W, y = (i / W) | 0;
  const r = raw[i * 3], g = raw[i * 3 + 1], b = raw[i * 3 + 2];
  const lum = 0.3 * r + 0.59 * g + 0.11 * b;
  if (y < 450 && r > 200 && g > 120 && r - b > 105 && lum > 160) m[i * 3] = Math.round(255 * ss(160, 215, lum));
  const agua = ((x > 175 && x < 245 && y > 420 && y < 700) || (x > 765 && x < 835 && y > 410 && y < 720));
  if (agua && b > 140 && b >= r && Math.abs(r - g) < 30) m[i * 3 + 1] = Math.round(255 * ss(140, 230, b));
}
execFileSync('convert', ['-size', `${W}x${H}`, '-depth', '8', 'rgb:-', '-blur', '0x0.6', join(out, 'mascaras-gf.png')], { input: m });

// Niebla: el negro es transparente; el color se desmultiplica.
const NW = 1536, NH = 864;
const nraw = execFileSync('convert', [join(gen, 'niebla.png'), '-depth', '8', 'rgb:-'], { maxBuffer: 1 << 26 });
const n4 = Buffer.alloc(NW * NH * 4);
for (let i = 0; i < NW * NH; i++) {
  const r = nraw[i * 3], g = nraw[i * 3 + 1], b = nraw[i * 3 + 2];
  const mx = Math.max(r, g, b);
  const a = ss(6, 200, mx);
  for (let c = 0; c < 3; c++) n4[i * 4 + c] = a > 0.01 ? Math.min(255, Math.round(nraw[i * 3 + c] / Math.max(a, mx / 255))) : 0;
  n4[i * 4 + 3] = Math.round(a * 255);
}
execFileSync('convert', ['-size', `${NW}x${NH}`, '-depth', '8', 'rgba:-', join(out, 'niebla.png')], { input: n4 });
console.log('ok');
