/*
 * Piezas de papel recortado de la identidad editorial: bloques con volumen y sombra, etiquetas que
 * «caen» sobre el papel, notas escritas a mano, flechas discontinuas y la metáfora de la fórmula 1 (la
 * semilla es C₀, los tomates de cada año son los intereses). La metáfora solo la usa esa animación
 * (escenas/simpleIntereses.ts); las etiquetas, notas y flechas las comparten otras.
 */
import { fijar, type Lienzo, situar, SVG_NS } from './lienzo.ts';
import { nuevaSemilla, rectanguloRecortado, temblor } from './papel.ts';
import { curvas, limitar, mezclar, tramo } from './tiempo.ts';

/** Caída de una pieza de papel: llega grande e inclinada, se pasa un poco y se asienta. */
export function caida(p: number, giroFinal = 0): { escala: number; giro: number; sombra: number; opacidad: number } {
  const q = limitar(p);
  return {
    escala: q <= 0 ? 1.4 : mezclar(1.4, 1, curvas.muelle(q)),
    giro: mezclar(giroFinal + (giroFinal >= 0 ? 9 : -9), giroFinal, curvas.salida(q)),
    sombra: mezclar(16, 4, curvas.salida(q)),
    opacidad: tramo(q, 0, 0.2, curvas.lineal),
  };
}

/* -------------------------------------------------------------------- semilla de capital */

/** Contorno de una semilla (un huevo de punta suave) centrada en (cx, cy), de ancho w y alto h. */
function contornoSemilla(cx: number, cy: number, w: number, h: number): string {
  const p = (dx: number, dy: number) => `${(cx + dx * w).toFixed(1)} ${(cy + dy * h).toFixed(1)}`;
  return `M${p(0, -0.5)} C${p(0.4, -0.48)} ${p(0.5, -0.12)} ${p(0.5, 0.08)} C${p(0.5, 0.34)} ${p(0.28, 0.5)} ${p(0, 0.5)}`
    + ` C${p(-0.28, 0.5)} ${p(-0.5, 0.34)} ${p(-0.5, 0.08)} C${p(-0.5, -0.12)} ${p(-0.4, -0.48)} ${p(0, -0.5)} Z`;
}

/**
 * El capital inicial como la semilla de la metáfora de la fórmula 1: cae sobre el papel, se asienta
 * y de ella brota la planta. Solo la usa esa animación (la metáfora no se extiende a otras fórmulas).
 */
export class SemillaCapital {
  readonly g: SVGGElement;
  readonly semilla = nuevaSemilla();
  private readonly cx: number;
  private readonly base: number;
  constructor(private readonly l: Lienzo, x: number, y: number, ancho: number, alto: number, clase: string) {
    this.g = l.grupo({ class: `ref-bloque ref-semilla ${clase}` });
    this.cx = x + ancho / 2;
    this.base = y + alto;
    const cy = y + alto / 2;
    const d = contornoSemilla(this.cx, cy, ancho, alto);
    l.el('path', { d, class: 'ref-sombra', transform: 'translate(6 8)' }, this.g);
    l.el('path', { d, class: 'ref-semilla-cuerpo' }, this.g);
    // Volumen: el lado en sombra y un brillo arriba a la izquierda; la costura, como en una semilla real.
    const q = (dx: number, dy: number) => `${(this.cx + dx * ancho).toFixed(1)} ${(cy + dy * alto).toFixed(1)}`;
    l.el('path', { d: `M${q(0, -0.5)} C${q(0.4, -0.48)} ${q(0.5, -0.12)} ${q(0.5, 0.08)} C${q(0.5, 0.34)} ${q(0.28, 0.5)} ${q(0, 0.5)} C${q(0.3, 0.3)} ${q(0.34, -0.2)} ${q(0, -0.5)} Z`, class: 'ref-semilla-sombra' }, this.g);
    l.el('ellipse', { cx: this.cx - ancho * 0.22, cy: cy - alto * 0.2, rx: ancho * 0.1, ry: alto * 0.17, class: 'ref-semilla-brillo', transform: `rotate(18 ${this.cx - ancho * 0.22} ${cy - alto * 0.2})` }, this.g);
    l.el('path', { d: `M${q(0.02, -0.46)} C${q(0.16, -0.2)} ${q(0.14, 0.2)} ${q(0.04, 0.46)}`, class: 'ref-semilla-costura', fill: 'none' }, this.g);
  }
  /** Caída desde arriba con aplastamiento al tocar el suelo (como las piezas de papel). */
  pintar(t: number, inicio: number, resalte = 0): void {
    const p = tramo(t, inicio, inicio + 0.5, curvas.entrada);
    const impacto = tramo(t, inicio + 0.5, inicio + 1.0);
    const aplasta = Math.sin(Math.PI * impacto) * (1 - impacto * 0.4);
    const dy = mezclar(-190, 0, p);
    const tb = temblor(this.semilla, this.l.instante, 0.7);
    fijar(this.g, {
      transform: `translate(${this.cx + tb.dx} ${this.base + dy}) scale(${(1 + 0.08 * aplasta + resalte * 0.03).toFixed(3)} ${(1 - 0.1 * aplasta + resalte * 0.03).toFixed(3)}) translate(${-this.cx} ${-this.base})`,
      opacity: t < inicio ? 0 : null,
    });
  }
}

/* --------------------------------------------------------------------------- vegetación */

const HOJA = 'M0 0 C 7 -9, 20 -11, 30 0 C 20 11, 7 9, 0 0 Z';
const NERVIO = 'M2 0 L26 0';

interface Hoja { g: SVGGElement; t: number; giro: number; x: number; y: number; escala: number }

/** Planta que brota del capital: un tallo que se dibuja y hojas que se abren una a una. */
export class Planta {
  readonly g: SVGGElement;
  private readonly tallo: SVGPathElement;
  private readonly hojas: Hoja[] = [];
  private largo = 0;
  constructor(l: Lienzo, x: number, y: number, alto: number) {
    this.g = l.grupo({ class: 'ref-planta' });
    const d = `M${x} ${y} C ${x - 10} ${y - alto * 0.35}, ${x + 14} ${y - alto * 0.65}, ${x + 2} ${y - alto}`;
    this.tallo = l.el('path', { d, class: 'ref-tallo', fill: 'none' }, this.g);
    this.largo = alto * 1.12;
    const puntos: [number, number, number, number][] = [
      [0.3, -150, 0.85, 0.12], [0.42, -25, 0.9, 0.2], [0.58, -160, 1, 0.3], [0.7, -15, 1, 0.42], [0.84, -140, 0.95, 0.55], [0.95, -60, 1.05, 0.66], [0.98, -110, 0.9, 0.74],
    ];
    for (const [f, giro, escala, t0] of puntos) {
      const hg = l.grupo({ class: 'ref-hoja s-I' }, this.g);
      l.el('path', { d: HOJA, class: 'ref-hoja-sombra', transform: 'translate(2 3)' }, hg);
      l.el('path', { d: HOJA, class: 'ref-hoja-cuerpo' }, hg);
      l.el('path', { d: NERVIO, class: 'ref-nervio' }, hg);
      const px = x + (f < 0.5 ? -6 : 6) * Math.sin(f * 6) + 2 * f;
      this.hojas.push({ g: hg, t: t0, giro, x: px, y: y - alto * f, escala });
    }
  }
  pintar(t: number, inicio: number, duracion: number): void {
    const p = tramo(t, inicio, inicio + duracion * 0.6, curvas.salida);
    fijar(this.tallo, { 'stroke-dasharray': `${this.largo} ${this.largo}`, 'stroke-dashoffset': this.largo * (1 - p), opacity: t < inicio ? 0 : 1 });
    for (const h of this.hojas) {
      const q = tramo(t, inicio + duracion * h.t, inicio + duracion * h.t + 0.45, curvas.muelle);
      // Un balanceo lento: la planta está viva, nunca del todo quieta.
      const viento = Math.sin(t * 1.3 + h.y * 0.05) * 3;
      situar(h.g, h.x, h.y, Math.max(0.001, q * h.escala), q > 0 ? 1 : 0, h.giro + viento);
    }
  }
}

/** La tomatera de un año: tallo, hojas y tomates. Todas iguales: los intereses de cada año son los mismos. */
export class Arbol {
  readonly g: SVGGElement;
  private readonly tronco: SVGPathElement;
  private readonly copa: Hoja[] = [];
  private readonly frutos: { c: SVGGElement; x: number; y: number; t: number }[] = [];
  constructor(l: Lienzo, readonly x: number, readonly suelo: number) {
    this.g = l.grupo({ class: 'ref-arbol' });
    this.tronco = l.el('path', { d: `M${x} ${suelo} C ${x - 3} ${suelo - 32}, ${x + 4} ${suelo - 60}, ${x} ${suelo - 84}`, class: 'ref-tallo', fill: 'none' }, this.g);
    const hojas: [number, number, number][] = [[-30, -70, -170], [-18, -86, -130], [0, -94, -90], [18, -86, -50], [30, -70, -10], [-24, -58, 160], [24, -58, 20], [-8, -76, -110], [8, -76, -70]];
    hojas.forEach(([dx, dy, giro], k) => {
      const hg = l.grupo({ class: 'ref-hoja s-I' }, this.g);
      l.el('path', { d: HOJA, class: 'ref-hoja-sombra', transform: 'translate(2 3)' }, hg);
      l.el('path', { d: HOJA, class: 'ref-hoja-cuerpo' }, hg);
      l.el('path', { d: NERVIO, class: 'ref-nervio' }, hg);
      // Copa por encima de la etiqueta del año (que se coloca a media altura del tronco).
      this.copa.push({ g: hg, t: k * 0.04, giro, x: x + dx * 0.45, y: suelo - 72 + (dy + 76) * 0.6, escala: 0.95 });
    });
    // Los tomates: los intereses de ese año. Su número es solo dibujo; lo que valen lo dice la etiqueta.
    const frutos: [number, number][] = [[-16, -62], [12, -70], [-2, -50], [20, -52]];
    frutos.forEach(([dx, dy], k) => {
      const c = l.grupo({ class: 'ref-fruto ref-tomate' }, this.g);
      l.el('circle', { r: 8, class: 'ref-fruto-cuerpo' }, c);
      l.el('circle', { r: 2.2, cx: -2.6, cy: -2.4, class: 'ref-fruto-brillo' }, c);
      l.el('path', { d: 'M0 -8.5 L2.6 -11 L1.6 -7.4 L5 -8.4 L1.8 -6 M0 -8.5 L-2.6 -11 L-1.6 -7.4 L-5 -8.4 L-1.8 -6', class: 'ref-tomate-caliz s-I', fill: 'none' }, c);
      this.frutos.push({ c, x: x + dx, y: suelo - 72 + (dy + 60) * 0.7, t: k * 0.09 });
    });
  }
  pintar(t: number, inicio: number): void {
    const p = tramo(t, inicio, inicio + 0.5, curvas.salida);
    fijar(this.tronco, { 'stroke-dasharray': '96 96', 'stroke-dashoffset': 96 * (1 - p), opacity: t < inicio ? 0 : 1 });
    for (const h of this.copa) {
      const q = tramo(t, inicio + 0.3 + h.t, inicio + 0.75 + h.t, curvas.muelle);
      const viento = Math.sin(t * 1.1 + h.x * 0.03) * 2.5;
      situar(h.g, h.x, h.y, Math.max(0.001, q * h.escala), q > 0 ? 1 : 0, h.giro + viento);
    }
    for (const f of this.frutos) {
      const q = tramo(t, inicio + 0.8 + f.t, inicio + 1.15 + f.t, curvas.muelle);
      situar(f.c, f.x, f.y, Math.max(0.001, q), q > 0 ? 1 : 0);
    }
  }
}

/* ------------------------------------------------------------------- papel y escritura */

/** Etiqueta de papel rasgado con texto; cae sobre la escena (o se mueve a otro sitio). */
export class Etiqueta {
  readonly g: SVGGElement;
  private readonly sombra: SVGPathElement;
  private readonly cuerpo: SVGPathElement;
  readonly texto: SVGTextElement;
  readonly semilla = nuevaSemilla();
  constructor(l: Lienzo, contenido: string, readonly ancho: number, readonly alto: number, clase: string, claseTexto = 'ref-etiqueta-texto', padre?: Element) {
    this.g = l.grupo({ class: `ref-etiqueta ${clase}` }, padre);
    this.sombra = l.el('path', { class: 'ref-sombra' }, this.g);
    this.cuerpo = l.el('path', { class: 'ref-etiqueta-cuerpo' }, this.g);
    const d = rectanguloRecortado(-ancho / 2, -alto / 2, ancho, alto, this.semilla, 2.2);
    fijar(this.cuerpo, { d });
    fijar(this.sombra, { d });
    this.texto = l.texto(contenido, { class: claseTexto, 'text-anchor': 'middle', y: alto * 0.2 }, this.g);
  }
  /** Coloca la etiqueta; `p` es el progreso de su caída (0 → 1). */
  pintar(x: number, y: number, p: number, giro = 0, opacidad = 1): void {
    const c = caida(p, giro);
    fijar(this.sombra, { transform: `translate(${c.sombra * 0.5} ${c.sombra})` });
    situar(this.g, x, y, c.escala, c.opacidad * opacidad, c.giro);
  }
}

/** Nota escrita a mano: el texto se descubre de izquierda a derecha, como si se escribiera. */
export class Nota {
  readonly g: SVGGElement;
  private readonly mascara: SVGRectElement;
  private readonly lineas: SVGTextElement[] = [];
  constructor(l: Lienzo, lineas: string[], x: number, y: number, private readonly anchoMax: number, clase = 'ref-nota', interlinea = 22) {
    const id = `${l.prefijo}-nota-${Math.random().toString(36).slice(2, 8)}`;
    const clip = document.createElementNS(SVG_NS, 'clipPath');
    clip.id = id;
    l.defs.append(clip);
    this.mascara = l.el('rect', { x: x - 4, y: y - 24, width: 0, height: lineas.length * interlinea + 20 }, clip);
    this.g = l.grupo({ class: clase, 'clip-path': `url(#${id})` });
    lineas.forEach((t, k) => this.lineas.push(l.texto(t, { x, y: y + k * interlinea }, this.g)));
    this.x0 = x;
  }
  private readonly x0: number;
  pintar(p: number, opacidad = 1): void {
    fijar(this.mascara, { width: (this.anchoMax + 8) * limitar(p) });
    fijar(this.g, { opacity: opacidad <= 0.001 ? 0 : opacidad });
    void this.x0;
  }
}

/** Flecha discontinua dibujada a mano, con punta, que se traza de a hasta b por un arco. */
export class Flecha {
  readonly g: SVGGElement;
  private readonly arco: SVGPathElement;
  private readonly punta: SVGPathElement;
  constructor(l: Lienzo, clase = 'ref-flecha') {
    this.g = l.grupo({ class: clase });
    this.arco = l.el('path', { fill: 'none', class: 'ref-flecha-arco' }, this.g);
    this.punta = l.el('path', { fill: 'none', class: 'ref-flecha-punta' }, this.g);
  }
  /** Devuelve el punto de la cabeza (para lo que viaja por la flecha). */
  pintar(a: { x: number; y: number }, b: { x: number; y: number }, alto: number, p: number, opacidad = 1): { x: number; y: number } {
    const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - alto };
    const q = limitar(p);
    // Se recorta la curva (de Bézier cuadrática) hasta q para «dibujarla».
    const punto = (s: number) => ({ x: (1 - s) ** 2 * a.x + 2 * (1 - s) * s * c.x + s * s * b.x, y: (1 - s) ** 2 * a.y + 2 * (1 - s) * s * c.y + s * s * b.y });
    const pasos = 28;
    let d = '';
    for (let k = 0; k <= pasos; k++) {
      const s = (k / pasos) * q;
      const pt = punto(s);
      d += `${k ? 'L' : 'M'}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }
    const cabeza = punto(q);
    const antes = punto(Math.max(0, q - 0.04));
    const ang = Math.atan2(cabeza.y - antes.y, cabeza.x - antes.x);
    const s = 9;
    const p1 = { x: cabeza.x - s * Math.cos(ang - 0.5), y: cabeza.y - s * Math.sin(ang - 0.5) };
    const p2 = { x: cabeza.x - s * Math.cos(ang + 0.5), y: cabeza.y - s * Math.sin(ang + 0.5) };
    fijar(this.arco, { d: q > 0 ? d : '', opacity: opacidad });
    fijar(this.punta, { d: q > 0.96 ? `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${cabeza.x.toFixed(1)} ${cabeza.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}` : '', opacity: opacidad });
    return cabeza;
  }
}

/** Trozo de cinta adhesiva (para «pegar» etiquetas al papel). */
export function cinta(l: Lienzo, padre: Element, x: number, y: number, ancho: number, giro: number): SVGPathElement {
  return l.el('path', { d: rectanguloRecortado(x - ancho / 2, y - 7, ancho, 14, nuevaSemilla(), 1.4), class: 'ref-cinta', transform: `rotate(${giro} ${x} ${y})` }, padre);
}
