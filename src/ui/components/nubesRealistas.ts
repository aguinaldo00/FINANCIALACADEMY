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
      // Bolas del cúmulo: más grandes en el centro, apoyadas en una base común.
      const base = 0.74;
      const cuantas = 6 + Math.floor(r() * 4);
      const bolas = Array.from({ length: cuantas }, (_, i) => {
        const t = (i + 0.5) / cuantas;
        const radio = 0.13 + 0.16 * Math.sin(Math.PI * t) * (0.7 + 0.5 * r());
        return { x: 0.1 + 0.8 * t + (r() - 0.5) * 0.06, y: base - radio * (0.55 + 0.35 * r()), r: radio };
      });
      const img = ctx.createImageData(ancho, alto);
      const d = img.data;
      for (let py = 0; py < alto; py++) {
        const v = py / alto;
        for (let px = 0; px < ancho; px++) {
          const u = px / ancho;
          // Forma: unión suave de las bolas (en proporción 2:1).
          let forma = 0;
          for (const b of bolas) {
            const dx = (u - b.x) * 2;
            const dy = v - b.y;
            const k = 1 - Math.hypot(dx, dy) / (b.r * 2);
            if (k > forma) forma = k;
          }
          // Base algo plana: se recorta por debajo con un borde suave.
          forma *= Math.min(1, Math.max(0, (base + 0.06 - v) / 0.08));
          // Deshilachado: fBm de 5 octavas.
          let f = 0;
          let amp = 0.5;
          let frec = 6;
          for (let o = 0; o < 5; o++) {
            f += amp * n(u * frec * 2, v * frec);
            amp *= 0.5;
            frec *= 2.1;
          }
          const densidad = forma * 1.6 + (f - 0.5) * 1.1 - 0.12;
          // Se desvanece hacia los bordes del lienzo: sin cortes rectos ni costuras.
          const borde = Math.min(u, 1 - u, v * 1.4, 1 - v) / 0.12;
          const a = Math.min(1, Math.max(0, densidad / 0.5)) * Math.min(1, Math.max(0, borde));
          if (a <= 0) continue;
          // Luz desde arriba: más blanca en la cima de cada bola, gris azulada en la base.
          const sombra = Math.min(1, Math.max(0, (v - (base - 0.3)) / 0.36)) * 0.55 + (1 - f) * 0.22;
          const i4 = (py * ancho + px) * 4;
          d[i4] = 255 - sombra * 88;
          d[i4 + 1] = 255 - sombra * 72;
          d[i4 + 2] = 255 - sombra * 45;
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
