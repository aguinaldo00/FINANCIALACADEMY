/*
 * Fórmulas de capitalización simple y compuesta tal como se aplican en el examen: con la fórmula
 * directa y redondeando solo el resultado (la lección paso a paso redondea cada cierre anual para
 * poder enseñar los importes; aquí no).
 *
 * Los tipos van en tanto por uno (0,05 = 5 %) y el tiempo en la misma unidad que el tipo.
 */

function comprobarPositivo(valor: number, nombre: string): void {
  if (!Number.isFinite(valor) || valor <= 0) throw new RangeError(`${nombre} debe ser un número positivo.`);
}

function comprobarTipo(i: number): void {
  if (!Number.isFinite(i) || i <= -1) throw new RangeError('El tipo de interés debe ser mayor que −1 (en tanto por uno).');
}

/** Factor de capitalización compuesta (1 + i)ⁿ. */
export function factorCompuesto(i: number, n: number): number {
  comprobarTipo(i);
  if (!Number.isFinite(n) || n < 0) throw new RangeError('El tiempo no puede ser negativo.');
  return (1 + i) ** n;
}

/** Cₙ = C₀ · (1 + i)ⁿ */
export function capitalFinalCompuesta(c0: number, i: number, n: number): number {
  comprobarPositivo(c0, 'C₀');
  return c0 * factorCompuesto(i, n);
}

/** C₀ = Cₙ / (1 + i)ⁿ */
export function capitalInicialCompuesta(cn: number, i: number, n: number): number {
  comprobarPositivo(cn, 'Cₙ');
  return cn / factorCompuesto(i, n);
}

/** n = log(Cₙ / C₀) / log(1 + i) */
export function tiempoCompuesta(c0: number, cn: number, i: number): number {
  comprobarPositivo(c0, 'C₀');
  comprobarPositivo(cn, 'Cₙ');
  comprobarTipo(i);
  if (i === 0) throw new RangeError('Con tipo cero el capital no crece: no hay tiempo que despejar.');
  return Math.log10(cn / c0) / Math.log10(1 + i);
}

/** i = (Cₙ / C₀)^(1/n) − 1  (raíz n-ésima, no cuadrada) */
export function tipoCompuesta(c0: number, cn: number, n: number): number {
  comprobarPositivo(c0, 'C₀');
  comprobarPositivo(cn, 'Cₙ');
  comprobarPositivo(n, 'n');
  return (cn / c0) ** (1 / n) - 1;
}

/** Capitalización simple: I = C₀ · n · i */
export function interesesSimple(c0: number, i: number, n: number): number {
  comprobarPositivo(c0, 'C₀');
  comprobarTipo(i);
  return c0 * n * i;
}

/** Capitalización simple: Cₙ = C₀ · (1 + n · i) */
export function capitalFinalSimple(c0: number, i: number, n: number): number {
  comprobarPositivo(c0, 'C₀');
  comprobarTipo(i);
  return c0 * (1 + n * i);
}

/** Redondeo a céntimos (mitad hacia arriba) para presentar importes. */
export function redondearCentimos(euros: number): number {
  return Math.round((euros + Number.EPSILON) * 100) / 100;
}

export interface DuracionDesglosada {
  anos: number;
  meses: number;
  dias: number;
  /** Pasos intermedios con dos decimales, para enseñarlos igual que el libro. */
  anosDecimal: number;
  mesesDecimal: number;
  diasDecimal: number;
}

/**
 * Convierte años con decimales en años, meses y días como hace el libro: se toma n con dos
 * decimales, la parte decimal × 12 da meses (dos decimales) y la parte decimal × 30 da días
 * (redondeados). Ejemplo del libro: 1,62 años → 7,44 meses → 13 días.
 */
export function desglosarAnos(anosConDecimales: number): DuracionDesglosada {
  if (!Number.isFinite(anosConDecimales) || anosConDecimales < 0) throw new RangeError('El tiempo no puede ser negativo.');
  const anosDecimal = Math.round(anosConDecimales * 100) / 100;
  const anos = Math.trunc(anosDecimal);
  const mesesDecimal = Math.round((anosDecimal - anos) * 12 * 100) / 100;
  const meses = Math.trunc(mesesDecimal);
  const diasDecimal = Math.round((mesesDecimal - meses) * 30 * 100) / 100;
  return { anos, meses, dias: Math.round(diasDecimal), anosDecimal, mesesDecimal, diasDecimal };
}
