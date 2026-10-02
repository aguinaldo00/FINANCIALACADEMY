/*
 * Nubes realistas para la intro, generadas por código (sin imágenes externas): un cúmulo es una
 * forma de "bolas" con base plana, deshilachada con ruido fractal (fBm) y sombreada como si el sol
 * le diera desde arriba: cima blanca y luminosa, base gris azulada. Se dibujan una vez en un
 * lienzo y se usan como imagen de fondo (CSS) de cada nube.
 */

function aleatorio(semilla: number): () => number {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ruido de valor 2D suavizado con una rejilla aleatoria periódica. */
function ruido(semilla: number): (x: number, y: number) => number {
  const N = 256;
  const r = aleatorio(semilla);
  const tabla = Float32Array.from({ length: N * N }, () => r());
  const suave = (t: number) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = suave(x - xi);
    const fy = suave(y - yi);
    const v = (i: number, j: number) => tabla[((j & (N - 1)) * N) + (i & (N - 1))]!;
    const a = v(xi, yi) + (v(xi + 1, yi) - v(xi, yi)) * fx;
    const b = v(xi, yi + 1) + (v(xi + 1, yi + 1) - v(xi, yi + 1)) * fx;
    return a + (b - a) * fy;
  };
}

const cache = new Map<string, string>();

/**
 * Imagen (data URL) de un cúmulo. `variante` cambia la forma; `ancho` la resolución (el alto es la
 * mitad). Devuelve '' si no hay lienzo (p. ej. en pruebas), y entonces la nube usa el dibujo CSS.
 */
export function nubeRealista(variante: number, ancho = 360): string {
  const clave = `${variante}|${ancho}`;
  const hecha = cache.get(clave);
  if (hecha !== undefined) return hecha;
  let url = '';
  try {
    const alto = Math.round(ancho / 2);
    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    const ctx = lienzo.getContext('2d');
    if (ctx) {
      const r = aleatorio(variante * 7919 + 13);
      const n = ruido(variante * 104729 + 7);
      // Cúmulo: bolas grandes apoyadas en una base plana, medianas encima y pequeñas en la cima
      // (la "coliflor"). Coordenadas: u (0–1, ancho) y v (0–1, alto); el radio se mide en v.
      const base = 0.8;
      const bolas: { x: number; y: number; r: number; peso?: number }[] = [];
      const capa = (cuantas: number, rMin: number, rMax: number, x0: number, x1: number, alto: number) => {
        for (let i = 0; i < cuantas; i++) {
          const radio = rMin + (rMax - rMin) * r();
          const x = x0 + ((i + 0.5) / cuantas) * (x1 - x0) + (r() - 0.5) * 0.05;
          bolas.push({ x, y: base - alto - radio * (0.55 + 0.2 * r()), r: radio });
        }
      };
      capa(7, 0.16, 0.23, 0.15, 0.85, 0);
      capa(6, 0.12, 0.17, 0.24, 0.76, 0.14);
      capa(4, 0.09, 0.13, 0.33, 0.67, 0.29);
      // Bolitas en el contorno superior de las grandes: el borde "en coliflor" de un cúmulo.
      const grandes = bolas.length;
      for (let i = 0; i < 30; i++) {
        const madre = bolas[Math.floor(r() * grandes)]!;
        const ang = Math.PI * (1.05 + r() * 0.9);
        const radio = 0.05 + r() * 0.05;
        bolas.push({ x: madre.x + (Math.cos(ang) * madre.r * 0.75) / 2, y: madre.y + Math.sin(ang) * madre.r * 0.75, r: radio, peso: 0.45 });
      }
      // Luz del sol: desde arriba y algo de lado.
      const L = [-0.35, -0.8, 0.5];
      const lL = Math.hypot(L[0]!, L[1]!, L[2]!);
      // 1.ª pasada: "espesor" de la nube como suma suave de las bolas (metabolas), deshilachada con
      // ruido fractal. Así las bolas se funden sin costuras.
      const H = new Float32Array(ancho * alto);
      const F = new Float32Array(ancho * alto);
      for (let py = 0; py < alto; py++) {
        const v = py / alto;
        for (let px = 0; px < ancho; px++) {
          const u = px / ancho;
          let f = 0;
          let amp = 0.5;
          let frec = 4;
          for (let o = 0; o < 6; o++) {
            f += amp * n(u * frec * 2, v * frec);
            amp *= 0.5;
            frec *= 2.03;
          }
          let h = 0;
          for (const b of bolas) {
            const dx = ((u - b.x) * 2) / b.r;
            const dy = (v - b.y) / b.r;
            const q = 1 - (dx * dx + dy * dy) * (1 + (0.5 - f) * 1.5);
            if (q > 0) h += q * q * (b.peso ?? 1);
          }
          // Base plana: se aplana y corta por debajo de la línea de base.
          const corte = Math.min(1, Math.max(0, (base + 0.02 - v) / 0.07 + (f - 0.5) * 0.5));
          H[py * ancho + px] = h * corte;
          F[py * ancho + px] = f;
        }
      }
      // 2.ª pasada: normales a partir del espesor (luz suave y continua) y color.
      const img = ctx.createImageData(ancho, alto);
      const d = img.data;
      const escala = alto * 0.032;
      for (let py = 1; py < alto - 1; py++) {
        const v = py / alto;
        for (let px = 1; px < ancho - 1; px++) {
          const i = py * ancho + px;
          const h = H[i]!;
          const a0 = Math.min(1, Math.max(0, (h - 0.05) / 0.42));
          if (a0 <= 0.003) continue;
          const nx = (H[i - 1]! - H[i + 1]!) * escala;
          const ny = (H[i - ancho]! - H[i + ancho]!) * escala;
          const nl = Math.hypot(nx, ny, 1);
          const luz = Math.max(0, (nx * L[0]! + ny * L[1]! + L[2]!) / (nl * lL));
          const f = F[i]!;
          // Más espesor, más luz difusa; la base queda gris azulada.
          const espesor = Math.min(1, h / 1.6);
          const sombraBase = Math.min(1, Math.max(0, (v - 0.5) / 0.3)) * 0.3;
          const k = Math.min(1, Math.max(0, 0.25 + luz * 0.6 + espesor * 0.22 + (f - 0.5) * 0.3 - sombraBase));
          const u = px / ancho;
          const a = a0 * Math.min(1, Math.max(0, Math.min(u, 1 - u, v, 1 - v) / 0.04));
          const i4 = i * 4;
          d[i4] = 160 + 95 * k;
          d[i4 + 1] = 176 + 79 * k;
          d[i4 + 2] = 200 + 55 * k;
          d[i4 + 3] = Math.round(a * a * (3 - 2 * a) * 255);
        }
      }
      ctx.putImageData(img, 0, 0);
      url = lienzo.toDataURL('image/png');
    }
  } catch {
    url = '';
  }
  cache.set(clave, url);
  return url;
}

/** Texturas que usa la intro: [variante, ancho]. */
export const TEXTURAS_INTRO = {
  lejanas: [[0, 440], [1, 440], [2, 440], [3, 440]] as const,
  cercanas: [[4, 640], [7, 640]] as const,
};

/**
 * Genera las texturas de la intro en ratos libres del navegador (una por turno), para que al
 * empezar la intro ya estén hechas y no se note el cálculo.
 */
export function prepararNubesIntro(): void {
  const pendientes = [...TEXTURAS_INTRO.lejanas, ...TEXTURAS_INTRO.cercanas];
  const ocioso = (fn: () => void): void => {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(fn, { timeout: 1500 });
    else setTimeout(fn, 30);
  };
  const siguiente = () => {
    const t = pendientes.shift();
    if (!t) return;
    nubeRealista(t[0], t[1]);
    ocioso(siguiente);
  };
  ocioso(siguiente);
}
