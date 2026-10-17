/*
 * Equivalencia de capitales en una fecha focal X: varias letras con vencimientos distintos se llevan
 * todas a X para sumarlas o compararlas (por ejemplo, para sustituirlas por una sola letra que vence
 * en X). Cada letra tiene su propio intervalo, t = |vencimiento − X| / base:
 *   - si vence ANTES de X, su capital se lleva HACIA DELANTE (se capitaliza);
 *   - si vence DESPUÉS de X, se lleva HACIA ATRÁS (se descuenta).
 * La ley la fija el enunciado; aquí solo se usan las de las fórmulas del tema:
 *   simple-comercial: delante C · (1 + t · i), atrás N · (1 − t · d);
 *   simple-racional:  delante C · (1 + t · i), atrás C / (1 + t · i);
 *   compuesta:        delante C · (1 + i)^t,   atrás C · (1 + i)^−t.
 * Cada valor se redondea al céntimo. Determinista: la misma semilla da el mismo ejercicio.
 */
import { fechaDescuento, sumarDias, type Fecha } from './remesa.ts';

export type Metodo = 'simple-comercial' | 'simple-racional' | 'compuesta';
export type Sentido = 'delante' | 'atras' | 'igual';

export interface CapitalFocal {
  nominal: number;
  /** Días desde el origen del ejercicio hasta el vencimiento. */
  vence: number;
}

export interface LineaFocal extends CapitalFocal {
  sentido: Sentido;
  /** Días entre el vencimiento y la fecha focal (siempre positivo). */
  dias: number;
  valor: number;
}

const centimos = (v: number) => Math.round(v * 100 + 1e-9) / 100;

export function trasladar(capital: number, t: number, sentido: Sentido, metodo: Metodo, tipo: number): number {
  if (sentido === 'igual' || t === 0) return capital;
  if (sentido === 'delante') return centimos(metodo === 'compuesta' ? capital * (1 + tipo) ** t : capital * (1 + t * tipo));
  if (metodo === 'simple-comercial') return centimos(capital * (1 - t * tipo));
  if (metodo === 'simple-racional') return centimos(capital / (1 + t * tipo));
  return centimos(capital * (1 + tipo) ** -t);
}

export function valorEnFocal(capitales: readonly CapitalFocal[], focal: number, metodo: Metodo, tipo: number, base: 360 | 365): { lineas: LineaFocal[]; total: number } {
  const lineas = capitales.map((c) => {
    const sentido: Sentido = c.vence < focal ? 'delante' : c.vence > focal ? 'atras' : 'igual';
    const dias = Math.abs(c.vence - focal);
    return { ...c, sentido, dias, valor: trasladar(c.nominal, dias / base, sentido, metodo, tipo) };
  });
  return { lineas, total: centimos(lineas.reduce((s, l) => s + l.valor, 0)) };
}

/**
 * El ejemplo de la explicación: la fecha focal X y tres letras, una que vence 40 días antes de X y dos
 * que vencen 300 y 50 días después. Régimen simple al 5 %, año comercial.
 */
export const FOCAL_EJEMPLO = {
  focal: 100,
  capitales: [
    { nominal: 2000, vence: 60 },
    { nominal: 5000, vence: 400 },
    { nominal: 3000, vence: 150 },
  ] as CapitalFocal[],
  metodo: 'simple-comercial' as Metodo,
  tipo: 0.05,
  base: 360 as const,
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

export interface EjercicioFocal {
  /** Fecha de hoy (cuando se plantea la operación). */
  hoy: Fecha;
  focal: Fecha;
  diasFocal: number;
  vencimientos: Fecha[];
  capitales: CapitalFocal[];
  metodo: Metodo;
  tipo: number;
  base: 360 | 365;
}

/**
 * Un ejercicio de práctica: tres letras y una fecha focal con al menos una letra antes y otra
 * después (en orden aleatorio). Todo dentro de un año desde hoy.
 */
export function generarFocal(semilla: number): EjercicioFocal {
  const azar = aleatorio(semilla * 69069 + 13);
  const entre = (a: number, b: number) => a + Math.floor(azar() * (b - a + 1));
  const hoy = fechaDescuento(semilla);
  const diasFocal = entre(90, 200);
  const antes = entre(20, diasFocal - 20);
  const despues = entre(diasFocal + 20, 360);
  const otra = azar() < 0.5 ? entre(10, diasFocal - 10) : entre(diasFocal + 10, 360);
  const vences = [antes, despues, otra === antes || otra === despues ? otra + 1 : otra];
  // Desordenadas: la letra 1 no siempre es la primera en vencer.
  const giro = entre(0, 2);
  const ordenados = [...vences.slice(giro), ...vences.slice(0, giro)];
  const capitales = ordenados.map((vence) => ({ nominal: entre(8, 80) * 100, vence }));
  const metodo = (['simple-comercial', 'simple-racional', 'compuesta'] as const)[entre(0, 2)]!;
  return {
    hoy,
    focal: sumarDias(hoy, diasFocal),
    diasFocal,
    vencimientos: capitales.map((c) => sumarDias(hoy, c.vence)),
    capitales,
    metodo,
    tipo: entre(30, 90) / 1000,
    base: metodo === 'compuesta' ? 365 : azar() < 0.5 ? 360 : 365,
  };
}
