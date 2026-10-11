/*
 * Notación única de las fórmulas del Tema 2. Una fórmula se escribe una vez, en un formato corto, y
 * se pinta igual en el índice (HTML), en las animaciones (SVG) y en los textos accesibles.
 *
 *   C_n = C_0 · (1 + n · i)          símbolos: C_0, C_n, C_1…, I, i, i_m, n, m, J_m, TAE, N, E, D, D_r, D_c, d
 *   \frac{C_n − C_0}{n · C_0}        fracción
 *   (1 + i)^{n}  ·  (1 + i)^n        exponente
 *   "años"                           texto literal
 *
 * Cada símbolo lleva la clase de su papel (`s s-c0`, `s s-cn`…): el color es una ayuda, nunca la
 * única pista, porque el símbolo siempre va escrito.
 */
import { simbolo, type PapelSimbolo } from '../../content/temas/tema-02/simbolos.ts';
import { escaparHtml } from '../components/simbolos.ts';

export type Nodo =
  | { tipo: 'sim'; clave: string; base: string; sub: string }
  | { tipo: 'num'; texto: string }
  | { tipo: 'op'; texto: string }
  | { tipo: 'txt'; texto: string }
  | { tipo: 'fn'; texto: string }
  | { tipo: 'frac'; num: Nodo[]; den: Nodo[] }
  | { tipo: 'sup'; base: Nodo; exp: Nodo[] };

/** Clase de color de cada papel (las mismas clases que ya usaba la lección: s-c0, s-cn, s-i, s-n, s-I). */
export const CLASE_PAPEL: Record<PapelSimbolo, string> = {
  presente: 's-c0',
  futuro: 's-cn',
  interes: 's-I',
  descuento: 's-D',
  tipo: 's-i',
  tiempo: 's-n',
  fraccion: 's-m',
};

export function claseSimbolo(clave: string): string {
  const s = simbolo(clave);
  return s ? CLASE_PAPEL[s.papel] : '';
}

const TOKEN = /\s+|\\frac|[{}^]|"[^"]*"|\d+(?:[.,]\d+)*|[A-Za-zÀ-ÿ]+(?:_(?:\{[^}]*\}|[A-Za-z0-9]+))?|./gu;
const OPERADORES_BINARIOS = new Set(['=', '+', '−', '-', '·', '×', '÷', '≈', '<', '>', '→', '/']);

function nodoIdentificador(t: string): Nodo {
  const [base, subCrudo] = t.split('_') as [string, string | undefined];
  const sub = (subCrudo ?? '').replace(/[{}]/g, '');
  const clave = sub ? `${base}_${sub}` : base;
  if (simbolo(clave)) return { tipo: 'sim', clave, base, sub };
  if (base === 'log' || base === 'ln') return { tipo: 'fn', texto: base };
  return { tipo: 'txt', texto: t };
}

/** Convierte la notación en un árbol (filas de nodos, fracciones y exponentes). */
export function analizarFormula(fuente: string): Nodo[] {
  const tokens = [...fuente.matchAll(TOKEN)].map((m) => m[0]).filter((t) => !/^\s+$/.test(t));
  let pos = 0;

  function grupo(): Nodo[] {
    if (tokens[pos] !== '{') throw new SyntaxError(`Se esperaba "{" en: ${fuente}`);
    pos++;
    const fila = filaHasta('}');
    pos++;
    return fila;
  }

  function atomo(): Nodo {
    const t = tokens[pos++]!;
    if (t === '\\frac') return { tipo: 'frac', num: grupo(), den: grupo() };
    if (t === '{') {
      pos--;
      const fila = grupo();
      return fila.length === 1 ? fila[0]! : { tipo: 'frac', num: fila, den: [] };
    }
    if (t.startsWith('"')) return { tipo: 'txt', texto: t.slice(1, -1) };
    if (/^\d/.test(t)) return { tipo: 'num', texto: t };
    if (/^[A-Za-zÀ-ÿ]/.test(t)) return nodoIdentificador(t);
    return { tipo: 'op', texto: t === '-' ? '−' : t };
  }

  function filaHasta(fin: string | null): Nodo[] {
    const fila: Nodo[] = [];
    while (pos < tokens.length && tokens[pos] !== fin) {
      if (tokens[pos] === '^') {
        pos++;
        const base = fila.pop();
        if (!base) throw new SyntaxError(`Exponente sin base en: ${fuente}`);
        const exp = tokens[pos] === '{' ? grupo() : [atomo()];
        fila.push({ tipo: 'sup', base, exp });
        continue;
      }
      fila.push(atomo());
    }
    return fila;
  }

  return filaHasta(null);
}

/* --------------------------------------------------------------------------------------- HTML */

const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', n: 'ₙ', m: 'ₘ', r: 'ᵣ' };
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', n: 'ⁿ', m: 'ᵐ', '−': '⁻', '-': '⁻' };

function simHtml(n: Extract<Nodo, { tipo: 'sim' }>): string {
  const sub = n.sub ? `<sub>${escaparHtml(n.sub)}</sub>` : '';
  return `<var class="s ${claseSimbolo(n.clave)}" data-sim="${n.clave}">${escaparHtml(n.base)}${sub}</var>`;
}

function nodoHtml(n: Nodo): string {
  switch (n.tipo) {
    case 'sim': return simHtml(n);
    case 'num': return `<span class="fx-num">${escaparHtml(n.texto)}</span>`;
    case 'fn': return `<span class="fx-fn">${n.texto}</span>`;
    case 'txt': return `<span class="fx-txt">${escaparHtml(n.texto)}</span>`;
    case 'op': return OPERADORES_BINARIOS.has(n.texto) ? `<span class="fx-op fx-bin">${escaparHtml(n.texto)}</span>` : `<span class="fx-op">${escaparHtml(n.texto)}</span>`;
    case 'sup': return `${nodoHtml(n.base)}<sup>${filaHtml(n.exp)}</sup>`;
    case 'frac': return n.den.length
      ? `<span class="fx-frac"><span class="fx-frac-n">${filaHtml(n.num)}</span><span class="fx-frac-d">${filaHtml(n.den)}</span></span>`
      : filaHtml(n.num);
  }
}

const filaHtml = (fila: Nodo[]): string => fila.map(nodoHtml).join('');

/** Fórmula en HTML coloreado, con su lectura en texto para lectores de pantalla. */
export function formulaHtml(fuente: string, clase = ''): string {
  return `<span class="fx${clase ? ` ${clase}` : ''}" role="math" aria-label="${escaparHtml(formulaTexto(fuente))}">${filaHtml(analizarFormula(fuente))}</span>`;
}

/* -------------------------------------------------------------------------------------- texto */

function aIndice(texto: string, tabla: Record<string, string>): string | null {
  const chars = [...texto];
  return chars.every((c) => tabla[c]) ? chars.map((c) => tabla[c]).join('') : null;
}

function nodoTexto(n: Nodo): string {
  switch (n.tipo) {
    case 'sim': return n.base + (n.sub ? aIndice(n.sub, SUB) ?? n.sub : '');
    case 'num': case 'fn': case 'txt': return n.texto;
    case 'op': return OPERADORES_BINARIOS.has(n.texto) ? ` ${n.texto} ` : n.texto;
    case 'sup': {
      const exp = filaTexto(n.exp).replace(/\s+/g, '');
      return nodoTexto(n.base) + (aIndice(exp, SUP) ?? `^(${exp})`);
    }
    case 'frac': return n.den.length ? `(${filaTexto(n.num)}) / (${filaTexto(n.den)})` : filaTexto(n.num);
  }
}

const filaTexto = (fila: Nodo[]): string => fila.map(nodoTexto).join('').replace(/\s{2,}/g, ' ').trim();

/** Fórmula en una línea de texto con subíndices Unicode (para aria-label y comprobaciones). */
export function formulaTexto(fuente: string): string {
  return filaTexto(analizarFormula(fuente));
}

/** Claves de los símbolos que aparecen en la fórmula, sin repetir y en orden de aparición. */
export function simbolosDe(fuente: string): string[] {
  const vistos: string[] = [];
  const recorrer = (fila: Nodo[]) => {
    for (const n of fila) {
      if (n.tipo === 'sim' && !vistos.includes(n.clave)) vistos.push(n.clave);
      if (n.tipo === 'sup') { recorrer([n.base]); recorrer(n.exp); }
      if (n.tipo === 'frac') { recorrer(n.num); recorrer(n.den); }
    }
  };
  recorrer(analizarFormula(fuente));
  return vistos;
}

/** Símbolo como HTML suelto (para listas de datos y leyendas). */
export function simboloHtml(clave: string): string {
  return formulaHtml(clave, 'fx-suelto');
}
