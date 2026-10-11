/*
 * Piezas visuales comunes de las escenas del Tema 2. Todas siguen el mismo lenguaje:
 *  - las cantidades son cápsulas cuya ALTURA es proporcional al importe (nunca se exagera una);
 *  - el color dice el papel (presente azul, futuro oro, intereses verde, tipos rosa, tiempo violeta);
 *  - el suelo es el eje del tiempo; bajo tierra, las raíces enseñan sobre qué base se calcula.
 */
import { formulaTexto } from '../matematica/formula.ts';
import { fijar, type FormulaSvg, type Lienzo, type Punto, situar } from './lienzo.ts';
import { nuevaSemilla, rectanguloRecortado, temblor, trazoRotulador } from './papel.ts';
import { curvas, limitar, mezclar } from './tiempo.ts';

/** Entrada con golpe: al aparecer (opacidad < 0,6) crece pasándose un poco y gira ligeramente. */
function golpe(opacidad: number): { escala: number; giro: number } {
  if (opacidad >= 0.999 || opacidad <= 0) return { escala: 1, giro: 0 };
  const p = limitar(opacidad / 0.6);
  return { escala: mezclar(0.55, 1, curvas.muelle(p)), giro: (1 - p) * -5 };
}

export const eur = (v: number, decimales = 0): string =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(v);

/* ---------------------------------------------------------------------------------- etiquetas */

/** Etiqueta del mundo escrita con la notación de fórmulas (p. ej. `C_0 = "10.000 €"`). */
export class Etiqueta {
  readonly g: SVGGElement;
  readonly formula: FormulaSvg;
  constructor(l: Lienzo, fuente: string, tam = 24, alinear: 'izquierda' | 'centro' | 'derecha' = 'centro', padre?: Element) {
    this.g = l.grupo({ class: 'mo-etiqueta', 'aria-hidden': 'true' }, padre);
    this.formula = l.formula(fuente, { x: 0, y: 0, tam, alinear, padre: this.g });
    this.g.dataset.texto = formulaTexto(fuente);
  }
  pintar(x: number, y: number, opacidad: number, escala = 1): void {
    const g = golpe(opacidad);
    situar(this.g, x, y, escala * g.escala, opacidad, g.giro);
  }
}

/* ------------------------------------------------------------------------------- cantidades */

export interface OpcionesCapsula {
  clase: string;
  ancho: number;
  /** Relleno tenue (0–1). */
  relleno?: number;
  padre?: Element;
}

/**
 * Una cantidad es un recorte de papel de su color, con la base apoyada en (x, base) y la altura
 * proporcional al importe. Con `relleno` bajo (< 0,15) es un contorno discontinuo: una referencia
 * (lo que daría simple, un valor anterior), no papel.
 */
export class Capsula {
  readonly g: SVGGElement;
  private readonly sombra: SVGPathElement;
  private readonly cuerpo: SVGPathElement;
  private readonly semilla = nuevaSemilla();
  private readonly contorno: boolean;
  constructor(private readonly l: Lienzo, private readonly op: OpcionesCapsula) {
    this.contorno = (op.relleno ?? 0.22) < 0.15;
    this.g = l.grupo({ class: `mo-capsula ${op.clase}${this.contorno ? ' mo-contorno' : ''}` }, op.padre);
    this.sombra = l.el('path', { class: 'mo-capsula-sombra' }, this.g);
    this.cuerpo = l.el('path', { class: 'mo-capsula-cuerpo' }, this.g);
  }
  /** `alto` positivo crece hacia arriba desde `base`; negativo, hacia abajo (bajo tierra). */
  pintar(x: number, base: number, alto: number, opacidad = 1, ancho = this.op.ancho): void {
    const y = alto >= 0 ? base - alto : base;
    const h = Math.abs(alto);
    const d = rectanguloRecortado(x - ancho / 2, y, Math.max(0, ancho), h, this.semilla, this.contorno ? 0.4 : 1.1);
    fijar(this.cuerpo, { d });
    fijar(this.sombra, { d, transform: 'translate(3.5 4.5)', opacity: this.contorno ? 0 : null });
    const tb = temblor(this.semilla, this.l.instante);
    situar(this.g, tb.dx, tb.dy, 1, opacidad);
  }
}

/* -------------------------------------------------------------------------------- el tiempo */

export interface OpcionesEje {
  x0: number;
  paso: number;
  y: number;
  periodos: number;
  /** Texto de cada marca (por defecto 0, 1, 2…). */
  marcas?: string[];
  /** Rotular los periodos (entre marcas: «año 1», «año 2»…) en lugar de los instantes. */
  periodos_rotulo?: (k: number) => string;
  unidad?: string;
  padre?: Element;
}

/** Suelo y eje del tiempo (violeta): se traza de izquierda a derecha y marca cada periodo. */
export class Eje {
  readonly g: SVGGElement;
  private readonly linea: SVGLineElement;
  private readonly ticks: SVGLineElement[] = [];
  private readonly textos: SVGTextElement[] = [];
  private readonly unidad: SVGTextElement | null;
  constructor(l: Lienzo, readonly op: OpcionesEje) {
    this.g = l.grupo({ class: 'mo-eje' }, op.padre);
    this.linea = l.el('line', { class: 'mo-eje-linea', y1: op.y, y2: op.y }, this.g);
    for (let k = 0; k <= op.periodos; k++) {
      const x = this.x(k);
      this.ticks.push(l.el('line', { class: 'mo-eje-tick', x1: x, x2: x, y1: op.y - 7, y2: op.y + 7 }, this.g));
      const rotulo = op.periodos_rotulo;
      if (rotulo && k === op.periodos) continue;
      const texto = rotulo ? rotulo(k + 1) : op.marcas?.[k] ?? String(k);
      this.textos.push(l.texto(texto, { class: 'mo-eje-texto', x: rotulo ? x + op.paso / 2 : x, y: op.y + 30, 'text-anchor': 'middle' }, this.g));
    }
    this.unidad = op.unidad ? l.texto(op.unidad, { class: 'mo-eje-unidad', x: this.x(op.periodos) + 26, y: op.y + 30 }, this.g) : null;
  }
  x(k: number): number {
    return this.op.x0 + k * this.op.paso;
  }
  /** `p`: cuánto del eje está trazado (0–1). `activo`: periodo resaltado. */
  pintar(p: number, opacidad = 1, activo = -1): void {
    const fin = mezclar(this.op.x0 - 40, this.x(this.op.periodos) + 50, p);
    fijar(this.linea, { x1: this.op.x0 - 40, x2: fin });
    this.ticks.forEach((tick, k) => {
      const visible = this.x(k) <= fin ? 1 : 0;
      fijar(tick, { opacity: visible, class: k === activo ? 'mo-eje-tick on' : 'mo-eje-tick' });
    });
    const rotulo = this.op.periodos_rotulo;
    this.textos.forEach((texto, k) => {
      const x = rotulo ? this.x(k) + this.op.paso / 2 : this.x(k);
      const on = rotulo ? k + 1 === activo : k === activo;
      fijar(texto, { opacity: x <= fin ? 1 : 0, class: on ? 'mo-eje-texto on' : 'mo-eje-texto' });
    });
    if (this.unidad) fijar(this.unidad, { opacity: p >= 0.98 ? 1 : 0 });
    situar(this.g, 0, 0, 1, opacidad);
  }
}

/* ------------------------------------------------------------------------- trazos y llaves */

/** Raíz o trayectoria que se dibuja poco a poco (curva cúbica de `a` a `b`). */
export class Trazo {
  readonly path: SVGPathElement;
  private largo = 0;
  puntos: [Punto, Punto, Punto, Punto] = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
  constructor(l: Lienzo, clase: string, padre?: Element) {
    this.path = l.el('path', { class: clase, fill: 'none' }, padre);
  }
  pintar(a: Punto, b: Point2, p: number, opacidad = 1, curvatura = 0.5): void {
    const dx = b.x - a.x;
    const c1 = { x: a.x + dx * curvatura, y: a.y };
    const c2 = { x: b.x - dx * curvatura * 0.2, y: b.y + (a.y - b.y) * 0.1 };
    this.puntos = [a, c1, c2, b];
    const d = `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`;
    fijar(this.path, { d });
    // Longitud aproximada (suficiente para el trazado progresivo).
    this.largo = Math.hypot(dx, b.y - a.y) * 1.25 + 1;
    fijar(this.path, { 'stroke-dasharray': `${this.largo} ${this.largo}`, 'stroke-dashoffset': this.largo * (1 - p), opacity: p <= 0 ? 0 : opacidad });
  }
}
type Point2 = Punto;

/** Punto de la curva del trazo (0 = origen, 1 = destino), para lo que viaja por ella. */
export function puntoTrazo(trazo: Trazo, p: number): Punto {
  const [a, b, c, d] = trazo.puntos;
  const q = 1 - p;
  return {
    x: q * q * q * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p * p * p * d.x,
    y: q * q * q * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p * p * p * d.y,
  };
}

/** Pulso: un punto con halo que recorre una trayectoria (lo que fluye de un sitio a otro). */
export class Pulso {
  readonly g: SVGGElement;
  constructor(l: Lienzo, clase: string, padre?: Element) {
    this.g = l.grupo({ class: `mo-pulso-g ${clase}` }, padre);
    l.el('circle', { r: 9, class: 'mo-pulso', opacity: 0.25, filter: `url(#${l.prefijo}-halo)` }, this.g);
    l.el('circle', { r: 3.6, class: 'mo-pulso' }, this.g);
  }
  pintar(p: Punto, opacidad: number): void {
    situar(this.g, p.x, p.y, 1, opacidad);
  }
}

/** Llave horizontal de x1 a x2 en y; `h` negativo la abre hacia arriba. */
export function llaveH(x1: number, x2: number, y: number, h: number): string {
  const r = Math.min(Math.abs(h) * 0.9, (x2 - x1) / 4) * Math.sign(x2 - x1);
  const m = (x1 + x2) / 2;
  const y1 = y + h / 2;
  return `M${x1} ${y} Q${x1} ${y1} ${x1 + r} ${y1} L${m - r} ${y1} Q${m} ${y1} ${m} ${y + h} Q${m} ${y1} ${m + r} ${y1} L${x2 - r} ${y1} Q${x2} ${y1} ${x2} ${y}`;
}

/** Llave vertical de y1 a y2 en x; `h` positivo la abre hacia la derecha. */
export function llaveV(y1: number, y2: number, x: number, h: number): string {
  const r = Math.min(Math.abs(h) * 0.9, Math.abs(y2 - y1) / 4) * Math.sign(y2 - y1);
  const m = (y1 + y2) / 2;
  const x1 = x + h / 2;
  return `M${x} ${y1} Q${x1} ${y1} ${x1} ${y1 + r} L${x1} ${m - r} Q${x1} ${m} ${x + h} ${m} Q${x1} ${m} ${x1} ${m + r} L${x1} ${y2 - r} Q${x1} ${y2} ${x} ${y2}`;
}

/** Llave con su etiqueta, que se dibuja de golpe pero aparece con un fundido. */
export class Llave {
  readonly path: SVGPathElement;
  constructor(l: Lienzo, clase: string, padre?: Element) {
    this.path = l.el('path', { class: `mo-llave ${clase}`, fill: 'none' }, padre);
  }
  horizontal(x1: number, x2: number, y: number, h: number, opacidad: number): void {
    fijar(this.path, { d: llaveH(x1, x2, y, h), opacity: opacidad <= 0.001 ? 0 : opacidad });
  }
  vertical(y1: number, y2: number, x: number, h: number, opacidad: number): void {
    fijar(this.path, { d: llaveV(y1, y2, x, h), opacity: opacidad <= 0.001 ? 0 : opacidad });
  }
}

/** Línea guía discontinua (comparar alturas, marcar un nivel). */
export class Guia {
  readonly line: SVGLineElement;
  constructor(l: Lienzo, clase = 'mo-guia', padre?: Element) {
    this.line = l.el('line', { class: clase }, padre);
  }
  pintar(x1: number, y1: number, x2: number, y2: number, p: number, opacidad = 1): void {
    fijar(this.line, { x1, y1, x2: mezclar(x1, x2, p), y2: mezclar(y1, y2, p), opacity: p <= 0 ? 0 : opacidad });
  }
}

/** Texto suelto del mundo (rótulos de apoyo, en gris). */
export class Rotulo {
  readonly g: SVGGElement;
  readonly t: SVGTextElement;
  /** Si el rótulo lleva color (una cifra de una magnitud), se subraya con rotulador de ese color. */
  private readonly marca: SVGPathElement | null;
  private readonly semilla = nuevaSemilla();
  private anchoMedido = -1;
  private textoMedido = '';
  constructor(l: Lienzo, texto: string, clase = 'mo-rotulo', private readonly ancla: 'start' | 'middle' | 'end' = 'middle', padre?: Element) {
    this.g = l.grupo({ class: 'mo-rotulo-g' }, padre);
    const color = /\bs-(c0|cn|I|i|n|m|D)\b/.exec(clase)?.[0];
    this.marca = color ? l.el('path', { class: `fx-marca s ${color}` }, this.g) : null;
    this.t = l.texto(texto, { class: clase, 'text-anchor': ancla, x: 0, y: 0 }, this.g);
  }
  private ancho(): number {
    const texto = this.t.textContent ?? '';
    if (texto === this.textoMedido && this.anchoMedido > 0) return this.anchoMedido;
    let w = 0;
    try {
      w = typeof this.t.getComputedTextLength === 'function' ? this.t.getComputedTextLength() : 0;
    } catch {
      w = 0;
    }
    if (w <= 0) w = texto.length * 10;
    else {
      this.anchoMedido = w;
      this.textoMedido = texto;
    }
    return w;
  }
  pintar(x: number, y: number, opacidad: number, texto?: string): void {
    if (texto !== undefined && this.t.textContent !== texto) this.t.textContent = texto;
    if (this.marca) {
      const w = this.ancho();
      const x0 = this.ancla === 'start' ? 0 : this.ancla === 'middle' ? -w / 2 : -w;
      fijar(this.marca, { d: trazoRotulador(x0 - 4, x0 + w + 4, -6, 18, this.semilla) });
    }
    const g = golpe(opacidad);
    situar(this.g, x, y, g.escala, opacidad, g.giro * 0.5);
  }
}

/** Suelo: la tierra bajo el eje (profundidad) con un borde fino. */
export function suelo(l: Lienzo, y: number, padre?: Element): SVGGElement {
  const g = l.grupo({ class: 'mo-suelo' }, padre);
  l.el('path', { d: rectanguloRecortado(-900, y, 2600, 900, nuevaSemilla(), 2.2), fill: `url(#${l.prefijo}-suelo)` }, g);
  return g;
}

/* ----------------------------------------------------------------------------------- reglas */

export interface OpcionesRegla {
  x0: number;
  x1: number;
  y: number;
  divisiones: number;
  clase: string;
  /** Rótulo de cada marca (índice 0…divisiones) o null para no rotular. */
  rotulo?: (k: number) => string | null;
  tamRotulo?: number;
  padre?: Element;
}

/** Regla graduada con una barra de avance (para medir tiempo en años, meses o días). */
export class Regla {
  readonly g: SVGGElement;
  private readonly base: SVGLineElement;
  private readonly barra: SVGLineElement;
  private readonly marcas: SVGLineElement[] = [];
  private readonly textos: (SVGTextElement | null)[] = [];
  constructor(l: Lienzo, readonly op: OpcionesRegla) {
    this.g = l.grupo({ class: `mo-regla ${op.clase}` }, op.padre);
    this.base = l.el('line', { class: 'mo-regla-base', x1: op.x0, x2: op.x1, y1: op.y, y2: op.y }, this.g);
    this.barra = l.el('line', { class: 'mo-regla-avance', x1: op.x0, x2: op.x0, y1: op.y, y2: op.y }, this.g);
    for (let k = 0; k <= op.divisiones; k++) {
      const x = this.x(k);
      const larga = k === 0 || k === op.divisiones;
      this.marcas.push(l.el('line', { class: larga ? 'mo-regla-marca larga' : 'mo-regla-marca', x1: x, x2: x, y1: op.y - (larga ? 9 : 5), y2: op.y + (larga ? 9 : 5) }, this.g));
      const r = op.rotulo?.(k) ?? null;
      this.textos.push(r === null ? null : l.texto(r, { class: 'mo-regla-texto', x, y: op.y + (op.tamRotulo ?? 15) + 12, 'text-anchor': 'middle', 'font-size': op.tamRotulo ?? 15 }, this.g));
    }
  }
  x(v: number): number {
    return mezclar(this.op.x0, this.op.x1, v / this.op.divisiones);
  }
  /** `marcas`: cuántas marcas se ven (0–1); `avance`: hasta dónde llega la barra, en divisiones. */
  pintar(opacidad: number, marcas: number, avance: number): void {
    const visibles = marcas * (this.op.divisiones + 1);
    this.marcas.forEach((m, k) => fijar(m, { opacity: k < visibles ? 1 : 0 }));
    this.textos.forEach((t, k) => t && fijar(t, { opacity: k < visibles ? 1 : 0 }));
    fijar(this.base, { x2: mezclar(this.op.x0, this.op.x1, Math.min(1, marcas * 1.05)) });
    fijar(this.barra, { x2: this.x(avance), opacity: avance > 0 ? 1 : 0 });
    situar(this.g, 0, 0, 1, opacidad);
  }
}

/** Glifo de la semilla (no es una medida: acompaña a C₀ cuando la escena no lo dibuja a escala). */
export class Semilla {
  readonly g: SVGGElement;
  constructor(l: Lienzo, padre?: Element) {
    this.g = l.grupo({ class: 'mo-semilla s-c0' }, padre);
    l.el('path', { d: 'M0 -26 C16 -16 18 8 0 22 C-18 8 -16 -16 0 -26 Z', class: 'mo-capsula-sombra', transform: 'translate(3 4)' }, this.g);
    l.el('path', { d: 'M0 -26 C16 -16 18 8 0 22 C-18 8 -16 -16 0 -26 Z', class: 'mo-semilla-cuerpo' }, this.g);
    l.el('path', { d: 'M0 -18 C5 -6 5 8 0 15', class: 'mo-semilla-linea', fill: 'none' }, this.g);
  }
  pintar(x: number, y: number, opacidad: number, escala = 1): void {
    const g = golpe(opacidad);
    situar(this.g, x, y, escala * g.escala, opacidad, g.giro);
  }
}

/** Contorno discontinuo de una cantidad que aún no se conoce (con un «?»). */
export class Hueco {
  readonly g: SVGGElement;
  private readonly rect: SVGRectElement;
  private readonly signo: SVGTextElement;
  constructor(l: Lienzo, clase: string, padre?: Element) {
    this.g = l.grupo({ class: `mo-hueco ${clase}` }, padre);
    this.rect = l.el('rect', { class: 'mo-hueco-cuerpo', rx: 8 }, this.g);
    this.signo = l.texto('?', { class: 'mo-hueco-signo', 'text-anchor': 'middle' }, this.g);
  }
  pintar(x: number, base: number, alto: number, ancho: number, opacidad: number, signo = 1): void {
    fijar(this.rect, { x: x - ancho / 2, y: base - alto, width: ancho, height: alto });
    fijar(this.signo, { x, y: base - alto / 2 + 12, opacity: signo });
    situar(this.g, 0, 0, 1, opacidad);
  }
}

/* --------------------------------------------------------------------------------- gráficas */

export interface OpcionesGrafico {
  x0: number; y0: number; x1: number; y1: number;
  xmin: number; xmax: number; ymin: number; ymax: number;
  padre?: Element;
}

/** Ejes cartesianos con su escala (x hacia la derecha, y hacia arriba). */
export class Grafico {
  readonly g: SVGGElement;
  private readonly ejeX: SVGLineElement;
  private readonly ejeY: SVGLineElement;
  constructor(private readonly l: Lienzo, readonly op: OpcionesGrafico) {
    this.g = l.grupo({ class: 'mo-grafico' }, op.padre);
    this.ejeX = l.el('line', { class: 'mo-grafico-eje', x1: op.x0, x2: op.x1, y1: op.y0, y2: op.y0 }, this.g);
    this.ejeY = l.el('line', { class: 'mo-grafico-eje', x1: op.x0, x2: op.x0, y1: op.y0, y2: op.y1 }, this.g);
  }
  px(x: number): number {
    return mezclar(this.op.x0, this.op.x1, (x - this.op.xmin) / (this.op.xmax - this.op.xmin));
  }
  py(y: number): number {
    return mezclar(this.op.y0, this.op.y1, (y - this.op.ymin) / (this.op.ymax - this.op.ymin));
  }
  /** Trazado de una función y = f(x) entre `desde` y `hasta` (con `p` se dibuja poco a poco). */
  camino(f: (x: number) => number, desde: number, hasta: number, p = 1, muestras = 80, mapaY: (y: number) => number = (y) => this.py(y)): string {
    const fin = mezclar(desde, hasta, p);
    let d = '';
    for (let k = 0; k <= muestras; k++) {
      const x = mezclar(desde, fin, k / muestras);
      d += `${k ? 'L' : 'M'}${Math.round(this.px(x) * 10) / 10} ${Math.round(mapaY(f(x)) * 10) / 10}`;
    }
    return d;
  }
  pintar(p: number, opacidad = 1): void {
    fijar(this.ejeX, { x2: mezclar(this.op.x0, this.op.x1, p) });
    fijar(this.ejeY, { y2: mezclar(this.op.y0, this.op.y1, p) });
    situar(this.g, 0, 0, 1, opacidad);
  }
  linea(clase: string): SVGPathElement {
    return this.l.el('path', { class: clase, fill: 'none' }, this.g);
  }
}

/** Salto curvo entre dos puntos con su rótulo (× 1,07; ÷ 1,07…). */
export class Salto {
  readonly path: SVGPathElement;
  readonly punta: SVGPathElement;
  readonly rotulo: SVGTextElement;
  constructor(l: Lienzo, clase: string, texto: string, padre?: Element) {
    const g = l.grupo({ class: `mo-salto ${clase}` }, padre);
    this.path = l.el('path', { class: 'mo-salto-arco', fill: 'none' }, g);
    this.punta = l.el('path', { class: 'mo-salto-punta', fill: 'none' }, g);
    this.rotulo = l.texto(texto, { class: 'mo-salto-texto', 'text-anchor': 'middle' }, g);
  }
  pintar(a: Punto, b: Punto, p: number, opacidad = 1, alto = 46, texto?: string): void {
    const m = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - alto };
    const largo = Math.hypot(b.x - a.x, b.y - a.y) * 1.3 + alto;
    fijar(this.path, { d: `M${a.x} ${a.y} Q${m.x} ${m.y} ${b.x} ${b.y}`, 'stroke-dasharray': `${largo} ${largo}`, 'stroke-dashoffset': largo * (1 - p), opacity: p <= 0 ? 0 : opacidad });
    const ang = Math.atan2(b.y - m.y, b.x - m.x);
    const s = 8;
    const p1 = { x: b.x - s * Math.cos(ang - 0.45), y: b.y - s * Math.sin(ang - 0.45) };
    const p2 = { x: b.x - s * Math.cos(ang + 0.45), y: b.y - s * Math.sin(ang + 0.45) };
    fijar(this.punta, { d: `M${p1.x} ${p1.y} L${b.x} ${b.y} L${p2.x} ${p2.y}`, opacity: p >= 0.98 ? opacidad : 0 });
    if (texto !== undefined && this.rotulo.textContent !== texto) this.rotulo.textContent = texto;
    fijar(this.rotulo, { x: m.x, y: (a.y + b.y) / 2 - alto * 0.55 - 6, opacity: p > 0.5 ? opacidad * Math.min(1, (p - 0.5) * 3) : 0 });
  }
}
