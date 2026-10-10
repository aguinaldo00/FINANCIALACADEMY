import type { ParametrosCapitalizacion } from '../../../domain/capitalizacionCompuesta.ts';

export interface TemaMatematica {
  numero: number;
  titulo: string;
  fuente: string;
  primeraLeccion: string;
}

export const tema02: TemaMatematica = {
  numero: 2,
  titulo: 'Matemática financiera',
  fuente: 'Unidad 2 · Gestión financiera',
  primeraLeccion: 'Capitalización compuesta',
};

/** Lecciones del tema 2 (por ahora una). El id es el segmento de la ruta `#tema/2/<id>`. */
export const LECCIONES_TEMA2 = [
  { id: 'capitalizacion-compuesta', titulo: 'Capitalización compuesta', subtitulo: 'Notación, cálculo y práctica' },
] as const;

export type LeccionTema2 = (typeof LECCIONES_TEMA2)[number]['id'];

/**
 * Partes de cada lección, en el orden en que conviene estudiarlas: primero los símbolos (antes de
 * la explicación), después el ejemplo resuelto, los errores y, al final, la práctica sin ayuda.
 * El id es el segmento de la ruta `#tema/2/<lección>/<parte>`.
 */
export const PARTES_LECCION = [
  { id: 'simbolos', titulo: 'Los símbolos', subtitulo: 'Antes de empezar' },
  { id: 'leccion', titulo: 'Paso a paso', subtitulo: 'Ejemplo resuelto' },
  { id: 'errores', titulo: 'Errores típicos', subtitulo: 'Y cómo evitarlos' },
  { id: 'papel', titulo: 'Tu turno, en papel', subtitulo: 'Cada vez con menos ayuda' },
  { id: 'reconocer', titulo: '¿Qué fórmula toca?', subtitulo: 'Tipos mezclados' },
] as const;

export type ParteLeccion = (typeof PARTES_LECCION)[number]['id'];

/** Ejemplo de la experiencia. Los importes visibles se calculan desde estos parámetros. */
export const ESCENARIO_CAPITALIZACION_COMPUESTA = {
  capitalInicialCentimos: 100_000,
  tasaAnualPuntosBase: 500,
  numeroPeriodos: 3,
} as const satisfies ParametrosCapitalizacion;

/** Notación recogida en el Tema 2 (páginas impresas 39, 50 y 51). */
export const NOTACION_CAPITALIZACION_COMPUESTA = [
  { simbolo: 'C₀', significado: 'Capital inicial' },
  { simbolo: 'Cₙ', significado: 'Capital final o montante' },
  { simbolo: 'n', significado: 'Tiempo' },
  { simbolo: 'i', significado: 'Tipo de interés' },
  { simbolo: 'I', significado: 'Intereses totales' },
] as const;

export const FORMULA_CAPITAL_FINAL = 'Cₙ = C₀ × (1+i)ⁿ';
export const FORMULA_INTERESES_TOTALES = 'I = Cₙ − C₀';
export const FORMULA_INTERESES_TOTALES_FACTOR = 'I = C₀ × [(1+i)ⁿ − 1]';
