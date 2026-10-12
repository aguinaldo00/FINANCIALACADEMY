/*
 * Ejercicios de práctica del laboratorio: datos aleatorios pero reproducibles (la misma semilla da el
 * mismo ejercicio), dentro de rangos «de libro» y coherentes entre sí: los datos que dependen de
 * otros (Cₙ a partir de C₀, i y n) se calculan con la ley de la fórmula y se redondean al céntimo,
 * como en un enunciado. Se marcan siempre como «Ejercicio de práctica»: no son del libro.
 * El comprobador resuelve con los datos tal como se presentan, así que la respuesta es exacta.
 */
import { aleatorio } from '../exam.ts';
import { formatear } from './expresion.ts';
import { LABORATORIOS } from './laboratorio.ts';
import { convertirDuracion, convertirTipo, type Convenio, type Regimen, type Unidad } from './periodos.ts';

export interface EjercicioGenerado {
  semilla: number;
  /** Datos como los escribiría un enunciado: «12.110,47 €», «6,25 %», «3», «90/360». */
  datos: Record<string, string>;
}

const redondear = (v: number) => Math.round(v * 100) / 100;
const euros = (v: number) => `${formatear(v, Number.isInteger(v) ? 0 : 2)} €`;
const porcentaje = (v: number) => {
  const r = Number((v * 100).toFixed(2));
  return `${formatear(r, (String(r).split('.')[1] ?? '').length)} %`;
};

/** Genera un ejercicio de práctica para una fórmula (null si la fórmula no calcula una incógnita). */
export function generarEjercicio(idFormula: string, semilla: number): EjercicioGenerado | null {
  const lab = LABORATORIOS[idFormula];
  if (!lab) return null;
  const azar = aleatorio(semilla * 2654435761);
  const entre = (min: number, max: number, paso: number) => min + Math.floor(azar() * (Math.round((max - min) / paso) + 1)) * paso;
  const elegir = <T>(lista: readonly T[]) => lista[Math.floor(azar() * lista.length)]!;

  const c0 = entre(1000, 50000, 50);
  const i = Number(entre(0.01, 0.12, 0.0025).toFixed(4));
  const n = entre(2, 10, 1);
  const m = elegir([2, 3, 4, 12] as const);
  const cnSimple = redondear(c0 * (1 + n * i));
  const cnCompuesta = redondear(c0 * (1 + i) ** n);
  const nominal = entre(1000, 30000, 50);
  const dias = entre(15, 180, 5);
  const d = Number(entre(0.02, 0.1, 0.0025).toFixed(4));

  const textos: Record<string, Record<string, string>> = {
    'simple-intereses': { C_0: euros(c0), n: String(n), i: porcentaje(i) },
    'simple-montante': { C_0: euros(c0), n: String(n), i: porcentaje(i) },
    'simple-capital-inicial': { C_n: euros(cnSimple), n: String(n), i: porcentaje(i) },
    'simple-tipo': { C_0: euros(c0), C_n: euros(cnSimple), n: String(n) },
    'simple-tiempo': { C_0: euros(c0), C_n: euros(cnSimple), i: porcentaje(i) },
    'simple-fraccionado': { i: porcentaje(i), m: String(m) },
    'compuesta-montante': { C_0: euros(c0), i: porcentaje(i), n: String(n) },
    'compuesta-intereses': { C_0: euros(c0), i: porcentaje(i), n: String(n) },
    'compuesta-capital-inicial': { C_n: euros(cnCompuesta), i: porcentaje(i), n: String(n) },
    'compuesta-tiempo': { C_0: euros(c0), C_n: euros(cnCompuesta), i: porcentaje(i) },
    'compuesta-tipo': { C_0: euros(c0), C_n: euros(cnCompuesta), n: String(n) },
    'compuesta-equivalentes': { i: porcentaje(i), m: String(m) },
    'compuesta-tae': { J_m: porcentaje(i), m: String(m) },
    'descuento-comercial': { N: euros(nominal), n: `${dias}/360`, d: porcentaje(d) },
    'descuento-racional': { C_n: euros(nominal), n: `${dias}/360`, i: porcentaje(d) },
    'descuento-compuesto-racional': { C_n: euros(nominal), n: String(entre(2, 6, 1)), i: porcentaje(d) },
    'descuento-compuesto-comercial': { N: euros(nominal), n: String(entre(2, 6, 1)), d: porcentaje(d) },
  };
  const datos = textos[idFormula];
  return datos ? { semilla, datos } : null;
}

/** Semilla nueva para «Otro ejercicio» (visible y reproducible: 1–99999). */
export const nuevaSemilla = (anterior = 0): number => ((anterior * 7919 + 104729) % 99991) + 1;

/* ------------------------------------------------------------------------ unidades de tiempo */

export interface PreguntaTiempo {
  semilla: number;
  modo: 'duracion' | 'tipo';
  /** Cantidad (duración) o tipo en tanto por uno. */
  valor: number;
  de: Unidad;
  a: Unidad;
  convenio: Convenio;
  regimen: Regimen;
  /** La respuesta exacta (sin redondear). */
  resultado: number;
  /** Lo que daría repartir en proporción: en compuesta, el error típico. */
  proporcional: number;
}

const TODAS: readonly Unidad[] = ['año', 'semestre', 'cuatrimestre', 'trimestre', 'mes', 'dia'];
/** Rangos «de libro» de cada unidad: cantidad (duración) y tipo (tanto por uno), con su paso. */
const CANTIDAD: Record<Unidad, [number, number, number]> = { año: [0.5, 5, 0.5], semestre: [1, 8, 1], cuatrimestre: [1, 9, 1], trimestre: [1, 10, 1], mes: [1, 30, 1], dia: [15, 400, 5] };
const TIPO: Record<Unidad, [number, number, number]> = { año: [0.02, 0.12, 0.005], semestre: [0.01, 0.06, 0.005], cuatrimestre: [0.01, 0.04, 0.0025], trimestre: [0.005, 0.03, 0.0025], mes: [0.0025, 0.015, 0.0025], dia: [0.0001, 0.0005, 0.0001] };

/**
 * Ejercicio aleatorio de unidades de tiempo: pasar una duración, o un tipo de interés (en simple o en
 * compuesta), de una unidad a otra. Reproducible con la semilla. Con días, el convenio (360 o 365)
 * también sale al azar, como en los enunciados.
 */
export function generarPreguntaTiempo(semilla: number, modo: 'duracion' | 'tipo', regimen?: Regimen): PreguntaTiempo {
  const azar = aleatorio(semilla * 2654435761 + (modo === 'tipo' ? 17 : 5));
  const elegir = <T>(lista: readonly T[]) => lista[Math.floor(azar() * lista.length)]!;
  const entre = ([min, max, paso]: [number, number, number]) => Number((min + Math.floor(azar() * (Math.round((max - min) / paso) + 1)) * paso).toFixed(4));
  // Un tipo se da por año o por una fracción del año (no por día); la duración, en cualquier unidad.
  const de = elegir(modo === 'tipo' ? TODAS.filter((u) => u !== 'dia') : TODAS);
  const a = elegir(TODAS.filter((u) => u !== de));
  const convenio: Convenio = de === 'dia' || a === 'dia' ? elegir([360, 365] as const) : 360;
  const reg: Regimen = regimen ?? elegir(['simple', 'compuesta'] as const);
  if (modo === 'duracion') {
    const valor = entre(CANTIDAD[de]);
    const r = convertirDuracion(valor, de, a, convenio).resultado;
    return { semilla, modo, valor, de, a, convenio, regimen: reg, resultado: r, proporcional: r };
  }
  const valor = entre(TIPO[de]);
  const c = convertirTipo(valor, de, a, reg, convenio);
  return { semilla, modo, valor, de, a, convenio, regimen: reg, resultado: c.resultado, proporcional: c.proporcional };
}
