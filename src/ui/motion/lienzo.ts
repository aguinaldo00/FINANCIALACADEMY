/*
 * Lienzo SVG de las animaciones: tres capas (fondo con paralaje, mundo bajo la cámara y frente sin
 * cámara para las fórmulas), una cámara con encuadre y zoom, y fórmulas maquetadas pieza a pieza
 * para que cada símbolo pueda viajar desde el elemento de la escena que representa.
 */
import { analizarFormula, claseSimbolo, type Nodo, parentesisGrandes } from '../matematica/formula.ts';
import { asegurarGrano, nuevaSemilla, rectanguloRecortado, ruido, trazoRotulador } from './papel.ts';
import { arco, curvas, limitar, mezclar, tramo } from './tiempo.ts';

export const SVG_NS = 'http://www.w3.org/2000/svg';
export const ANCHO = 720;
export const ALTO = 600;

type Atributos = Record<string, string | number | null | undefined>;
export interface Punto { x: number; y: number }

const cache = new WeakMap<Element, Map<string, string>>();

/** Fija atributos sin tocar el DOM si no han cambiado (cada fotograma se pintan muchos). */
export function fijar(el: Element, atributos: Atributos): void {
  let previos = cache.get(el);
  if (!previos) cache.set(el, (previos = new Map()));
  for (const [nombre, valor] of Object.entries(atributos)) {
    if (valor === null || valor === undefined) {
      if (previos.has(nombre)) {
        el.removeAttribute(nombre);
        previos.delete(nombre);
      }
      continue;
    }
    const texto = typeof valor === 'number' ? String(Math.round(valor * 100) / 100) : valor;
    if (previos.get(nombre) === texto) continue;
    el.setAttribute(nombre, texto);
    previos.set(nombre, texto);
  }
}

/** Opacidad y desplazamiento de un grupo (atajo para los fotogramas). */
export function situar(el: Element, x: number, y: number, escala = 1, opacidad = 1, giro = 0): void {
  fijar(el, {
    transform: `translate(${Math.round(x * 100) / 100} ${Math.round(y * 100) / 100})${giro ? ` rotate(${Math.round(giro * 10) / 10})` : ''}${escala !== 1 ? ` scale(${Math.round(escala * 1000) / 1000})` : ''}`,
    opacity: opacidad >= 0.999 ? null : Math.max(0, opacidad),
    visibility: opacidad <= 0.001 ? 'hidden' : null,
  });
}

export type Ambiente = 'papel' | 'noche';

export class Lienzo {
  readonly svg: SVGSVGElement;
  readonly defs: SVGDefsElement;
  readonly fondo: SVGGElement;
  readonly mundo: SVGGElement;
  readonly frente: SVGGElement;
  private readonly luz: SVGCircleElement;
  private camaraActual = { x: ANCHO / 2, y: ALTO / 2, z: 1 };
  private readonly formulas: FormulaSvg[] = [];
  private static contador = 0;
  readonly prefijo: string;
  /** Segundo que se está pintando (lo fija el reproductor; lo usa el temblor de los recortes). */
  instante = 0;

  /**
   * @param ambiente «papel» (Tema 2: papel cuadriculado con tinta) o «noche» (Tema 1: azul tinta con
   *   luz cálida, sin cuadrícula; el polvo del fondo da la profundidad).
   */
  constructor(titulo: string, readonly ambiente: Ambiente = 'papel') {
    this.prefijo = `mo${++Lienzo.contador}`;
    this.svg = document.createElementNS(SVG_NS, 'svg');
    fijar(this.svg, { viewBox: `0 0 ${ANCHO} ${ALTO}`, class: ambiente === 'noche' ? 'mo-svg mo-svg-noche' : 'mo-svg', role: 'img', 'aria-label': titulo, preserveAspectRatio: 'xMidYMid meet' });
    this.defs = this.el('defs', {}, this.svg);
    const p = this.prefijo;
    asegurarGrano();
    this.defs.innerHTML = `
      <radialGradient id="${p}-luz"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".6" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <linearGradient id="${p}-suelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87b32" stop-opacity=".16"/><stop offset=".35" stop-color="#a87b32" stop-opacity=".07"/><stop offset="1" stop-color="#a87b32" stop-opacity=".03"/></linearGradient>
      <filter id="${p}-halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`;
    this.el('rect', { width: ANCHO, height: ALTO, class: 'mo-papel' }, this.svg);
    this.fondo = this.el('g', { class: 'mo-fondo' }, this.svg);
    this.luz = this.el('circle', { r: 260, cx: ANCHO / 2, cy: ALTO / 2, fill: `url(#${p}-luz)` }, this.svg);
    this.mundo = this.el('g', { class: 'mo-mundo' }, this.svg);
    this.frente = this.el('g', { class: 'mo-frente' }, this.svg);
    if (ambiente === 'noche') {
      // Polvo en suspensión, a distintas distancias: con la cámara se mueve menos que el mundo.
      for (let k = 0; k < 90; k++) {
        const x = ANCHO / 2 + ruido(311, k) * (ANCHO / 2 + 600);
        const y = ALTO / 2 + ruido(733, k) * (ALTO / 2 + 400);
        this.el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (0.6 + Math.abs(ruido(97, k)) * 1.4).toFixed(2), class: 'mo-polvo', 'fill-opacity': (0.12 + Math.abs(ruido(53, k)) * 0.35).toFixed(2) }, this.fondo);
      }
      return;
    }
    // Papel cuadriculado (el de hacer los ejercicios), con paralaje para dar profundidad.
    for (let y = -480; y <= ALTO + 480; y += 32) this.el('line', { x1: -900, x2: ANCHO + 900, y1: y, y2: y, class: y % 160 === 0 ? 'mo-renglon fuerte' : 'mo-renglon' }, this.fondo);
    for (let x = -896; x <= ANCHO + 896; x += 32) this.el('line', { x1: x, x2: x, y1: -480, y2: ALTO + 480, class: x % 160 === 0 ? 'mo-renglon fuerte' : 'mo-renglon' }, this.fondo);
  }

  el<K extends keyof SVGElementTagNameMap>(etiqueta: K, atributos: Atributos = {}, padre: Element = this.mundo): SVGElementTagNameMap[K] {
    const nodo = document.createElementNS(SVG_NS, etiqueta) as SVGElementTagNameMap[K];
    fijar(nodo, atributos);
    padre.append(nodo);
    return nodo;
  }

  texto(contenido: string, atributos: Atributos = {}, padre: Element = this.mundo): SVGTextElement {
    const t = this.el('text', atributos, padre);
    t.textContent = contenido;
    return t;
  }

  grupo(atributos: Atributos = {}, padre: Element = this.mundo): SVGGElement {
    return this.el('g', atributos, padre);
  }

  /** Encuadre: (x, y) del mundo en el centro del lienzo con zoom z. El fondo se mueve menos (profundidad). */
  camara(x: number, y: number, z = 1): void {
    this.camaraActual = { x, y, z };
    const tx = ANCHO / 2 - x * z;
    const ty = ALTO / 2 - y * z;
    fijar(this.mundo, { transform: `translate(${Math.round(tx * 100) / 100} ${Math.round(ty * 100) / 100}) scale(${Math.round(z * 1000) / 1000})` });
    const zf = 1 + (z - 1) * 0.35;
    fijar(this.fondo, { transform: `translate(${Math.round((ANCHO / 2 - x * zf) * 0.35)} ${Math.round((ALTO / 2 - y * zf) * 0.35)}) scale(${Math.round(zf * 1000) / 1000})` });
  }

  /** Posición en el lienzo (capa frente) de un punto del mundo, con la cámara actual. */
  aPantalla(p: Punto): Punto {
    const { x, y, z } = this.camaraActual;
    return { x: ANCHO / 2 + (p.x - x) * z, y: ALTO / 2 + (p.y - y) * z };
  }

  /** La luz sigue a lo que importa: un foco suave sobre el centro de atención. */
  foco(x: number, y: number, radio = 260): void {
    fijar(this.luz, { cx: x, cy: y, r: radio });
  }

  formula(fuente: string, opciones: OpcionesFormula): FormulaSvg {
    const f = new FormulaSvg(this, fuente, opciones);
    this.formulas.push(f);
    return f;
  }

  /** Vuelve a medir las fórmulas (cuando terminan de cargar las fuentes). */
  remaquetar(): void {
    for (const f of this.formulas) f.maquetar();
  }
}

/* ---------------------------------------------------------------------------------- fórmulas */

export interface OpcionesFormula {
  x: number;
  y: number;
  tam?: number;
  alinear?: 'izquierda' | 'centro' | 'derecha';
  padre?: Element;
  /** Tarjeta de papel blanco detrás (por defecto, en las fórmulas grandes). */
  tarjeta?: boolean;
}

export interface PiezaFormula {
  g: SVGGElement;
  texto: SVGTextElement | null;
  /** Trazo de rotulador del color del símbolo, detrás de la letra. */
  marca: SVGPathElement | null;
  /** Clave del símbolo (C_0, n…) o null si es un número, operador o barra de fracción. */
  clave: string | null;
  tipo: Nodo['tipo'] | 'barra';
  x: number;
  y: number;
  ancho: number;
  tam: number;
}

interface Caja { ancho: number; sube: number; baja: number }

/** Ancho estimado si el navegador no puede medir (pruebas): proporcional a los caracteres. */
function estimar(texto: string, tam: number, mono: boolean): number {
  let w = 0;
  for (const c of texto) w += mono ? 0.6 : /[ilI1.,·()[\]]/.test(c) ? 0.36 : /[mwMW]/.test(c) ? 0.85 : /[−+=×÷<>≈]/.test(c) ? 0.62 : 0.56;
  return w * tam;
}

export class FormulaSvg {
  readonly g: SVGGElement;
  readonly piezas: PiezaFormula[] = [];
  readonly arbol: Nodo[];
  ancho = 0;
  sube = 0;
  baja = 0;
  private readonly tam: number;
  private cursor = 0;
  private readonly semilla = nuevaSemilla();
  private tarjeta: SVGPathElement | null = null;
  private tarjetaSombra: SVGPathElement | null = null;
  private centroTarjeta: Punto = { x: 0, y: 0 };

  /** La tarjeta cae sobre el papel con un pequeño golpe (q: 0 → 1). */
  private posarTarjeta(q: number): void {
    if (!this.tarjeta || !this.tarjetaSombra) return;
    const { x, y } = this.centroTarjeta;
    const e = mezclar(0.7, 1, curvas.muelle(q));
    const giro = (1 - q) * -3;
    const base = `translate(${x} ${y}) rotate(${giro.toFixed(2)}) scale(${e.toFixed(3)}) translate(${-x} ${-y})`;
    fijar(this.tarjeta, { transform: q >= 0.999 ? null : base, opacity: q <= 0.001 ? 0 : null });
    fijar(this.tarjetaSombra, { transform: `translate(${(4 + (1 - q) * 8).toFixed(1)} ${(5 + (1 - q) * 10).toFixed(1)}) ${q >= 0.999 ? '' : base}`, opacity: q <= 0.001 ? 0 : 0.16 });
  }

  constructor(private readonly lienzo: Lienzo, readonly fuente: string, private readonly opciones: OpcionesFormula) {
    this.tam = opciones.tam ?? 40;
    this.g = lienzo.grupo({ class: 'mo-formula' }, opciones.padre ?? lienzo.frente);
    if (opciones.tarjeta ?? this.tam >= 40) {
      this.tarjetaSombra = lienzo.el('path', { class: 'mo-tarjeta-sombra' }, this.g);
      this.tarjeta = lienzo.el('path', { class: 'mo-tarjeta' }, this.g);
    }
    this.arbol = analizarFormula(fuente);
    this.crear(this.arbol, this.tam);
    this.maquetar();
  }

  private hoja(tipo: PiezaFormula['tipo'], clave: string | null, tam: number, contenido: (t: SVGTextElement) => void, clase: string): void {
    const g = this.lienzo.grupo({}, this.g);
    const marca = clave ? this.lienzo.el('path', { class: `fx-marca s ${claseSimbolo(clave)}` }, g) : null;
    const texto = this.lienzo.el('text', { class: clase, 'font-size': tam }, g);
    contenido(texto);
    this.piezas.push({ g, texto, marca, clave, tipo, x: 0, y: 0, ancho: 0, tam });
  }

  private crear(fila: Nodo[], tam: number): void {
    for (const n of fila) {
      if (n.tipo === 'sim') {
        this.hoja('sim', n.clave, tam, (t) => {
          t.textContent = n.base;
          if (n.sub) {
            const sub = document.createElementNS(SVG_NS, 'tspan');
            fijar(sub, { 'font-size': Math.round(tam * 0.6), dy: Math.round(tam * 0.24), class: 'fx-sub' });
            sub.textContent = n.sub;
            t.append(sub);
          }
        }, `fx-sim s ${claseSimbolo(n.clave)}`);
      } else if (n.tipo === 'sup') {
        this.crear([n.base], tam);
        this.crear(n.exp, tam * 0.62);
      } else if (n.tipo === 'frac') {
        this.crear(n.num, tam);
        if (n.den.length) {
          const g = this.lienzo.grupo({}, this.g);
          this.lienzo.el('line', { class: 'fx-barra', x1: 0, x2: 1, y1: 0, y2: 0 }, g);
          this.piezas.push({ g, texto: null, marca: null, clave: null, tipo: 'barra', x: 0, y: 0, ancho: 0, tam });
          this.crear(n.den, tam);
        }
      } else {
        const clase = n.tipo === 'num' ? 'fx-num' : n.tipo === 'op' ? 'fx-op' : n.tipo === 'fn' ? 'fx-fn' : 'fx-txt';
        this.hoja(n.tipo, null, tam, (t) => { t.textContent = n.texto; }, clase);
      }
    }
  }

  private medir(p: PiezaFormula): number {
    const t = p.texto!;
    let w = 0;
    try {
      w = typeof t.getComputedTextLength === 'function' ? t.getComputedTextLength() : 0;
    } catch {
      w = 0;
    }
    return w > 0 ? w : estimar(t.textContent ?? '', p.tam, p.tipo === 'num');
  }

  /** Coloca la fila a partir de (x, y) de línea base; devuelve su caja. */
  private colocar(fila: Nodo[], tam: number, x: number, y: number): Caja {
    let ancho = 0;
    let sube = tam * 0.72;
    let baja = tam * 0.22;
    const grandes = parentesisGrandes(fila);
    fila.forEach((n, k) => {
      const inicio = this.cursor;
      const caja = this.colocarNodo(n, tam, x + ancho, y);
      // Paréntesis que abrazan una fracción: se estiran para que la abarquen.
      const p = this.piezas[inicio];
      if (p?.texto && grandes.has(k)) {
        const cy = -tam * 0.3;
        fijar(p.texto, { transform: `translate(0 ${cy}) scale(1 1.7) translate(0 ${-cy})` });
      }
      ancho += caja.ancho;
      sube = Math.max(sube, caja.sube);
      baja = Math.max(baja, caja.baja);
    });
    return { ancho, sube, baja };
  }

  private colocarNodo(n: Nodo, tam: number, x: number, y: number): Caja {
    if (n.tipo === 'sup') {
      const base = this.colocarNodo(n.base, tam, x, y);
      const exp = this.colocar(n.exp, tam * 0.62, x + base.ancho + tam * 0.04, y - tam * 0.46);
      return { ancho: base.ancho + exp.ancho + tam * 0.06, sube: Math.max(base.sube, tam * 0.46 + exp.sube), baja: base.baja };
    }
    if (n.tipo === 'frac') {
      if (!n.den.length) return this.colocar(n.num, tam, x, y);
      const eje = y - tam * 0.3;
      const hueco = tam * 0.2;
      // Primero se mide en un sitio provisional para conocer los anchos y después se centra.
      const inicio = this.cursor;
      const medNum = this.colocar(n.num, tam, 0, 0);
      const barra = this.piezas[this.cursor++]!;
      const medDen = this.colocar(n.den, tam, 0, 0);
      const ancho = Math.max(medNum.ancho, medDen.ancho) + tam * 0.36;
      this.cursor = inicio;
      const num = this.colocar(n.num, tam, x + (ancho - medNum.ancho) / 2, eje - hueco - medNum.baja);
      this.cursor++;
      fijar(barra.g.firstElementChild!, { x1: 0, x2: ancho - tam * 0.12 });
      barra.x = x + tam * 0.06;
      barra.y = eje;
      barra.ancho = ancho - tam * 0.12;
      const den = this.colocar(n.den, tam, x + (ancho - medDen.ancho) / 2, eje + hueco + medDen.sube);
      return { ancho, sube: tam * 0.3 + hueco + num.sube + num.baja, baja: Math.max(0, hueco + den.sube + den.baja - tam * 0.3) };
    }
    const p = this.piezas[this.cursor++]!;
    // Márgenes: las operaciones respiran; el signo de un número (−n) y la barra de dividir en línea
    // (1/n en un exponente) van más juntos, y una función (log) se separa de su argumento.
    const binario = n.tipo === 'op' && !n.unario && /^[=+−·×÷≈<>→/]$/.test(n.texto);
    const margen = binario ? tam * (n.texto === '·' ? 0.18 : n.texto === '/' ? 0.08 : 0.28) : n.tipo === 'txt' ? tam * 0.14 : 0;
    const tras = n.tipo === 'fn' ? tam * 0.16 : 0;
    const w = this.medir(p);
    p.x = x + margen;
    p.y = y;
    p.ancho = w;
    if (p.marca) {
      const sub = n.tipo === 'sim' && n.sub ? tam * 0.16 : 0;
      fijar(p.marca, { d: trazoRotulador(-tam * 0.08, w + tam * 0.06, -tam * 0.24 + sub / 2, tam * 0.72 + sub, this.semilla + this.cursor) });
    }
    return { ancho: w + margen * 2 + tras, sube: tam * 0.72, baja: tam * (n.tipo === 'sim' && n.sub ? 0.38 : 0.22) };
  }

  /** Mide y coloca todas las piezas (se repite al cargar las fuentes). */
  maquetar(): void {
    this.cursor = 0;
    const caja = this.colocar(this.arbol, this.tam, 0, 0);
    this.ancho = caja.ancho;
    this.sube = caja.sube;
    this.baja = caja.baja;
    const alinear = this.opciones.alinear ?? 'centro';
    const dx = this.opciones.x - (alinear === 'centro' ? caja.ancho / 2 : alinear === 'derecha' ? caja.ancho : 0);
    for (const p of this.piezas) {
      p.x += dx;
      p.y += this.opciones.y;
    }
    for (const p of this.piezas) situar(p.g, p.x, p.y);
    if (this.tarjeta && this.tarjetaSombra) {
      const pad = this.tam * 0.42;
      const d = rectanguloRecortado(dx - pad, this.opciones.y - caja.sube - pad * 0.7, caja.ancho + pad * 2, caja.sube + caja.baja + pad * 1.4, this.semilla, 1.6);
      fijar(this.tarjeta, { d });
      fijar(this.tarjetaSombra, { d });
      this.centroTarjeta = { x: dx + caja.ancho / 2, y: this.opciones.y - (caja.sube - caja.baja) / 2 };
    }
  }

  /** n-ésima pieza con ese símbolo. */
  pieza(clave: string, n = 0): PiezaFormula | undefined {
    return this.piezas.filter((p) => p.clave === clave)[n];
  }

  /** Centro visual de una pieza (para que otros elementos apunten a ella). */
  centro(p: PiezaFormula): Punto {
    return { x: p.x + p.ancho / 2, y: p.y - p.tam * 0.3 };
  }

  /** Dibuja la pieza desplazada (dx, dy), con escala y opacidad. */
  mover(p: PiezaFormula, dx: number, dy: number, escala = 1, opacidad = 1): void {
    if (p.tipo === 'barra') {
      fijar(p.g, { transform: `translate(${p.x + dx} ${p.y + dy}) scale(${Math.max(0.001, escala)} 1)`, opacity: opacidad >= 0.999 ? null : opacidad, visibility: opacidad <= 0.001 ? 'hidden' : null });
      return;
    }
    const cx = p.ancho / 2;
    const cy = -p.tam * 0.3;
    fijar(p.g, {
      transform: `translate(${Math.round((p.x + dx + cx) * 100) / 100} ${Math.round((p.y + dy + cy) * 100) / 100}) scale(${Math.round(escala * 1000) / 1000}) translate(${Math.round(-cx * 100) / 100} ${Math.round(-cy * 100) / 100})`,
      opacity: opacidad >= 0.999 ? null : Math.max(0, opacidad),
      visibility: opacidad <= 0.001 ? 'hidden' : null,
    });
  }

  /** Trazo de rotulador detrás del símbolo: se pasa de izquierda a derecha (0 → 1). */
  marcar(p: PiezaFormula, progreso: number): void {
    if (!p.marca) return;
    const x0 = -p.tam * 0.08;
    fijar(p.marca, { transform: progreso >= 0.999 ? null : `translate(${x0} 0) scale(${Math.max(0.001, progreso)} 1) translate(${-x0} 0)`, opacity: progreso <= 0.001 ? 0 : null });
  }

  /** Toda la fórmula con la misma opacidad (para fundidos). */
  opacidad(o: number): void {
    fijar(this.g, { opacity: o >= 0.999 ? null : Math.max(0, o), visibility: o <= 0.001 ? 'hidden' : null });
  }

  /**
   * La fórmula se construye a partir de la escena: cada símbolo con origen viaja desde su elemento
   * (en coordenadas del frente) describiendo un arco; los operadores aparecen en su sitio después.
   */
  construir(t: number, inicio: number, opciones: { origenes?: Record<string, Punto | (Punto | undefined)[] | undefined>; duracion?: number; escalon?: number; resaltar?: string[] } = {}): void {
    const duracion = opciones.duracion ?? 1.1;
    const escalon = opciones.escalon ?? 0.12;
    this.posarTarjeta(tramo(t, inicio - 0.15, inicio + 0.3, curvas.lineal));
    const usados = new Map<string, number>();
    let orden = 0;
    for (const p of this.piezas) {
      const vez = p.clave ? (usados.get(p.clave) ?? 0) : 0;
      if (p.clave) usados.set(p.clave, vez + 1);
      const fuente = p.clave ? opciones.origenes?.[p.clave] : undefined;
      const origen = Array.isArray(fuente) ? fuente[vez] : fuente;
      if (origen) {
        const t0 = inicio + orden++ * escalon;
        const q = tramo(t, t0, t0 + duracion, curvas.suave);
        const c = this.centro(p);
        const pos = arco(origen, c, q);
        const resalte = opciones.resaltar?.includes(p.clave!) ? 1 + 0.35 * Math.sin(Math.PI * limitar((t - t0 - duracion) / 0.6)) : 1;
        // Llega con un pequeño golpe (escala que se pasa y vuelve) y el rotulador se pasa después.
        const golpe = 1 + 0.18 * Math.sin(Math.PI * limitar((t - t0 - duracion * 0.82) / 0.32));
        this.mover(p, pos.x - c.x, pos.y - c.y, mezclar(0.7, 1, q) * resalte * golpe, tramo(t, t0, t0 + 0.25));
        this.marcar(p, tramo(t, t0 + duracion * 0.85, t0 + duracion + 0.3, curvas.salida));
      } else {
        const t0 = inicio + duracion * 0.55 + orden * escalon * 0.5;
        const q = tramo(t, t0, t0 + 0.55, curvas.salida);
        if (p.tipo === 'barra') this.mover(p, 0, 0, q, q > 0 ? 1 : 0);
        else this.mover(p, 0, (1 - q) * 14, mezclar(0.85, 1, curvas.muelle(q)), q);
        this.marcar(p, tramo(t, t0 + 0.2, t0 + 0.6, curvas.salida));
      }
    }
  }
}
