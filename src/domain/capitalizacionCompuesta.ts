export interface ParametrosCapitalizacion {
  capitalInicialCentimos: number;
  tasaAnualPuntosBase: number;
  numeroPeriodos: number;
}

export interface PeriodoCapitalizacion {
  numeroPeriodo: number;
  capitalInicialCentimos: number;
  interesGeneradoCentimos: number;
  capitalFinalCentimos: number;
}

export interface ProyeccionCapitalizacion extends ParametrosCapitalizacion {
  periodos: PeriodoCapitalizacion[];
  capitalFinalCentimos: number;
}

const PUNTOS_BASE_COMPLETOS = 10_000n;
const MAXIMO_PERIODOS = 1_000;
const MAXIMO_SEGURO = BigInt(Number.MAX_SAFE_INTEGER);

function redondearMitadArriba(numerador: bigint, denominador: bigint): bigint {
  return (numerador + denominador / 2n) / denominador;
}

function numeroSeguro(valor: bigint): number {
  if (valor > MAXIMO_SEGURO) throw new RangeError('El capital supera el rango monetario seguro.');
  return Number(valor);
}

/** Calcula intereses anuales sobre el capital vigente y redondea cada cierre a céntimos. */
export function calcularCapitalizacionCompuesta(
  parametros: ParametrosCapitalizacion,
): ProyeccionCapitalizacion {
  const { capitalInicialCentimos, tasaAnualPuntosBase, numeroPeriodos } = parametros;
  if (!Number.isSafeInteger(capitalInicialCentimos) || capitalInicialCentimos <= 0) {
    throw new RangeError('El capital inicial debe ser un importe positivo expresado en céntimos.');
  }
  if (!Number.isSafeInteger(tasaAnualPuntosBase) || tasaAnualPuntosBase < 0) {
    throw new RangeError('La tasa anual debe expresarse en puntos base no negativos.');
  }
  if (!Number.isSafeInteger(numeroPeriodos) || numeroPeriodos < 1 || numeroPeriodos > MAXIMO_PERIODOS) {
    throw new RangeError('El número de periodos debe estar entre 1 y 1.000.');
  }

  const tasa = BigInt(tasaAnualPuntosBase);
  let capitalActualCentimos = BigInt(capitalInicialCentimos);
  const periodos: PeriodoCapitalizacion[] = [];

  for (let indice = 0; indice < numeroPeriodos; indice++) {
    const interes = redondearMitadArriba(capitalActualCentimos * tasa, PUNTOS_BASE_COMPLETOS);
    const capitalFinal = capitalActualCentimos + interes;
    periodos.push({
      numeroPeriodo: indice + 1,
      capitalInicialCentimos: numeroSeguro(capitalActualCentimos),
      interesGeneradoCentimos: numeroSeguro(interes),
      capitalFinalCentimos: numeroSeguro(capitalFinal),
    });
    capitalActualCentimos = capitalFinal;
  }

  return {
    ...parametros,
    periodos,
    capitalFinalCentimos: numeroSeguro(capitalActualCentimos),
  };
}

export function formatearEuros(centimos: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centimos / 100);
}

export function formatearPorcentaje(puntosBase: number): string {
  const porcentaje = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 })
    .format(puntosBase / 100);
  return porcentaje + ' %';
}

export function formatearTasaDecimal(puntosBase: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(puntosBase / 10_000);
}
