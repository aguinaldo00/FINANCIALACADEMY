/*
 * Cálculo financiero del Tema 2 (capitalización simple, compuesta y descuento), tal como se aplica
 * en el examen: fórmula directa y redondeo solo del resultado en euros.
 *
 * Convenciones del tema:
 *  - Los tipos van en tanto por uno (7 % → 0,07).
 *  - El tiempo n va en la misma unidad que el tipo (regla de homogeneidad): con tipo anual, n en años.
 *  - En simple, el tipo fraccionado es proporcional (iₘ = i / m). En compuesta no: se usan tantos
 *    equivalentes, iₘ = (1 + i)^(1/m) − 1.
 *
 * Las funciones de capitalización compuesta que ya existían siguen en formulasCompuesta.ts; aquí se
 * reexportan para que el tema tenga un solo punto de entrada.
 */
import {
  capitalFinalCompuesta,
  capitalFinalSimple,
  capitalInicialCompuesta,
  desglosarAnos,
  factorCompuesto,
  interesesSimple,
  redondearCentimos,
  tiempoCompuesta,
  tipoCompuesta,
} from './formulasCompuesta.ts';

export {
  capitalFinalCompuesta,
  capitalFinalSimple,
  capitalInicialCompuesta,
  desglosarAnos,
  factorCompuesto,
  interesesSimple,
  redondearCentimos,
  tiempoCompuesta,
  tipoCompuesta,
};

function positivo(valor: number, nombre: string): void {
  if (!Number.isFinite(valor) || valor <= 0) throw new RangeError(`${nombre} debe ser un número positivo.`);
}

function tipoValido(i: number, nombre = 'El tipo de interés'): void {
  if (!Number.isFinite(i) || i <= -1) throw new RangeError(`${nombre} debe ser mayor que −1 (en tanto por uno).`);
}

/* ------------------------------------------------------------------------- capitalización simple */

/** F3 · C₀ = Cₙ / (1 + n · i) */
export function capitalInicialSimple(cn: number, i: number, n: number): number {
  positivo(cn, 'Cₙ');
  tipoValido(i);
  return cn / (1 + n * i);
}

/** F4 · i = (Cₙ − C₀) / (n · C₀) */
export function tipoSimple(c0: number, cn: number, n: number): number {
  positivo(c0, 'C₀');
  positivo(cn, 'Cₙ');
  positivo(n, 'n');
  return (cn - c0) / (n * c0);
}

/** F5 · n = (Cₙ − C₀) / (i · C₀). Sale en la unidad del tipo (años si i es anual). */
export function tiempoSimple(c0: number, cn: number, i: number): number {
  positivo(c0, 'C₀');
  positivo(cn, 'Cₙ');
  if (!Number.isFinite(i) || i === 0) throw new RangeError('Con tipo cero no hay intereses: no hay tiempo que despejar.');
  return (cn - c0) / (i * c0);
}

/** F6 · iₘ = i / m (solo en capitalización simple). */
export function tipoFraccionadoSimple(i: number, m: number): number {
  tipoValido(i);
  positivo(m, 'm');
  return i / m;
}

/** F6 · I = C₀ · iₘ · n · m (n en años y m periodos por año: n · m es el número de periodos). */
export function interesesFraccionadoSimple(c0: number, im: number, n: number, m: number): number {
  positivo(c0, 'C₀');
  tipoValido(im);
  positivo(m, 'm');
  return c0 * im * n * m;
}

/* ----------------------------------------------------------------------- capitalización compuesta */

/** I = C₀ · [(1 + i)ⁿ − 1] */
export function interesesCompuesta(c0: number, i: number, n: number): number {
  positivo(c0, 'C₀');
  return c0 * (factorCompuesto(i, n) - 1);
}

/** Tanto equivalente: iₘ = (1 + i)^(1/m) − 1 */
export function tipoFraccionadoEquivalente(i: number, m: number): number {
  tipoValido(i);
  positivo(m, 'm');
  return (1 + i) ** (1 / m) - 1;
}

/** Tanto anual equivalente: i = (1 + iₘ)ᵐ − 1 */
export function tipoAnualEquivalente(im: number, m: number): number {
  tipoValido(im);
  positivo(m, 'm');
  return (1 + im) ** m - 1;
}

/** TAE = (1 + Jₘ / m)ᵐ − 1, con Jₘ el TIN (nominal anual) y m las capitalizaciones por año. */
export function taeDesdeTin(tin: number, m: number): number {
  positivo(m, 'm');
  tipoValido(tin / m, 'El TIN');
  return (1 + tin / m) ** m - 1;
}

/* --------------------------------------------------------------------------------------- descuento */

/** Descuento simple comercial (sobre el nominal): Dc = N · n · d */
export function descuentoComercialSimple(nominal: number, n: number, d: number): number {
  positivo(nominal, 'N');
  if (!Number.isFinite(d) || d < 0) throw new RangeError('El tipo de descuento no puede ser negativo.');
  return nominal * n * d;
}

/** Efectivo con descuento simple comercial: E = N · (1 − n · d) */
export function efectivoComercialSimple(nominal: number, n: number, d: number): number {
  return nominal - descuentoComercialSimple(nominal, n, d);
}

/** Descuento simple racional (sobre el efectivo): Dr = Cₙ · n · i / (1 + n · i) */
export function descuentoRacionalSimple(cn: number, n: number, i: number): number {
  positivo(cn, 'Cₙ');
  tipoValido(i);
  return (cn * n * i) / (1 + n * i);
}

/** Descuento compuesto racional: Dr = Cₙ · [1 − (1 + i)⁻ⁿ] */
export function descuentoRacionalCompuesto(cn: number, n: number, i: number): number {
  positivo(cn, 'Cₙ');
  return cn * (1 - 1 / factorCompuesto(i, n));
}

/** Descuento compuesto comercial: Dc = N · [1 − (1 − d)ⁿ] */
export function descuentoComercialCompuesto(nominal: number, n: number, d: number): number {
  positivo(nominal, 'N');
  if (!Number.isFinite(d) || d < 0 || d >= 1) throw new RangeError('El tipo de descuento debe estar entre 0 y 1.');
  return nominal * (1 - (1 - d) ** n);
}

/** Comisión en porcentaje del nominal con un mínimo en euros (p. ej. 1 %, mínimo 10 €). */
export function comisionConMinimo(nominal: number, porcentaje: number, minimo: number): number {
  return Math.max(nominal * porcentaje, minimo);
}

/** Valor líquido = Nominal − Descuento − Comisiones − Gastos */
export function valorLiquido(nominal: number, descuento: number, comisiones: number, gastos: number): number {
  return nominal - descuento - comisiones - gastos;
}
