/*
 * Unidades de tiempo del temario y paso de cualquiera a cualquier otra. Es la matriz de conversión
 * de duraciones del plan (§3, §9.4): la usan las animaciones del calendario, el conversor del
 * laboratorio y, más adelante, los ejercicios. Solo convierte DURACIONES; los tipos de interés tienen
 * sus propias reglas (proporcional en simple, equivalente en compuesta).
 *
 * Unidades: año, semestre (m = 2), cuatrimestre (3), trimestre (4), mes (12) y día, con año
 * comercial (360) o civil (365) según diga el enunciado. Bimestre y quincena solo se mencionan.
 *
 * Camino de la conversión, el mismo que se enseña:
 *  - sin días, o con año comercial: por los meses (cada unidad mide un número fijo de meses; en el
 *    año comercial el mes tiene 30 días);
 *  - con días de año civil: por el año (un mes civil no tiene un número fijo de días).
 */
export type Unidad = 'año' | 'semestre' | 'cuatrimestre' | 'trimestre' | 'mes' | 'dia';
export type Convenio = 360 | 365;

export interface DatosUnidad {
  id: Unidad;
  singular: string;
  plural: string;
  /** Cuántas caben en un año (m); el día depende del convenio. */
  porAño: (convenio: Convenio) => number;
}

export const UNIDADES: readonly DatosUnidad[] = [
  { id: 'año', singular: 'año', plural: 'años', porAño: () => 1 },
  { id: 'semestre', singular: 'semestre', plural: 'semestres', porAño: () => 2 },
  { id: 'cuatrimestre', singular: 'cuatrimestre', plural: 'cuatrimestres', porAño: () => 3 },
  { id: 'trimestre', singular: 'trimestre', plural: 'trimestres', porAño: () => 4 },
  { id: 'mes', singular: 'mes', plural: 'meses', porAño: () => 12 },
  { id: 'dia', singular: 'día', plural: 'días', porAño: (c) => c },
];

export const unidad = (id: Unidad): DatosUnidad => UNIDADES.find((u) => u.id === id)!;

/** Nombre con la cantidad: 1 semestre, 1,5 cuatrimestres. */
export const nombreUnidad = (id: Unidad, cantidad: number): string => (Math.abs(cantidad - 1) < 1e-9 ? unidad(id).singular : unidad(id).plural);

/** Lo que mide una unidad en meses (en días, según el convenio: 30 días por mes en el comercial). */
export const mesesDe = (id: Unidad, convenio: Convenio): number => 12 / unidad(id).porAño(convenio);

/** Lo que mide una unidad en días, con el convenio del enunciado. */
export const diasDe = (id: Unidad, convenio: Convenio): number => convenio / unidad(id).porAño(convenio);

/** ¿Hay que decir el convenio? Solo si interviene el día. */
export const necesitaConvenio = (de: Unidad, a: Unidad): boolean => de === 'dia' || a === 'dia';

export type Camino = 'meses' | 'dias' | 'año';

export interface Conversion {
  cantidad: number;
  de: Unidad;
  a: Unidad;
  convenio: Convenio;
  resultado: number;
  /** Por dónde se pasa: los meses, los días (año comercial) o el año (año civil). */
  camino: Camino;
  /** Lo que mide cada unidad en la unidad común del camino (6 meses, 4 meses…). */
  medidaDe: number;
  medidaA: number;
}

/** Pasa una duración de una unidad a otra. El resultado no se redondea. */
export function convertirDuracion(cantidad: number, de: Unidad, a: Unidad, convenio: Convenio = 360): Conversion {
  const conDias = necesitaConvenio(de, a);
  const camino: Camino = !conDias ? 'meses' : convenio === 360 ? 'dias' : 'año';
  const medida = (u: Unidad) => (camino === 'meses' ? mesesDe(u, convenio) : camino === 'dias' ? diasDe(u, convenio) : 1 / unidad(u).porAño(convenio));
  const medidaDe = medida(de);
  const medidaA = medida(a);
  return { cantidad, de, a, convenio, resultado: (cantidad * medidaDe) / medidaA, camino, medidaDe, medidaA };
}

/** Duración total en años de una cantidad en años, meses y días (los días según el convenio). */
export function añosDeDuracionMixta(años: number, meses: number, dias: number, convenio: Convenio): number {
  return años + meses / 12 + dias / convenio;
}
