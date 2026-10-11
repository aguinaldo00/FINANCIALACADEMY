/*
 * Laboratorio de cada fórmula: qué datos pide, qué incógnita calcula y cómo se resuelve (sin
 * redondear: el redondeo es solo al mostrar). El cuaderno y el comprobador usan esto; los textos para
 * el alumno siguen en src/content. Las fórmulas que no calculan una incógnita (la comparación de
 * regímenes y la remesa) no tienen laboratorio de cálculo: el cuaderno queda libre.
 */
import { calcular, formatear } from './expresion.ts';

/** Clase de magnitud: decide cómo se escribe y cómo se compara. */
export type Magnitud = 'euros' | 'tipo' | 'tiempo' | 'partes';

export interface DatoLab {
  simbolo: string;
  magnitud: Magnitud;
}

export interface Laboratorio {
  datos: readonly DatoLab[];
  incognita: DatoLab;
  /** Resolución exacta con los datos en tanto por uno y n en la unidad del tipo. */
  resolver(d: Readonly<Record<string, number>>): number;
}

const E = (simbolo: string): DatoLab => ({ simbolo, magnitud: 'euros' });
const T = (simbolo: string): DatoLab => ({ simbolo, magnitud: 'tipo' });
const N: DatoLab = { simbolo: 'n', magnitud: 'tiempo' };
const M: DatoLab = { simbolo: 'm', magnitud: 'partes' };

const v = (d: Readonly<Record<string, number>>, s: string) => d[s]!;

export const LABORATORIOS: Readonly<Record<string, Laboratorio>> = {
  'simple-intereses': { datos: [E('C_0'), N, T('i')], incognita: E('I'), resolver: (d) => v(d, 'C_0') * v(d, 'n') * v(d, 'i') },
  'simple-montante': { datos: [E('C_0'), N, T('i')], incognita: E('C_n'), resolver: (d) => v(d, 'C_0') * (1 + v(d, 'n') * v(d, 'i')) },
  'simple-capital-inicial': { datos: [E('C_n'), N, T('i')], incognita: E('C_0'), resolver: (d) => v(d, 'C_n') / (1 + v(d, 'n') * v(d, 'i')) },
  'simple-tipo': { datos: [E('C_0'), E('C_n'), N], incognita: T('i'), resolver: (d) => (v(d, 'C_n') - v(d, 'C_0')) / (v(d, 'n') * v(d, 'C_0')) },
  'simple-tiempo': { datos: [E('C_0'), E('C_n'), T('i')], incognita: N, resolver: (d) => (v(d, 'C_n') - v(d, 'C_0')) / (v(d, 'i') * v(d, 'C_0')) },
  'simple-fraccionado': { datos: [T('i'), M], incognita: T('i_m'), resolver: (d) => v(d, 'i') / v(d, 'm') },
  'compuesta-montante': { datos: [E('C_0'), T('i'), N], incognita: E('C_n'), resolver: (d) => v(d, 'C_0') * (1 + v(d, 'i')) ** v(d, 'n') },
  'compuesta-intereses': { datos: [E('C_0'), T('i'), N], incognita: E('I'), resolver: (d) => v(d, 'C_0') * ((1 + v(d, 'i')) ** v(d, 'n') - 1) },
  'compuesta-capital-inicial': { datos: [E('C_n'), T('i'), N], incognita: E('C_0'), resolver: (d) => v(d, 'C_n') * (1 + v(d, 'i')) ** -v(d, 'n') },
  'compuesta-tiempo': { datos: [E('C_0'), E('C_n'), T('i')], incognita: N, resolver: (d) => Math.log(v(d, 'C_n') / v(d, 'C_0')) / Math.log(1 + v(d, 'i')) },
  'compuesta-tipo': { datos: [E('C_0'), E('C_n'), N], incognita: T('i'), resolver: (d) => (v(d, 'C_n') / v(d, 'C_0')) ** (1 / v(d, 'n')) - 1 },
  'compuesta-equivalentes': { datos: [T('i'), M], incognita: T('i_m'), resolver: (d) => (1 + v(d, 'i')) ** (1 / v(d, 'm')) - 1 },
  'compuesta-tae': { datos: [T('J_m'), M], incognita: T('TAE'), resolver: (d) => (1 + v(d, 'J_m') / v(d, 'm')) ** v(d, 'm') - 1 },
  'descuento-comercial': { datos: [E('N'), N, T('d')], incognita: E('D_c'), resolver: (d) => v(d, 'N') * v(d, 'n') * v(d, 'd') },
  'descuento-racional': { datos: [E('C_n'), N, T('i')], incognita: E('D_r'), resolver: (d) => (v(d, 'C_n') * v(d, 'n') * v(d, 'i')) / (1 + v(d, 'n') * v(d, 'i')) },
  'descuento-compuesto-racional': { datos: [E('C_n'), N, T('i')], incognita: E('D_r'), resolver: (d) => v(d, 'C_n') * (1 - (1 + v(d, 'i')) ** -v(d, 'n')) },
  'descuento-compuesto-comercial': { datos: [E('N'), N, T('d')], incognita: E('D_c'), resolver: (d) => v(d, 'N') * (1 - (1 - v(d, 'd')) ** v(d, 'n')) },
};

export type LecturaDato = { ok: true; valor: number; aviso?: string } | { ok: false; error: string } | { ok: 'vacio' };

/**
 * Lee lo escrito en la celda de un dato. Acepta una expresión (195/365, 7 %, 3.000). Si un tipo se
 * escribe sin % y es mayor que 1 (7 en lugar de 0,07 o 7 %), no se corrige: se avisa.
 */
export function leerDato(texto: string, magnitud: Magnitud): LecturaDato {
  if (!texto.trim()) return { ok: 'vacio' };
  const r = calcular(texto.replace(/€/g, '').replace(/años?|meses|días/gi, '').trim());
  if (!r.ok) return { ok: false, error: r.error };
  if (magnitud === 'tipo' && r.valor > 1 && !texto.includes('%')) {
    return { ok: true, valor: r.valor, aviso: `¿${formatear(r.valor, 0)} %? Escríbelo con el signo % o en tanto por uno (${formatear(r.valor / 100, 4)}).` };
  }
  return { ok: true, valor: r.valor };
}

/** Resultado esperado con los datos leídos, o null si falta alguno o no tiene sentido. */
export function esperado(lab: Laboratorio, valores: Readonly<Record<string, number | undefined>>): number | null {
  if (lab.datos.some((d) => valores[d.simbolo] === undefined)) return null;
  const r = lab.resolver(valores as Record<string, number>);
  return Number.isFinite(r) ? r : null;
}

/** Cómo se escribe el resultado según su magnitud: euros al céntimo, tipos en % con 4 decimales, n con 2. */
export function mostrar(valor: number, magnitud: Magnitud): string {
  if (magnitud === 'euros') return `${formatear(valor)} €`;
  if (magnitud === 'tipo') return `${formatear(valor * 100, 4)} %`;
  if (magnitud === 'tiempo') return formatear(valor, 2);
  return formatear(valor, 0);
}

export type Veredicto = { bien: boolean; mensaje: string };

/** Compara el resultado del alumno con el esperado, con la tolerancia de cada magnitud. */
export function comprobar(texto: string, lab: Laboratorio, valorEsperado: number): Veredicto {
  const lectura = leerDato(texto, lab.incognita.magnitud);
  if (lectura.ok === 'vacio') return { bien: false, mensaje: 'Escribe tu resultado.' };
  if (lectura.ok === false) return { bien: false, mensaje: lectura.error };
  const x = lectura.valor;
  const m = lab.incognita.magnitud;
  const cerca = (a: number, b: number) => (m === 'euros' ? Math.abs(a - b) < 0.0051 : m === 'tiempo' ? Math.abs(a - b) < 0.0051 : Math.abs(a - b) < 0.0000051);
  if (cerca(x, valorEsperado)) return { bien: true, mensaje: `Correcto: ${mostrar(valorEsperado, m)}.` };
  if (m === 'tipo' && cerca(x / 100, valorEsperado)) {
    return { bien: false, mensaje: `El número es el bueno, pero está en %: escríbelo con el signo % (${mostrar(valorEsperado, m)}) o en tanto por uno.` };
  }
  return { bien: false, mensaje: 'No coincide. Revisa los datos, la fórmula y la sustitución; la calculadora te puede explicar tu operación.' };
}
