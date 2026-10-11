/*
 * Tiempo de las animaciones del Tema 2. Cada escena es una función del tiempo: pintar(t) deja el
 * dibujo exactamente como debe estar en el segundo t. Así se puede saltar a cualquier capítulo,
 * volver atrás o congelar la composición final sin estados intermedios que se desajusten.
 */

export type Curva = (p: number) => number;

export const limitar = (v: number, min = 0, max = 1): number => Math.min(max, Math.max(min, v));
export const mezclar = (a: number, b: number, p: number): number => a + (b - a) * p;

/** Curvas de movimiento. `suave` para desplazamientos, `salida` para apariciones, `muelle` para asentar. */
export const curvas = {
  lineal: ((p) => p) as Curva,
  suave: ((p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2)) as Curva,
  salida: ((p) => 1 - (1 - p) ** 3) as Curva,
  expo: ((p) => (p >= 1 ? 1 : 1 - 2 ** (-10 * p))) as Curva,
  entrada: ((p) => p * p * p) as Curva,
  muelle: ((p) => {
    const c1 = 1.25;
    const c3 = c1 + 1;
    return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2;
  }) as Curva,
};

/** Progreso (0 → 1) de un tramo de la escena entre los segundos `inicio` y `fin`. */
export function tramo(t: number, inicio: number, fin: number, curva: Curva = curvas.suave): number {
  if (fin <= inicio) return t >= fin ? 1 : 0;
  return curva(limitar((t - inicio) / (fin - inicio)));
}

/** Aparece en `inicio` y desaparece en `fin` (con fundidos de `fundido` segundos). */
export function ventana(t: number, inicio: number, fin: number, fundido = 0.35): number {
  return Math.min(tramo(t, inicio, inicio + fundido, curvas.salida), 1 - tramo(t, fin - fundido, fin, curvas.entrada));
}

/** Interpola entre fotogramas clave `[segundo, valor]` (ordenados). */
export function claves(t: number, puntos: readonly (readonly [number, number])[], curva: Curva = curvas.suave): number {
  if (!puntos.length) return 0;
  if (t <= puntos[0]![0]) return puntos[0]![1];
  for (let k = 1; k < puntos.length; k++) {
    const [t1, v1] = puntos[k]!;
    const [t0, v0] = puntos[k - 1]!;
    if (t <= t1) return mezclar(v0, v1, tramo(t, t0, t1, curva));
  }
  return puntos.at(-1)![1];
}

/** Número que cuenta hacia su valor (para cifras que se acumulan con un fenómeno visible). */
export function contar(t: number, inicio: number, fin: number, desde: number, hasta: number): number {
  return mezclar(desde, hasta, tramo(t, inicio, fin, curvas.salida));
}

/** Punto de un arco entre dos posiciones (los símbolos viajan a la fórmula describiendo una curva). */
export function arco(desde: { x: number; y: number }, hasta: { x: number; y: number }, p: number, altura = 0.22): { x: number; y: number } {
  const dx = hasta.x - desde.x;
  const dy = hasta.y - desde.y;
  const distancia = Math.hypot(dx, dy);
  const curva = Math.sin(Math.PI * p) * distancia * altura;
  return { x: desde.x + dx * p, y: desde.y + dy * p - curva };
}
