/*
 * Estética de papel (estilo «explainer» de Vox): recortes con el borde irregular, sombra de papel
 * sobre papel, un ligero temblor de animación hecha a mano y grano en toda la imagen.
 * Todo es determinista: el mismo segundo produce siempre el mismo dibujo.
 */

/** Ruido determinista en [-1, 1] para una semilla y un índice. */
export function ruido(semilla: number, k: number): number {
  let h = Math.imul(semilla ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(k + 0x632be5ab, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 12;
  return ((h >>> 0) % 20001) / 10000 - 1;
}

let contadorSemillas = 1;
/** Semilla nueva para cada recorte (su borde es siempre el mismo). */
export const nuevaSemilla = (): number => contadorSemillas++ * 7919;

/** Fotograma del temblor: la animación «a mano» cambia 8 veces por segundo. */
export const fotogramaTemblor = (t: number): number => Math.floor(t * 8);

/**
 * Rectángulo recortado a mano: cada lado es una línea quebrada con pequeñas irregularidades.
 * `amplitud` en px; los vértices se reparten cada ~14 px.
 */
export function rectanguloRecortado(x: number, y: number, w: number, h: number, semilla: number, amplitud = 1.1): string {
  if (w <= 0.5 || h <= 0.5) return '';
  const a = Math.min(amplitud, w / 6, h / 6);
  const puntos: string[] = [];
  const lado = (x0: number, y0: number, x1: number, y1: number, base: number) => {
    const largo = Math.hypot(x1 - x0, y1 - y0);
    const pasos = Math.max(1, Math.round(largo / 14));
    const nx = -(y1 - y0) / largo;
    const ny = (x1 - x0) / largo;
    for (let k = 0; k < pasos; k++) {
      const p = k / pasos;
      const d = k === 0 ? ruido(semilla, base) * a * 0.6 : ruido(semilla, base + k) * a;
      puntos.push(`${(x0 + (x1 - x0) * p + nx * d).toFixed(1)} ${(y0 + (y1 - y0) * p + ny * d).toFixed(1)}`);
    }
  };
  lado(x, y, x + w, y, 0);
  lado(x + w, y, x + w, y + h, 100);
  lado(x + w, y + h, x, y + h, 200);
  lado(x, y + h, x, y, 300);
  return `M${puntos.join(' L')} Z`;
}

/** Trazo de rotulador: banda con los extremos irregulares, de (x0, y) a (x1, y) con grosor g. */
export function trazoRotulador(x0: number, x1: number, y: number, g: number, semilla: number): string {
  const r = (k: number) => ruido(semilla, k);
  const arriba = y - g / 2;
  const abajo = y + g / 2;
  return `M${x0 + r(1) * 2} ${arriba + r(2)} L${x1 + r(3) * 3} ${arriba + r(4) * 1.5} Q${x1 + 4 + r(5) * 2} ${y} ${x1 + r(6) * 3} ${abajo + r(7)} L${x0 + r(8) * 2} ${abajo + r(9) * 1.5} Q${x0 - 3} ${y} ${x0 + r(1) * 2} ${arriba + r(2)} Z`;
}

/** Desplazamiento mínimo de «animación a mano» (px y grados) para un recorte en el instante t. */
export function temblor(semilla: number, t: number, intensidad = 1): { dx: number; dy: number; giro: number } {
  const f = fotogramaTemblor(t);
  return { dx: ruido(semilla, f * 3) * 0.6 * intensidad, dy: ruido(semilla, f * 3 + 1) * 0.6 * intensidad, giro: ruido(semilla, f * 3 + 2) * 0.22 * intensidad };
}

/** Textura de grano (se genera una vez en un lienzo y la usa el CSS del marco). */
export function asegurarGrano(): void {
  const raiz = document.documentElement;
  if (raiz.style.getPropertyValue('--mo-grano')) return;
  try {
    const lado = 180;
    const c = document.createElement('canvas');
    c.width = lado;
    c.height = lado;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(lado, lado);
    for (let k = 0; k < lado * lado; k++) {
      const v = 128 + ruido(4021, k) * 70;
      img.data[k * 4] = v;
      img.data[k * 4 + 1] = v * 0.96;
      img.data[k * 4 + 2] = v * 0.9;
      img.data[k * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    raiz.style.setProperty('--mo-grano', `url(${c.toDataURL('image/png')})`);
  } catch {
    /* Sin lienzo (pruebas): el papel se queda liso. */
  }
}
