/*
 * Remesa de efectos (fórmula 17 del Tema 2): varias letras que se llevan al banco el mismo día y
 * vencen en fechas distintas. Cada letra se liquida por separado con su propio plazo:
 *   Dc = N · n · d, con n = días / 360 (año comercial) o días / 365 (civil);
 *   comisión = el mayor entre un % del nominal y un mínimo; más los gastos de cada letra.
 * Valor líquido = nominal total − descuentos − comisiones − gastos. Cada importe se redondea al
 * céntimo, como en una liquidación bancaria. Determinista: la misma semilla da la misma remesa.
 */

export interface Letra {
  nominal: number;
  dias: number;
}

export interface CondicionesRemesa {
  /** Tipo de descuento anual, en tanto por uno. */
  d: number;
  /** 360 (año comercial) o 365 (año civil). */
  base: 360 | 365;
  /** Comisión de cobro, en tanto por uno sobre el nominal, con su mínimo por letra. */
  comision: number;
  minimo: number;
  /** Gastos fijos por letra (correo…). */
  gastos: number;
}

export interface LineaLiquidacion extends Letra {
  descuento: number;
  comision: number;
  /** ¿Se ha cobrado el mínimo en vez del porcentaje? */
  minimoAplicado: boolean;
  gastos: number;
  liquido: number;
}

export interface Liquidacion {
  lineas: LineaLiquidacion[];
  nominal: number;
  descuento: number;
  comision: number;
  gastos: number;
  liquido: number;
}

const centimos = (v: number) => Math.round(v * 100 + 1e-9) / 100;

export function liquidarRemesa(letras: readonly Letra[], c: CondicionesRemesa): Liquidacion {
  const lineas = letras.map((l) => {
    const descuento = centimos(l.nominal * (l.dias / c.base) * c.d);
    const porcentaje = centimos(l.nominal * c.comision);
    const comision = Math.max(porcentaje, c.minimo);
    const liquido = centimos(l.nominal - descuento - comision - c.gastos);
    return { ...l, descuento, comision, minimoAplicado: porcentaje < c.minimo, gastos: c.gastos, liquido };
  });
  const suma = (k: 'nominal' | 'descuento' | 'comision' | 'gastos' | 'liquido') => centimos(lineas.reduce((s, x) => s + x[k], 0));
  return { lineas, nominal: suma('nominal'), descuento: suma('descuento'), comision: suma('comision'), gastos: suma('gastos'), liquido: suma('liquido') };
}

/** El ejemplo de la explicación: tres letras a 40, 50 y 300 días, en las condiciones del pagaré del temario. */
export const REMESA_EJEMPLO: { letras: Letra[]; condiciones: CondicionesRemesa } = {
  letras: [
    { nominal: 1200, dias: 40 },
    { nominal: 800, dias: 50 },
    { nominal: 3000, dias: 300 },
  ],
  condiciones: { d: 0.05, base: 360, comision: 0.01, minimo: 10, gastos: 3 },
};

function aleatorio(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Una remesa de práctica: tres letras con plazos distintos (uno corto, uno medio y uno largo, sin
 * pasar del año), nominales redondos y condiciones como las del temario. Al menos una letra es lo
 * bastante pequeña para que se cobre el mínimo de comisión.
 */
export function generarRemesa(semilla: number): { letras: Letra[]; condiciones: CondicionesRemesa } {
  const azar = aleatorio(semilla * 2654435761 + 91);
  const entre = (a: number, b: number, paso = 1) => a + Math.floor(azar() * ((b - a) / paso + 1)) * paso;
  const d = entre(30, 90, 5) / 1000; // 3 % – 9 %
  const comision = [0.005, 0.0075, 0.01][entre(0, 2)]!;
  const minimo = [6, 8, 10][entre(0, 2)]!;
  const letras: Letra[] = [
    { nominal: entre(4, 20) * 100, dias: entre(20, 60) },
    { nominal: entre(10, 60) * 100, dias: entre(61, 150) },
    { nominal: entre(15, 80) * 100, dias: entre(151, 330) },
  ];
  // La pequeña: el % no llega al mínimo.
  letras[0]!.nominal = Math.min(letras[0]!.nominal, Math.floor((minimo / comision) / 100) * 100 - 100 || 400);
  return { letras, condiciones: { d, base: azar() < 0.5 ? 360 : 365, comision, minimo, gastos: entre(2, 4) } };
}

/* ------------------------------------------------------------------------------- fechas */

export interface Fecha {
  dia: number;
  /** 1 = enero … 12 = diciembre. */
  mes: number;
  anio: number;
}

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'] as const;

const aUtc = (f: Fecha) => Date.UTC(f.anio, f.mes - 1, f.dia);
const deUtc = (ms: number): Fecha => {
  const d = new Date(ms);
  return { dia: d.getUTCDate(), mes: d.getUTCMonth() + 1, anio: d.getUTCFullYear() };
};
const diasDelMes = (mes: number, anio: number) => new Date(Date.UTC(anio, mes, 0)).getUTCDate();

export const sumarDias = (f: Fecha, dias: number): Fecha => deUtc(aUtc(f) + dias * 86400000);

/** Días entre dos fechas: no cuenta el día del descuento y sí el del vencimiento. */
export const diasEntre = (desde: Fecha, hasta: Fecha): number => Math.round((aUtc(hasta) - aUtc(desde)) / 86400000);

export function textoFecha(f: Fecha, conAnio = true): string {
  return `${f.dia} de ${MESES[f.mes - 1]}${conAnio ? ` de ${f.anio}` : ''}`;
}

/**
 * Cómo se cuentan los días a mano, mes a mes: lo que queda del mes del descuento, los meses enteros
 * y los días del mes del vencimiento. Del 10 de marzo al 19 de abril: 21 (marzo) + 19 (abril) = 40.
 */
export function desgloseDias(desde: Fecha, hasta: Fecha): { mes: string; dias: number }[] {
  const partes: { mes: string; dias: number }[] = [];
  let { mes, anio } = desde;
  let dia = desde.dia;
  while (anio < hasta.anio || (anio === hasta.anio && mes < hasta.mes)) {
    const quedan = diasDelMes(mes, anio) - dia;
    if (quedan > 0) partes.push({ mes: MESES[mes - 1]!, dias: quedan });
    dia = 0;
    mes += 1;
    if (mes > 12) { mes = 1; anio += 1; }
  }
  if (hasta.dia - dia > 0) partes.push({ mes: MESES[hasta.mes - 1]!, dias: hasta.dia - dia });
  return partes;
}

/** El día del descuento de una remesa de práctica (del 1 al 28, para que todos los meses valgan). */
export function fechaDescuento(semilla: number): Fecha {
  const azar = aleatorio(semilla * 40503 + 7);
  return { dia: 1 + Math.floor(azar() * 28), mes: 1 + Math.floor(azar() * 12), anio: 2026 };
}
