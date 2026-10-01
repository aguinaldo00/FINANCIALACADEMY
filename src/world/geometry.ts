/** Rectángulo en el plano del suelo. `x`/`z` es la esquina mínima. Unidades del mundo. */
export interface Rect {
  x: number;
  z: number;
  ancho: number;
  fondo: number;
}

export interface Punto {
  x: number;
  z: number;
}

export const centroRect = (r: Rect): Punto => ({ x: r.x + r.ancho / 2, z: r.z + r.fondo / 2 });

export const areaRect = (r: Rect): number => r.ancho * r.fondo;

/** Encoge el rectángulo `margen` por cada lado (sin pasar de tamaño 0). */
export function encoger(r: Rect, margen: number): Rect {
  const mx = Math.min(margen, r.ancho / 2);
  const mz = Math.min(margen, r.fondo / 2);
  return { x: r.x + mx, z: r.z + mz, ancho: r.ancho - 2 * mx, fondo: r.fondo - 2 * mz };
}

export interface ItemPeso {
  id: string;
  peso: number;
}

/**
 * Treemap por bisección: reparte `rect` entre los elementos con un área exactamente proporcional
 * a su peso. Conserva el orden (las secciones quedan en orden de lectura) y corta siempre por el
 * lado largo para evitar parcelas estrechas. Si todos los pesos son 0 se reparte a partes iguales.
 */
export function particionar(items: readonly ItemPeso[], rect: Rect): Map<string, Rect> {
  const salida = new Map<string, Rect>();
  const total = items.reduce((s, it) => s + Math.max(0, it.peso), 0);
  const normalizados = items.map((it) => ({ id: it.id, peso: total > 0 ? Math.max(0, it.peso) : 1 }));
  dividir(normalizados, rect, salida);
  return salida;
}

function dividir(items: ItemPeso[], rect: Rect, salida: Map<string, Rect>): void {
  if (!items.length) return;
  if (items.length === 1) {
    salida.set(items[0]!.id, rect);
    return;
  }
  const total = items.reduce((s, it) => s + it.peso, 0);

  // Punto de corte que deja dos mitades de peso lo más parecido posible.
  let corte = 1;
  let mejor = Infinity;
  let acumulado = 0;
  for (let i = 1; i < items.length; i++) {
    acumulado += items[i - 1]!.peso;
    const diferencia = Math.abs(acumulado - total / 2);
    if (diferencia < mejor) {
      mejor = diferencia;
      corte = i;
    }
  }
  const izquierda = items.slice(0, corte);
  const derecha = items.slice(corte);
  const fraccion = total > 0 ? izquierda.reduce((s, it) => s + it.peso, 0) / total : 0.5;

  if (rect.ancho >= rect.fondo) {
    const a = rect.ancho * fraccion;
    dividir(izquierda, { ...rect, ancho: a }, salida);
    dividir(derecha, { ...rect, x: rect.x + a, ancho: rect.ancho - a }, salida);
  } else {
    const f = rect.fondo * fraccion;
    dividir(izquierda, { ...rect, fondo: f }, salida);
    dividir(derecha, { ...rect, z: rect.z + f, fondo: rect.fondo - f }, salida);
  }
}

/** Pseudoaleatorio determinista en [0, 1): la ciudad es siempre la misma. */
export const pseudoAleatorio = (a: number, b: number): number => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
