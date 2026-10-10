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
