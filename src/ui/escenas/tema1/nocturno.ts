/*
 * Motivos de las escenas del Tema 1 (ambiente «noche»): azul tinta, arquitectura dibujada a línea y
 * luz cálida. El dinero es siempre luz que se mueve; los textos en pantalla son pocas palabras que
 * entran con tipografía cinética (la explicación va en el subtítulo).
 */
import { fijar, type Lienzo, type Punto, situar } from '../../motion/lienzo.ts';
import { limitar, mezclar } from '../../motion/tiempo.ts';

export type Ruta = (u: number) => Punto;

/** Curva de Bézier cuadrática. */
export const bezier2 = (a: Punto, b: Punto, c: Punto): Ruta => (u) => ({
  x: (1 - u) ** 2 * a.x + 2 * (1 - u) * u * b.x + u * u * c.x,
  y: (1 - u) ** 2 * a.y + 2 * (1 - u) * u * b.y + u * u * c.y,
});

/** Recta entre dos puntos. */
export const recta = (a: Punto, b: Punto): Ruta => (u) => ({ x: mezclar(a.x, b.x, u), y: mezclar(a.y, b.y, u) });

/** Varias rutas seguidas, como una sola. */
export const encadenar = (...rutas: Ruta[]): Ruta => (u) => {
  const v = limitar(u) * rutas.length;
  const k = Math.min(rutas.length - 1, Math.floor(v));
  return rutas[k]!(v - k);
};

/** Gradientes propios de la noche (una vez por lienzo). */
export function prepararNoche(l: Lienzo): { moneda: string; haz: string; resplandor: string; vacio: string; tierra: string } {
  const p = l.prefijo;
  l.defs.insertAdjacentHTML('beforeend', `
    <radialGradient id="${p}-moneda"><stop offset="0" stop-color="#fff3d6"/><stop offset=".35" stop-color="#f2d48f"/><stop offset=".55" stop-color="#e0b25e" stop-opacity=".55"/><stop offset="1" stop-color="#e0b25e" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}-haz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".55"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient>
    <linearGradient id="${p}-vacio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020308" stop-opacity=".95"/><stop offset="1" stop-color="#020308" stop-opacity="0"/></linearGradient>
    <linearGradient id="${p}-tierra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a2c" stop-opacity=".9"/><stop offset="1" stop-color="#121a2c" stop-opacity="0"/></linearGradient>
    <radialGradient id="${p}-resplandor"><stop offset="0" stop-color="#f2b96a" stop-opacity=".5"/><stop offset=".5" stop-color="#e0a050" stop-opacity=".12"/><stop offset="1" stop-color="#e0a050" stop-opacity="0"/></radialGradient>`);
  return { moneda: `url(#${p}-moneda)`, haz: `url(#${p}-haz)`, resplandor: `url(#${p}-resplandor)`, vacio: `url(#${p}-vacio)`, tierra: `url(#${p}-tierra)` };
}

/** Un camino que se dibuja (el recorrido del dinero) y por el que luego se puede viajar a velocidad constante. */
export class Trazado {
  readonly el: SVGPathElement;
  private readonly puntos: Punto[] = [];
  private readonly acumulado: number[] = [0];
  readonly largo: number;

  constructor(l: Lienzo, ruta: Ruta, clase: string, padre: Element = l.mundo, muestras = 60) {
    for (let k = 0; k <= muestras; k++) this.puntos.push(ruta(k / muestras));
    for (let k = 1; k < this.puntos.length; k++) {
      const a = this.puntos[k - 1]!;
      const b = this.puntos[k]!;
      this.acumulado.push(this.acumulado[k - 1]! + Math.hypot(b.x - a.x, b.y - a.y));
    }
    this.largo = this.acumulado[this.acumulado.length - 1]!;
    const d = this.puntos.map((q, k) => `${k ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');
    this.el = l.el('path', { d, class: clase, fill: 'none' }, padre);
  }

  /** p: cuánto está dibujado (0 → 1). */
  pintar(p: number, opacidad = 1): void {
    const q = limitar(p);
    fijar(this.el, { 'stroke-dasharray': `${this.largo.toFixed(1)} ${this.largo.toFixed(1)}`, 'stroke-dashoffset': (this.largo * (1 - q)).toFixed(1), opacity: q <= 0 ? 0 : opacidad });
  }

  /** Punto a una fracción u del largo (velocidad constante). */
  en(u: number): Punto {
    const objetivo = limitar(u) * this.largo;
    let k = 1;
    while (k < this.acumulado.length - 1 && this.acumulado[k]! < objetivo) k++;
    const a = this.puntos[k - 1]!;
    const b = this.puntos[k]!;
    const tramo = this.acumulado[k]! - this.acumulado[k - 1]! || 1;
    const f = (objetivo - this.acumulado[k - 1]!) / tramo;
    return { x: mezclar(a.x, b.x, f), y: mezclar(a.y, b.y, f) };
  }
}

/** Monedas de luz que recorren un trazado: salen una tras otra entre `inicio` y `fin`. */
export class Corriente {
  private readonly monedas: SVGCircleElement[] = [];

  constructor(l: Lienzo, private readonly trazado: Trazado, relleno: string, cuantas = 14, padre: Element = l.mundo, private readonly radio = 9) {
    for (let k = 0; k < cuantas; k++) this.monedas.push(l.el('circle', { r: radio, fill: relleno, class: 't1-moneda' }, padre));
  }

  /** separacion: segundos entre una moneda y la siguiente; duracion: lo que tarda cada una en llegar. */
  /** limite: hasta qué fracción del trazado pueden llegar (si el camino aún se está dibujando). */
  pintar(t: number, inicio: number, fin: number, duracion = 1.6, separacion = 0.32, opacidad = 1, limite = 1): number {
    let llegadas = 0;
    this.monedas.forEach((m, k) => {
      const sale = inicio + k * separacion;
      const u = (t - sale) / duracion;
      if (sale > fin || u < 0 || u > 1 || u > limite) {
        if (sale <= fin && u > 1) llegadas++;
        fijar(m, { opacity: 0 });
        return;
      }
      const q = this.trazado.en(u);
      const e = Math.sin(Math.PI * u) ** 0.35;
      fijar(m, { cx: q.x.toFixed(1), cy: q.y.toFixed(1), r: (this.radio * (0.55 + 0.45 * e)).toFixed(2), opacity: opacidad });
    });
    return llegadas;
  }
}

/** Palabra con tipografía cinética: entra subiendo y cerrando el espaciado; sale con un fundido. */
export class Palabra {
  readonly g: SVGGElement;
  readonly texto: SVGTextElement;

  constructor(l: Lienzo, contenido: string, clase: string, padre: Element = l.mundo, ancla: 'start' | 'middle' | 'end' = 'middle') {
    this.g = l.grupo({ class: 't1-palabra' }, padre);
    this.texto = l.texto(contenido, { class: clase, 'text-anchor': ancla }, this.g);
  }

  pintar(x: number, y: number, p: number, salida = 0, espaciado = 6): void {
    const q = limitar(p);
    situar(this.g, x, y + (1 - q) * 14, 1, q * (1 - limitar(salida)));
    fijar(this.texto, { 'letter-spacing': ((1 - q) * espaciado).toFixed(2) });
  }
}

/** Resplandor cálido (una ventana encendida, una lámpara): círculo con gradiente. */
export function resplandor(l: Lienzo, relleno: string, padre: Element = l.mundo): SVGCircleElement {
  return l.el('circle', { r: 0, fill: relleno, class: 't1-resplandor' }, padre);
}

/** Separa la inicial en su propio <tspan class="t1-ini"> (para encenderla en las reglas mnemotécnicas). */
export function inicialAparte(texto: SVGTextElement): void {
  const palabra = texto.textContent ?? '';
  texto.textContent = '';
  const ns = texto.namespaceURI;
  const ini = document.createElementNS(ns, 'tspan');
  ini.setAttribute('class', 't1-ini');
  ini.textContent = palabra.slice(0, 1);
  const resto = document.createElementNS(ns, 'tspan');
  resto.textContent = palabra.slice(1);
  texto.append(ini, resto);
}
